import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateProveedoreDto } from './dto/create-proveedore.dto';
import { UpdateProveedoreDto } from './dto/update-proveedore.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProveedoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProveedoreDto) {
    const existe = await this.prisma.proveedores.findUnique({
      where: { cuit: dto.cuit },
    });
    if (existe) throw new ConflictException(`Ya existe un proveedor con CUIT ${dto.cuit}`);

    return this.prisma.proveedores.create({ data: dto });
  }

  async findAll() {
    return this.prisma.proveedores.findMany({
      where: { activo: true },
      orderBy: { razonsocial: 'asc' },
    });
  }

  async findOne(id: number) {
    const proveedor = await this.prisma.proveedores.findUnique({
      where: { idproveedor: id },
    });
    if (!proveedor) throw new NotFoundException(`Proveedor #${id} no encontrado`);
    return proveedor;
  }

  async update(id: number, dto: UpdateProveedoreDto) {
    await this.findOne(id); // valida existencia
    return this.prisma.proveedores.update({
      where: { idproveedor: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // valida existencia
    return this.prisma.proveedores.update({
      where: { idproveedor: id },
      data: { activo: false },
    });
  }
}