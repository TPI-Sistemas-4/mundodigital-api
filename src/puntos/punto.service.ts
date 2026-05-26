import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePuntoDto } from './dto/create-punto.dto';
 
// Regla: cada $1500 = 1 punto
const IMPORTE_POR_PUNTO = Number(process.env.IMPORTE_POR_PUNTO ?? 1500);
 
@Injectable()
export class PuntosService {
  constructor(private readonly prismaService: PrismaService) {}
 
  calcularPuntos(total: number): number {
    return Math.floor(total / IMPORTE_POR_PUNTO);
  }
 
  async registrar(dto: CreatePuntoDto) {
    // 1. Obtener la venta con cliente y detalle
    const venta = await this.prismaService.ventas.findUnique({
      where: { idventa: dto.idventa },
      include: {
        clientes: { select: { idcliente: true, nombre: true, apellido: true, email: true } },
        detalleventas: true,
      },
    });
    if (!venta) throw new NotFoundException(`Venta ${dto.idventa} no encontrada.`);
 
    // 2. Verificar que no se registraron puntos ya para esta venta
    const yaRegistrado = await this.prismaService.puntoscliente.findFirst({
      where: { idventa: dto.idventa },
    });
    if (yaRegistrado) {
      throw new BadRequestException(`Ya se registraron puntos para la venta #${dto.idventa}.`);
    }
 
    // 3. Calcular puntos sobre el total de la venta
    const total = Number(venta.total);
    const puntosotorgados = this.calcularPuntos(total);
    if (puntosotorgados <= 0) {
      throw new BadRequestException(
        `El total de la venta ($${total.toLocaleString('es-AR')}) no alcanza el minimo para otorgar puntos (minimo: $${IMPORTE_POR_PUNTO.toLocaleString('es-AR')}).`,
      );
    }
 
    // 4. Registrar
    const registro = await this.prismaService.puntoscliente.create({
      data: {
        idcliente: venta.idcliente,
        idventa: venta.idventa,
        puntosotorgados,
        concepto: `Venta #${venta.idventa} por $${total.toLocaleString('es-AR')}`,
        fecha: new Date(),
      },
      include: {
        clientes: { select: { idcliente: true, nombre: true, apellido: true, email: true } },
        ventas: { select: { idventa: true, total: true, fechaventa: true } },
      },
    });
 
    // 5. Saldo actualizado
    const saldo = await this.getSaldo(venta.idcliente);
 
    return {
      registro,
      venta: {
        idventa: venta.idventa,
        total,
        cliente: venta.clientes,
        detalleventas: venta.detalleventas,
      },
      puntosotorgados,
      saldo,
      regla: `$${IMPORTE_POR_PUNTO.toLocaleString('es-AR')} = 1 punto`,
    };
  }
 
  async getSaldo(idcliente: number): Promise<number> {
    const result = await this.prismaService.puntoscliente.aggregate({
      where: { idcliente },
      _sum: { puntosotorgados: true },
    });
    return result._sum.puntosotorgados ?? 0;
  }
 
  async getHistorial(idcliente: number) {
    const cliente = await this.prismaService.clientes.findUnique({
      where: { idcliente },
    });
    if (!cliente) throw new NotFoundException(`Cliente ${idcliente} no encontrado.`);
 
    const movimientos = await this.prismaService.puntoscliente.findMany({
      where: { idcliente },
      include: {
        ventas: { select: { idventa: true, total: true, fechaventa: true } },
      },
      orderBy: { fecha: 'desc' },
    });
 
    const saldo = movimientos.reduce((acc, m) => acc + m.puntosotorgados, 0);
 
    return {
      cliente: { idcliente: cliente.idcliente, nombre: cliente.nombre, apellido: cliente.apellido, email: cliente.email },
      saldo,
      movimientos,
      regla: `$${IMPORTE_POR_PUNTO.toLocaleString('es-AR')} = 1 punto`,
    };
  }
 
  async findAll() {
    const grupos = await this.prismaService.puntoscliente.groupBy({
      by: ['idcliente'],
      _sum: { puntosotorgados: true },
      orderBy: { _sum: { puntosotorgados: 'desc' } },
    });
 
    const clientes = await this.prismaService.clientes.findMany({
      where: { idcliente: { in: grupos.map(g => g.idcliente) } },
      select: { idcliente: true, nombre: true, apellido: true, email: true },
    });
 
    return grupos.map(g => ({
      cliente: clientes.find(c => c.idcliente === g.idcliente),
      saldo: g._sum.puntosotorgados ?? 0,
    }));
  }
 
  getRegla() {
    return { importePorPunto: IMPORTE_POR_PUNTO, descripcion: `$${IMPORTE_POR_PUNTO.toLocaleString('es-AR')} = 1 punto` };
  }
}