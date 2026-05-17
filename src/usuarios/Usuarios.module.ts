import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsuariosController,  } from './Usuarios.controller';
import { Usuarioervice } from './Usuarios.service';

@Module({
  providers: [Usuarioervice, PrismaService],
  controllers: [UsuariosController]
})
export class UsuariosModule {}
