import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateVentaDto, EstadoVenta } from './dto/create.venta.dto';
@Injectable()
export class VentasService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
        return await this.prismaService.ventas.findMany({ 
            include: { detalleventas: true }
        });
  }

  async create(dto: CreateVentaDto) {

    // ── RN04: cliente debe existir ────────────────────────────────────────────
    const cliente = await this.prismaService.clientes.findUnique({
      where: { idcliente: dto.idCliente },
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente ${dto.idCliente} no encontrado`);
    }

    // ── RN05: traer productos y verificar stock ───────────────────────────────
    const ids = dto.detalles.map((d) => d.idProducto);
    const productos = await this.prismaService.productos.findMany({
      where: { idproducto: { in: ids } },
    });
    const productoMap = new Map(productos.map((p) => [p.idproducto, p]));

    for (const detalle of dto.detalles) {
      const producto = productoMap.get(detalle.idProducto);
      if (!producto) {
        throw new NotFoundException(`Producto ${detalle.idProducto} no encontrado`);
      }
      if (producto.stockactual && producto.stockactual < detalle.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para "${producto.nombre}": ` +
          `disponible ${producto.stockactual}, solicitado ${detalle.cantidad}`,
        );
      }
    }

    // ── Buscar promociones vigentes a la fecha de la venta ────────────────────
    // Una promoción es vigente si: activa=true AND fechadesde <= ahora <= fechahasta
    // y tiene al menos un producto que coincide con los ítems del pedido
    const ahora = new Date();

    // Buscar promociones vigentes:
    // - generales: detallepromocion con idproducto NULL → aplica a toda la venta
    // - por producto: detallepromocion con idproducto en los ids del pedido
    const promocionesVigentes = await this.prismaService.promociones.findMany({
      where: {
        activa: true,
        fechadesde: { lte: ahora },
        fechahasta:  { gte: ahora },
        detallepromocion: {
          some: {
            OR: [
              { idproducto: { in: ids } },  // aplica a productos del pedido
              { idproducto: null },          // aplica a la venta completa
            ],
          },
        },
      },
      include: {
        detallepromocion: true, // traemos todos para clasificarlos abajo
      },
    });

    // Mapa idProducto → mayor descuento por producto
    const descuentoProductoMap = new Map<number, number>();
    // Mayor descuento general sobre la venta total
    let descuentoGeneralPct = 0;

    for (const promo of promocionesVigentes) {
      for (const detalle of promo.detallepromocion) {
        if (detalle.idproducto === null) {
          // Promoción general: nos quedamos con el porcentaje más alto
          if (detalle.descuentoporcentaje > descuentoGeneralPct) {
            descuentoGeneralPct = detalle.descuentoporcentaje;
          }
        } else if (ids.includes(detalle.idproducto)) {
          // Promoción por producto: mayor descuento para ese producto
          const actual = descuentoProductoMap.get(detalle.idproducto) ?? 0;
          if (detalle.descuentoporcentaje > actual) {
            descuentoProductoMap.set(detalle.idproducto, detalle.descuentoporcentaje);
          }
        }
      }
    }

    // ── Calcular subtotal, descuento y total ──────────────────────────────────
    let subtotal = 0;
    let descuento = 0;

    for (const detalle of dto.detalles) {
      const producto = productoMap.get(detalle.idProducto)!;
      const precio   = Number(producto.precio);
      const linea    = precio * detalle.cantidad;

      // Si el producto tiene descuento propio, tiene prioridad sobre el general
      const pct = descuentoProductoMap.has(detalle.idProducto)
        ? descuentoProductoMap.get(detalle.idProducto)! / 100
        : descuentoGeneralPct / 100;

      subtotal  += linea;
      descuento += linea * pct;
    }

    const total = subtotal - descuento;

    // ── Transacción ───────────────────────────────────────────────────────────
    return await this.prismaService.$transaction(async (tx) => {

      const venta = await tx.ventas.create({
        data: {
          idcliente:           dto.idCliente,
          estado:              dto.estado ?? EstadoVenta.PENDIENTE,         
          subtotal,
          descuento,
          total,
          direccionentrega:    dto.direccionEntrega    ?? null,
          indicacionesentrega: dto.indicacionesEntrega ?? null,
        },
      });

      await tx.detalleventas.createMany({
        data: dto.detalles.map((d) => ({
          idventa:        venta.idventa,
          idproducto:     d.idProducto,
          cantidad:       d.cantidad,
          preciounitario: productoMap.get(d.idProducto)!.precio, // snapshot
        })),
      });

      // RN05: decrementar stock atómicamente
      for (const d of dto.detalles) {
        await tx.productos.update({
          where: { idproducto: d.idProducto },
          data:  { stockactual: { decrement: d.cantidad } },
        });
      }

      return venta;
    });
  }
}