import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateVentaDto, EstadoVenta } from './dto/create.venta.dto';
import { EnviosService } from 'src/envios/envios.service';
import { FilterVentaDto } from './dto/filter-venta.dto';
@Injectable()
export class VentasService {
  constructor(private readonly prismaService: PrismaService, private readonly enviosService: EnviosService) {}



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
    const ventaCompleta = await this.prismaService.$transaction(async (tx) => {

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
          preciounitario: productoMap.get(d.idProducto)!.precio,
        })),
      });

      for (const d of dto.detalles) {
        await tx.productos.update({
          where: { idproducto: d.idProducto },
          data:  { stockactual: { decrement: d.cantidad } },
        });
      }

    // ← traer la venta completa con detalles al final
      return tx.ventas.findUnique({
          where: { idventa: venta.idventa },
          include: { detalleventas: true }
        });
      });

      if (!ventaCompleta) {
        throw new NotFoundException(`Error al recuperar la venta recién creada.`);
      }

      console.log('[VentasService] Venta creada:', ventaCompleta.idventa);
      console.log('[VentasService] Llamando a enviosService.registrar...');

      try {
        const envio = await this.enviosService.registrar({
          idventa:          ventaCompleta.idventa,
          direccionentrega: dto.direccionEntrega ?? '',
          observaciones:    'Envío generado automáticamente',
        });
        console.log('[VentasService] Envío creado:', envio);
      } catch (error:any) {
        console.error('[VentasService] Error al crear envío:', error.message);
      }

      return ventaCompleta;
      
    }
    
    async findOne(id: number) {
      const venta = await this.prismaService.ventas.findUnique({
        where: { idventa: id },
        include: {
          detalleventas: {
            include: {
              productos: true, // nombre y precio del producto
            },
          },
          clientes: true, // datos del cliente asociado
        },
      });

      if (!venta) {
        throw new NotFoundException(`Venta ${id} no encontrada`);
      }

      return venta;
    }

    async findWithFilters(filters: FilterVentaDto) {
      const where: any = {};

      // CA: filtrar por cliente
      if (filters.idCliente) {
        where.idcliente = filters.idCliente;
      }

      // CA: filtrar por fecha
      if (filters.fechaDesde || filters.fechaHasta) {
        where.fechaventa = {};
        if (filters.fechaDesde) {
          where.fechaventa.gte = new Date(filters.fechaDesde);
        }
        if (filters.fechaHasta) {
          // CA: incluir todo el día hasta las 23:59:59
          const hasta = new Date(filters.fechaHasta);
          hasta.setHours(23, 59, 59, 999);
          where.fechaventa.lte = hasta;
        }
      }

      // CA: filtrar por estado
      if (filters.estado) {
        where.estado = filters.estado;
      }

      const ventas = await this.prismaService.ventas.findMany({
        where,
        include: { detalleventas: true },
        orderBy: { fechaventa: 'desc' },
      });

      // CA: si no hay resultados, retornar mensaje informativo
      if (ventas.length === 0) {
        return {
          message: 'No se encontraron ventas con los filtros seleccionados',
          data: [],
        };
      }

      return { data: ventas };
    }

    async restaurarStock(idVenta: number, tx: any) {
      const detalles = await tx.detalleventas.findMany({
        where: { idventa: idVenta },
      });

      for (const detalle of detalles) {
        await tx.productos.update({
          where: { idproducto: detalle.idproducto },
          data:  { stockactual: { increment: detalle.cantidad } },
        });
      }
    }

    async cancelar(idVenta: number) {
      // CA: validar que la venta exista
      const venta = await this.prismaService.ventas.findUnique({
        where: { idventa: idVenta },
      });
      if (!venta) {
        throw new NotFoundException(`Venta ${idVenta} no encontrada`);
      }

      // CA: solo se pueden cancelar ventas en estado "Pendiente de entrega"
      if (venta.estado !== EstadoVenta.PENDIENTE) {
        throw new BadRequestException(
          `Solo se pueden cancelar ventas en estado "Pendiente de entrega". ` +
          `Estado actual: "${venta.estado}"`,
        );
      }

      // CA: transacción — cambiar estado y restaurar stock atomicamente
      return await this.prismaService.$transaction(async (tx) => {
        // Cambiar estado a cancelada
        const ventaCancelada = await tx.ventas.update({
          where: { idventa: idVenta },
          data:  { estado: EstadoVenta.CANCELADA },
          include: { detalleventas: true },
        });

        // CA: restaurar stock de cada producto (HU19)
        await this.restaurarStock(idVenta, tx);

        return ventaCancelada;
      });
    }

}