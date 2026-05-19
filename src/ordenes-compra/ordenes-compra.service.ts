import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

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

  create(dto: any) {
    return 'This action adds a new ordenesCompra';
  }

  update(id: number, dto: any) {
    return `This action updates a #${id} ordenesCompra`;
  }

  remove(id: number) {
    return `This action removes a #${id} ordenesCompra`;
  }
}