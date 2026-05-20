import { Injectable } from '@nestjs/common';
import { ChoferResponseDto } from './dto/chofer-response.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ChoferesService {
  constructor(private readonly prisma: PrismaService) {}

  // CA: listar solo choferes activos (activo: true)
  async findDisponibles(): Promise<ChoferResponseDto[]> {
    const choferes = await this.prisma.choferes.findMany({
      where: { activo: true },
      orderBy: { apellido: 'asc' },
    });

    return choferes.map((c) => ({
      idchofer:         c.idchofer,
      nombre:           c.nombre,
      apellido:         c.apellido,
      dni:              c.dni,
      licenciaconducir: c.licenciaconducir,
      estado:           c.estado ?? 'Activo',
    }));
  }
}