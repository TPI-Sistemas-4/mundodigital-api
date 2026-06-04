import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return await this.prismaService.clientes.findMany();
  }

  async create(dto: CreateClienteDto) {
    // CA: validar email único
    const existente = await this.prismaService.clientes.findUnique({
      where: { email: dto.email },
    });
    if (existente) {
      throw new BadRequestException(
        `Ya existe un cliente registrado con el email ${dto.email}`,
      );
    }

    return await this.prismaService.clientes.create({
      data: {
        nombre:    dto.nombre,
        apellido:  dto.apellido,
        email:     dto.email,
        telefono:  dto.telefono,
        direccion: dto.direccion,
        activo:    true, // Criterio de Aceptacion: se registra automáticamente como activo
      },
    });
  }

  async update(id: number, dto: UpdateClienteDto) {
    // CA: el cliente debe existir antes de modificarlo
    const cliente = await this.prismaService.clientes.findUnique({
        where: { idcliente: id },
    });
    if (!cliente) {
        throw new NotFoundException(`Cliente ${id} no encontrado`);
    }

    // CA: si se modifica el email, validar que no esté en uso por otro cliente
    if (dto.email && dto.email !== cliente.email) {
        const emailEnUso = await this.prismaService.clientes.findUnique({
        where: { email: dto.email },
        });
        if (emailEnUso) {
        throw new BadRequestException(
            `El email ${dto.email} ya está registrado en otro cliente`,
        );
        }
    }

    return await this.prismaService.clientes.update({
        where: { idcliente: id },
        data: {
        nombre:    dto.nombre,
        apellido:  dto.apellido,
        email:     dto.email,
        telefono:  dto.telefono,
        direccion: dto.direccion,
        activo:    dto.activo,
        },
    });
  }

  async findOne(id: number) {
    const cliente = await this.prismaService.clientes.findUnique({
        where: { idcliente: id },
        include: {
        ventas: {
            include: {
            detalleventas: true,
            },
            orderBy: { fechaventa: 'desc' }, // más recientes primero
        },
        },
    });

    if (!cliente) {
        throw new NotFoundException(`Cliente ${id} no encontrado`);
    }

    return cliente;
    }
}