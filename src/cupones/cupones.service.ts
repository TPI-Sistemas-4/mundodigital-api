import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCuponDto } from './dto/create-cupon.dto';
import { UpdateCuponDto } from './dto/update-cupon.dto';

@Injectable()
export class CuponesService {
    constructor(private readonly prismaService: PrismaService) { }

    async create(dto: CreateCuponDto) {
        // 1. Código único — verificar que no exista
        const existente = await this.prismaService.cupones.findUnique({
            where: { codigo: dto.codigo.toUpperCase() },
        });
        if (existente) {
            throw new ConflictException(
                `Ya existe un cupón con el código "${dto.codigo}".`,
            );
        }

        // 2. Validar cliente si se envió
        if (dto.idcliente) {
            const cliente = await this.prismaService.clientes.findUnique({
                where: { idcliente: dto.idcliente },
            });
            if (!cliente || !cliente.activo) {
                throw new NotFoundException(
                    `Cliente con id ${dto.idcliente} no encontrado o inactivo.`,
                );
            }
        }

        // 3. Validar promoción si se envió
        if (dto.idpromocion) {
            const promo = await this.prismaService.promociones.findUnique({
                where: { idpromocion: dto.idpromocion },
            });
            if (!promo || promo.eliminada) {
                throw new NotFoundException(
                    `Promoción con id ${dto.idpromocion} no encontrada.`,
                );
            }
            if (!promo.activa) {
                throw new BadRequestException(
                    `La promoción con id ${dto.idpromocion} no está activa.`,
                );
            }
        }

        // 4. Crear el cupón
        const cupon = await this.prismaService.cupones.create({
            data: {
                codigo: dto.codigo.toUpperCase(),
                descuentoporcentaje: dto.descuentoporcentaje,
                idcliente: dto.idcliente ?? null,
                idpromocion: dto.idpromocion ?? null,
                fechavencimiento: dto.fechavencimiento
                    ? new Date(dto.fechavencimiento)
                    : null,
                activo: true,
            },
            include: {
                clientes: {
                    select: { idcliente: true, nombre: true, apellido: true, email: true },
                },
                promociones: {
                    select: { idpromocion: true, nombre: true },
                },
            },
        });

        return cupon;
    }

    async findAll() {
        return this.prismaService.cupones.findMany({
            where: { activo: true, fechavencimiento: { gte: new Date() } },
            include: {
            clientes: {
                select: { idcliente: true, nombre: true, apellido: true, email: true },
            },
            promociones: {
                select: {
                idpromocion: true,
                nombre: true,
                detallepromocion: {
                    select: {
                    idproducto: true,
                    descuentoporcentaje: true,
                    },
                },
                },
            },
            },
            
            orderBy: { fechavencimiento: 'asc' },
        })
    }

    async findOne(id: number) {
        const cupon = await this.prismaService.cupones.findUnique({
            where: { idcupon: id },
            include: {
                clientes: {
                    select: { idcliente: true, nombre: true, apellido: true, email: true },
                },
                promociones: {
                    select: { idpromocion: true, nombre: true },
                },
            },
        });
        if (!cupon) throw new NotFoundException(`Cupón ${id} no encontrado.`);
        return cupon;
    }

    /** Genera un código único aleatorio de 8 caracteres */
    async generarCodigo(): Promise<{ codigo: string }> {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let codigo: string;
        let existe = true;

        do {
            codigo = Array.from({ length: 8 }, () =>
                chars.charAt(Math.floor(Math.random() * chars.length)),
            ).join('');
            const found = await this.prismaService.cupones.findUnique({
                where: { codigo },
            });
            existe = !!found;
        } while (existe);

        return { codigo };
    }

    async anular(id: number) {
        // 1. Verificar que existe
        const cupon = await this.prismaService.cupones.findUnique({
            where: { idcupon: id },
            include: { usocupones: true },
        });
        if (!cupon) throw new NotFoundException(`Cupon ${id} no encontrado.`);

        // 2. Si ya fue utilizado y ya esta inactivo, no tiene sentido volver a anular
        if (!cupon.activo) {
            throw new BadRequestException(
                `El cupon "${cupon.codigo}" ya se encuentra anulado.`,
            );
        }

        // 3. Soft delete — desactiva y deja el historial intacto
        const actualizado = await this.prismaService.cupones.update({
            where: { idcupon: id },
            data: { activo: false },
            include: {
                clientes: {
                    select: { idcliente: true, nombre: true, apellido: true, email: true },
                },
                promociones: {
                    select: { idpromocion: true, nombre: true },
                },
                usocupones: true,
            },
        });

        const usos = cupon.usocupones.length;
        return {
            ...actualizado,
            mensaje: usos > 0
                ? `Cupon "${cupon.codigo}" anulado. Tiene ${usos} uso(s) registrado(s) en el historial.`
                : `Cupon "${cupon.codigo}" anulado correctamente.`,
        };
    }

    async update(id: number, dto: UpdateCuponDto) {
        // 1. Verificar que existe
        const cupon = await this.prismaService.cupones.findUnique({
            where: { idcupon: id },
            include: { promociones: { include: { detallepromocion: true } } },
        });
        if (!cupon) throw new NotFoundException(`Cupon ${id} no encontrado.`);
        if (!cupon.activo) throw new BadRequestException(`No se puede modificar un cupon anulado.`);

        // 2. Validar cliente si se envía
        if (dto.idcliente !== undefined && dto.idcliente !== null) {
            const cliente = await this.prismaService.clientes.findUnique({
                where: { idcliente: dto.idcliente },
            });
            if (!cliente || !cliente.activo) {
                throw new NotFoundException(`Cliente ${dto.idcliente} no encontrado o inactivo.`);
            }
        }

        // 3. Si tiene promocion asociada, descuento y fecha vienen de ella (no se editan)
        const data: Record<string, unknown> = {};

        if (cupon.idpromocion && cupon.promociones) {
            const promo = cupon.promociones;
            // Respetar reglas de negocio de la promocion
            data.descuentoporcentaje = promo.detallepromocion[0]?.descuentoporcentaje ?? cupon.descuentoporcentaje;
            data.fechavencimiento = promo.fechahasta;
        } else {
            // Sin promocion: se permite editar descuento y fecha
            if (dto.descuentoporcentaje !== undefined) data.descuentoporcentaje = dto.descuentoporcentaje;
            if (dto.fechavencimiento !== undefined) data.fechavencimiento = new Date(dto.fechavencimiento);
        }

        // 4. Cliente: null = general para todos, numero = cliente especifico
        if (dto.idcliente !== undefined) data.idcliente = dto.idcliente ?? null;

        // 5. Estado
        if (dto.activo !== undefined) data.activo = dto.activo;

        const actualizado = await this.prismaService.cupones.update({
            where: { idcupon: id },
            data,
            include: {
                clientes: { select: { idcliente: true, nombre: true, apellido: true, email: true } },
                promociones: { select: { idpromocion: true, nombre: true } },
            },
        });

        return actualizado;
    }

}

