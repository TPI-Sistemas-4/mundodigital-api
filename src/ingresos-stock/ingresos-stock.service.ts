import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class IngresosStockService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── HU-7: Registrar ingreso de stock desde una orden recibida ────────────
  async registrarIngreso(idorden: number): Promise<any> {

    // RN-02: Solo órdenes en estado "Recibida"
    const orden = await this.prisma.ordenescompra.findUnique({
      where: { idorden },
      include: {
        detalleordencompra: {
          include: {
            productos: { select: { idproducto: true, nombre: true, stockactual: true } },
          },
        },
      },
    });

    if (!orden) throw new NotFoundException(`Orden #${idorden} no encontrada`);
    if (orden.estado !== 'Recibida')
      throw new BadRequestException(`La orden #${idorden} no está en estado "Recibida" (estado actual: ${orden.estado})`);

    // Transacción: ingreso + detalle + stock + estado orden + alerta (RN-01, RN-03, RN-04, RN-07)
    return this.prisma.$transaction(async (tx) => {

      // RN-01: Crear ingreso asociado a la orden
      const ingreso = await tx.ingresosstock.create({
        data: {
          idorden,
          observaciones: `Ingreso automático desde orden #${idorden}`,
        },
      });

      // RN-04: Actualizar stock y registrar detalle por cada producto
      for (const detalle of orden.detalleordencompra) {
        await tx.detalleingresostock.create({
          data: {
            idingreso:  ingreso.idingreso,
            idproducto: detalle.idproducto,
            cantidad:   detalle.cantidad,
          },
        });

        await tx.productos.update({
          where: { idproducto: detalle.idproducto },
          data:  { stockactual: { increment: detalle.cantidad } },
        });

        // RN-07: Alerta por producto ingresado
        await tx.alertasingresostock.create({
          data: {
            idingreso: ingreso.idingreso,
            tipo:    'INGRESO',
            mensaje: `[ID:${detalle.idproducto}] ${detalle.productos.nombre}: ingreso de ${detalle.cantidad} unidades (orden #${idorden})`,
            leida:   false,
          },
        });
      }

      // RN-03: Cambiar estado de la orden a "Ingresada"
      await tx.ordenescompra.update({
        where: { idorden },
        data:  { estado: 'Ingresada' },
      });

      return { idingreso: ingreso.idingreso, idorden, mensaje: 'Ingreso registrado correctamente' };
    });
  }

  // ─── HU-7: Consultar ingresos registrados ────────────────────────────────
  async findAll() {
    return this.prisma.ingresosstock.findMany({
      include: {
        ordenescompra: {
          select: { idorden: true, estado: true, proveedores: { select: { razonsocial: true } } },
        },
        detalleingresostock: {
          include: {
            productos: { select: { nombre: true, stockactual: true } },
          },
        },
      },
      orderBy: { fechaingreso: 'desc' },
    });
  }
}