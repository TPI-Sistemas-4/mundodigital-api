import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dto/Usuario.dto';
import { TipoUsuario } from '../../generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class Usuarioervice {
  constructor(private readonly prisma: PrismaService) {}

  // ─── CREATE ──────────────────────────────────────────────────────────────────
  async create(dto: CreateUsuarioDto) {
    const exists = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException(`El email '${dto.email}' ya está registrado`);
    }

    const passwordhash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const usuario = await this.prisma.usuario.create({
      data: {
        email: dto.email,
        passwordhash,
        tipousuario: dto.tipousuario || 'CLIENTE' as TipoUsuario,
      },
    });

    return this.stripHash(usuario);
  }

  // ─── FIND ALL ─────────────────────────────────────────────────────────────────
  async findAll() {
    const usuario = await this.prisma.usuario.findMany({
      orderBy: { idusuario: 'asc' },
    });
    return usuario.map(this.stripHash);
  }

  // ─── FIND ONE ─────────────────────────────────────────────────────────────────
  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { idusuario: id },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return this.stripHash(usuario);
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────────
  async update(id: number, dto: UpdateUsuarioDto) {
    // Verificar que existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { idusuario: id },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    // Si cambia el email, verificar unicidad
    if (dto.email && dto.email !== usuario.email) {
      const conflict = await this.prisma.usuario.findUnique({
        where: { email: dto.email },
      });
      if (conflict) {
        throw new ConflictException(`El email '${dto.email}' ya está en uso`);
      }
    }

    const data: Record<string, unknown> = {};
    if (dto.email) data.email = dto.email;
    if (dto.tipousuario) data.tipousuario = dto.tipousuario;
    if (dto.password) data.passwordhash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const updated = await this.prisma.usuario.update({
      where: { idusuario: id },
      data,
    });

    return this.stripHash(updated);
  }

  // ─── SOFT DELETE ──────────────────────────────────────────────────────────────
  async remove(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { idusuario: id },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    await this.prisma.usuario.update({
      where: { idusuario: id },
      data: { activo: false },
    });

    return { message: `Usuario ${id} desactivado correctamente` };
  }

  // ─── HELPER: nunca exponer el hash ───────────────────────────────────────────
  private stripHash<T extends { passwordhash: string }>(usuario: T) {
    const { passwordhash, ...safe } = usuario;
    return safe;
  }
}