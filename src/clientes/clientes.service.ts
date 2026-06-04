import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';

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
}