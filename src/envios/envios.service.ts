import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';

import { CrearEnvioDto } from './dto/crear-envio.dto';
import { EnvioResponseDto } from './dto/envio-response.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class EnviosService {
  constructor(private readonly prisma: PrismaService) {}

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