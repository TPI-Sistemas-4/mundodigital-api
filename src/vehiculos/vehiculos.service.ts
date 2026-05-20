import { Injectable } from '@nestjs/common';
import { VehiculoResponseDto } from './dto/vehiculo-response.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class VehiculosService {
  constructor(private readonly prisma: PrismaService) {}

  // CA: listar solo vehículos activos (activo: true)
  async findDisponibles(): Promise<VehiculoResponseDto[]> {
    const vehiculos = await this.prisma.vehiculos.findMany({
      where: { activo: true },
      orderBy: { patente: 'asc' },
    });

    return vehiculos.map((v) => ({
      idvehiculo:     v.idvehiculo,
      patente:        v.patente,
      marca:          v.marca,
      modelo:         v.modelo,
      anio:           v.anio,
      capacidadcarga: v.capacidadcarga ? Number(v.capacidadcarga) : null,
      estado:         v.estado ?? 'Disponible',
    }));
  }
}