import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCuponDto } from './dto/create-cupon.dto';

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
            where: { activo: true },
            include: {
                clientes: {
                    select: { idcliente: true, nombre: true, apellido: true, email: true },
                },
                promociones: {
                    select: { idpromocion: true, nombre: true },
                },
            },
            orderBy: { idcupon: 'desc' },
        });
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
}

