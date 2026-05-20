import { Injectable } from '@nestjs/common';
import { RutaResponseDto } from './dto/ruta-response.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RutasService {
  constructor(private readonly prisma: PrismaService) {}

  // CA: listar solo rutas activas (activo: true)
  async findActivas(): Promise<RutaResponseDto[]> {
    const rutas = await this.prisma.rutas.findMany({
      where: { activo: true },
      orderBy: { nombreruta: 'asc' },
    });

    return rutas.map((r) => ({
      idruta:     r.idruta,
      nombreruta: r.nombreruta,
      zona:       r.zona,
      estado:     r.estado ?? 'Pendiente',
    }));
  }
}