import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateOrdenesCompraDto } from './dto/create-ordenes-compra.dto';

@Injectable()
export class OrdenesCompraService {
  constructor(private readonly prisma: PrismaService) {}

  // RN03 - Las órdenes deben mostrar proveedor, fecha, total y estado
  async findAll(estado?: string) {
    return this.prisma.ordenescompra.findMany({
      where: estado ? { estado } : {},
      include: {
        proveedores: {
          select: { idproveedor: true, razonsocial: true, email: true },
        },
        detalleordencompra: {
          include: {
            productos: {
              select: { idproducto: true, nombre: true, precio: true },
            },
          },
        },
      },
      orderBy: { fechapedido: 'desc' },
    });
  }

  // RN03 - Consulta de detalle de orden con proveedor y productos asociados
  async findOne(id: number) {
    const orden = await this.prisma.ordenescompra.findUnique({
      where: { idorden: id },
      include: {
        proveedores: {
          select: { idproveedor: true, razonsocial: true, email: true, telefono: true },
        },
        detalleordencompra: {
          include: {
            productos: {
              select: { idproducto: true, nombre: true, precio: true },
            },
          },
        },
      },
    });
    if (!orden) throw new NotFoundException(`Orden de compra #${id} no encontrada`);
    return orden;
  }

  // RN03 - Toda orden debe tener proveedor válido, al menos un detalle,
  // cantidades mayores a cero y precios válidos
  // RN04 - La orden se crea con estado "Generada"
  // RN03 - El backend calcula subtotal (cantidad x precioUnitario) y total (suma subtotales)
  async create(dto: CreateOrdenesCompraDto) {

    // RN03 - Validar proveedor existente y activo
    const proveedor = await this.prisma.proveedores.findUnique({
      where: { idproveedor: dto.idProveedor },
    });
    if (!proveedor) throw new NotFoundException(`Proveedor #${dto.idProveedor} no encontrado`);
    if (!proveedor.activo) throw new BadRequestException(`El proveedor #${dto.idProveedor} está inactivo`);

    // RN03 - Validar que todos los productos existan
    const idsProductos = dto.detalle.map(d => d.idProducto);
    const productos = await this.prisma.productos.findMany({
      where: { idproducto: { in: idsProductos } },
    });
    if (productos.length !== idsProductos.length) {
      throw new NotFoundException('Uno o más productos del detalle no existen');
    }

    // RN03 - Calcular subtotales y total
    const detalleConSubtotales = dto.detalle.map(d => ({
      idproducto:     d.idProducto,
      cantidad:       d.cantidad,
      preciounitario: d.precioUnitario,
      subtotal:       d.cantidad * d.precioUnitario,
    }));

    const total = detalleConSubtotales.reduce((acc, d) => acc + Number(d.subtotal), 0);

    // RN04 - Estado inicial siempre "Generada"
    return this.prisma.ordenescompra.create({
      data: {
        idproveedor:   dto.idProveedor,
        observaciones: dto.observaciones,
        estado:        'Generada',
        total,
        detalleordencompra: {
          create: detalleConSubtotales,
        },
      },
      include: {
        proveedores:        { select: { idproveedor: true, razonsocial: true } },
        detalleordencompra: { include: { productos: { select: { idproducto: true, nombre: true } } } },
      },
    });
  }
  
  update(id: number, dto: any) {
    return `This action updates a #${id} ordenesCompra`;
  }

  remove(id: number) {
    return `This action removes a #${id} ordenesCompra`;
  }

  async getResumenEstados() {
    const ordenes = await this.prisma.ordenescompra.findMany({
      select: { estado: true },
    });

    const resumen = { Generada: 0, Recibida: 0, Ingresada: 0 };
    ordenes.forEach((o) => {
      const estado = o.estado ?? 'Generada';
      if (estado in resumen) resumen[estado]++;
    });

    return {
      total: ordenes.length,
      distribucion: [
        { estado: 'Generada',  cantidad: resumen['Generada']  },
        { estado: 'Recibida',  cantidad: resumen['Recibida']  },
        { estado: 'Ingresada', cantidad: resumen['Ingresada'] },
      ],
    };
  }
}