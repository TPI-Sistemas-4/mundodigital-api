import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';

import { CrearEnvioDto } from './dto/crear-envio.dto';
import { EnvioResponseDto } from './dto/envio-response.dto';
import { PrismaService } from 'src/prisma.service';
import { ActualizarEstadoEnvioDto } from './dto/actualizar-estado-envio.dto';

@Injectable()
export class EnviosService {
  constructor(private readonly prisma: PrismaService) {}

  // Mapa de transiciones válidas (CA: solo se permiten estas)
  private readonly TRANSICIONES: Record<string, string> = {
    'Preparado': 'En Camino',
    'En Camino': 'Entregado',
  };

  // ─── HU1: Registrar envío ─────────────────────────────────────────────────
  async registrar(dto: CrearEnvioDto): Promise<EnvioResponseDto> {
    // CA: validar que la venta exista
    const venta = await this.prisma.ventas.findUnique({
      where: { idventa: dto.idventa },
    });
    if (!venta) {
      throw new NotFoundException(`La venta #${dto.idventa} no existe.`);
    }

    // CA: no debe existir más de un envío activo por venta
    const envioExistente = await this.prisma.envios.findFirst({
      where: { idventa: dto.idventa, activo: true },
    });
    if (envioExistente) {
      throw new BadRequestException(
        `La venta #${dto.idventa} ya tiene un envío activo (#${envioExistente.idenvio}).`,
      );
    }

    // Crear envío con estado inicial "Preparado"
    const envio = await this.prisma.envios.create({
      data: {
        idventa:          dto.idventa,
        direccionentrega: dto.direccionentrega,
        observaciones:    dto.observaciones ?? null,
        estado:           'Preparado',
        activo:           true,
      },
    });

    return this.mapResponse(envio);
  }

  // ─── HU4: Actualizar estado del envío ────────────────────────────────────
  async actualizarEstado(
    idenvio: number,
    dto: ActualizarEstadoEnvioDto,
  ): Promise<EnvioResponseDto> {
    // Verificar que el envío exista y esté activo
    const envio = await this.prisma.envios.findFirst({
      where: { idenvio, activo: true },
      include: { asignacionenvio: true },
    });
    if (!envio) {
      throw new NotFoundException(`El envío #${idenvio} no existe o no está activo.`);
    }

    const estadoActual = envio.estado ?? 'Preparado';

    // CA: solo transiciones válidas
    if (this.TRANSICIONES[estadoActual] !== dto.estadonuevo) {
      throw new BadRequestException(
        `Transición inválida: ${estadoActual} → ${dto.estadonuevo}. ` +
        `Desde "${estadoActual}" solo se puede pasar a "${this.TRANSICIONES[estadoActual] ?? 'ningún estado (ya es final)'}".`,
      );
    }

    // CA: para pasar a "En Camino" debe existir asignación
    if (dto.estadonuevo === 'En Camino' && !envio.asignacionenvio) {
      throw new BadRequestException(
        `No se puede pasar a "En Camino" sin vehículo, chofer y ruta asignados.`,
      );
    }

    // Actualizar estado y registrar en tracking — transacción
    const [envioActualizado] = await this.prisma.$transaction([
      this.prisma.envios.update({
        where: { idenvio },
        data: { estado: dto.estadonuevo },
      }),
      this.prisma.trackingenvio.create({
        data: {
          idenvio,
          estadoanterior: estadoActual,
          estadonuevo:    dto.estadonuevo,
          observaciones:  dto.observaciones ?? null,
        },
      }),
    ]);

    return this.mapResponse(envioActualizado);
  }

  // ─── Consultar historial de tracking ─────────────────────────────────────
  async obtenerTracking(idenvio: number) {
    const envio = await this.prisma.envios.findFirst({
      where: { idenvio, activo: true },
    });
    if (!envio) {
      throw new NotFoundException(`El envío #${idenvio} no existe o no está activo.`);
    }

    return this.prisma.trackingenvio.findMany({
      where: { idenvio },
      orderBy: { fechacambio: 'asc' },
    });
  }

  // ─── Utilidad ─────────────────────────────────────────────────────────────
  private mapResponse(envio: any): EnvioResponseDto {
    return {
      idenvio:          envio.idenvio,
      idventa:          envio.idventa,
      direccionentrega: envio.direccionentrega,
      estado:           envio.estado,
      fechaenvio:       envio.fechaenvio,
      observaciones:    envio.observaciones,
    };
  }
}