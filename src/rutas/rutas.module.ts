import { Module } from '@nestjs/common';
import { RutasController } from './rutas.controller';
import { RutasService } from './rutas.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [RutasController],
  providers: [RutasService, PrismaService]
})
export class RutasModule {}
