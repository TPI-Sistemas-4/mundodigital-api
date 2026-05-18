import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';

@Injectable()
export class PromocionesService {
    constructor(private readonly prismaService: PrismaService) { }

    async findAll() {
        return await this.prismaService.promociones.findMany({
            where: {
                eliminada: false,
            },
            include: {
                detallepromocion: true,
            },
        });
    }

    async create(dto: CreatePromocionDto) {
        const promo = await this.prismaService.promociones.create({
            data: {
                nombre: dto.nombre,
                descripcion: dto.descripcion,
                fechadesde: new Date(dto.fechaDesde),
                fechahasta: new Date(dto.fechaHasta),
                activa: false,
            },
        })

        await this.prismaService.detallepromocion.createMany({
            data: dto.detalles.map(d => ({
                idpromocion: promo.idpromocion,
                idproducto: d.idProducto ?? null,
                descuentoporcentaje: d.descuentoPorcentaje,
            })),
        })

        return this.prismaService.promociones.findUnique({
            where: { idpromocion: promo.idpromocion },
            include: { detallepromocion: true },
        })
    }

    async update(id: number, dto: UpdatePromocionDto) {

        const promocion = await this.prismaService.promociones.findUnique({
            where: { idpromocion: id },
            include: { detallepromocion: true },
        });

        if (!promocion) {
            throw new NotFoundException('La promoción no existe');
        }

        // No permitir modificar promociones activas
        if (promocion.activa) {
            throw new BadRequestException(
                'No se puede modificar una promoción activa',
            );
        }

        // Validación de fechas
        const fechaDesde = dto.fechaDesde
            ? new Date(dto.fechaDesde)
            : promocion.fechadesde;

        const fechaHasta = dto.fechaHasta
            ? new Date(dto.fechaHasta)
            : promocion.fechahasta;

        if (fechaDesde >= fechaHasta) {
            throw new BadRequestException(
                'La fecha desde debe ser menor a la fecha hasta',
            );
        }

        // Actualizar promoción
        await this.prismaService.promociones.update({
            where: { idpromocion: id },
            data: {
                nombre: dto.nombre,
                descripcion: dto.descripcion,
                fechadesde: fechaDesde,
                fechahasta: fechaHasta,
            },
        });

        // Actualizar detalles si vienen informados
        if (dto.detalles) {

            // Elimina detalles actuales
            await this.prismaService.detallepromocion.deleteMany({
                where: { idpromocion: id },
            });

            // Inserta nuevos detalles
            await this.prismaService.detallepromocion.createMany({
                data: dto.detalles.map(d => ({
                    idpromocion: id,
                    idproducto: d.idProducto ?? null,
                    descuentoporcentaje: d.descuentoPorcentaje,
                })),
            });
        }

        return {
            message: 'Promoción actualizada correctamente',
            data: await this.prismaService.promociones.findUnique({
                where: { idpromocion: id },
                include: { detallepromocion: true },
            }),
        };
    }

    async remove(id: number) {

        const promocion = await this.prismaService.promociones.findUnique({
            where: {
                idpromocion: id,
            },
            include: {
                cupones: true,
            },
        });

        if (!promocion) {
            throw new NotFoundException('La promoción no existe');
        }

        // Verificar cupones activos
        const tieneCuponesActivos = promocion.cupones.some(
            (c) => c.activo === true,
        );

        if (tieneCuponesActivos) {
            throw new BadRequestException(
                'No se puede eliminar una promoción con cupones activos emitidos',
            );
        }

        // Eliminación lógica
        await this.prismaService.promociones.update({
            where: {
                idpromocion: id,
            },
            data: {
                eliminada: true,
                activa: false,
            },
        });

        return {
            message: 'Promoción eliminada correctamente',
        };
    }
}

