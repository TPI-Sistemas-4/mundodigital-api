import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';

@Injectable()
export class PromocionesService {
    constructor(private readonly prismaService: PrismaService) {}

    async findAll() {
        return await this.prismaService.promociones.findMany();
    }

    async create(dto: CreatePromocionDto) {
    return await this.prismaService.promociones.create({
        data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        fechadesde: new Date(dto.fechaDesde),
        fechahasta: new Date(dto.fechaHasta),
        activa: false,
        detallepromocion: {
                create: dto.detalles.map(d => ({
                descuentoporcentaje: d.descuentoPorcentaje,
                productos: {
                    connect: { idproducto: d.idProducto }
                }
                })),
            },
            },
            include: { detallepromocion: true },
        });
    }
}
    
