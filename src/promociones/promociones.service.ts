import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';

@Injectable()
export class PromocionesService {
    constructor(private readonly prismaService: PrismaService) { }

    private soloFecha(date: Date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    private esAplicable(promocion: any): boolean {
        const hoy = this.soloFecha(new Date());

        const desde = this.soloFecha(new Date(promocion.fechadesde));
        const hasta = this.soloFecha(new Date(promocion.fechahasta));

        return (
            !promocion.eliminada &&
            promocion.activa &&
            desde <= hoy &&
            hoy <= hasta
        );
    }

    async findAll() {
        const promociones = await this.prismaService.promociones.findMany({
            where: {
                eliminada: false,
            },
            include: { 
                detallepromocion: {
                    include: {
                    productos: true
                    }
                }
            },
            orderBy: { updatedat: 'desc' },
        });

        return promociones.map((p) => ({
            ...p,
            esAplicable: this.esAplicable(p),
        }));
    }

    async findOne(id: number) {

        const promocion = await this.prismaService.promociones.findFirst({
            where: {
                idpromocion: id,
                eliminada: false,
            },
            include: {
                detallepromocion: true,
            },
        });

        if (!promocion) {
            throw new NotFoundException('Promoción no encontrada');
        }

        return {
            ...promocion,
            esAplicable: this.esAplicable(promocion),
        };
    }

    async buscarPorNombre(nombre: string) {

        const promociones = await this.prismaService.promociones.findMany({
            where: {
                eliminada: false,
                nombre: {
                    contains: nombre,
                    mode: 'insensitive',
                },
            },
            include: {
                detallepromocion: true,
            },
        });

        if (!promociones.length) {
            throw new NotFoundException(
                'No se encontraron promociones con ese nombre',
            );
        }

        return promociones.map((p) => ({
            ...p,
            esAplicable: this.esAplicable(p),
        }));
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
        const quiereModificarDatos =
            dto.nombre !== undefined ||
            dto.descripcion !== undefined ||
            dto.fechaDesde !== undefined ||
            dto.fechaHasta !== undefined ||
            dto.detalles !== undefined;

        const quiereDesactivar =
            promocion.activa === true &&
            dto.activa === false;

        if (
            promocion.activa &&
            quiereModificarDatos &&
            !quiereDesactivar
        ) {
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
                ...(dto.esGeneral !== undefined && {
                    esGeneral: dto.esGeneral,
                }),
                ...(dto.activa !== undefined && {
                    activa: dto.activa,
                }),

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

