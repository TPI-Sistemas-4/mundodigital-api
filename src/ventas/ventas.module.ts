import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [VentasService, PrismaService],
  controllers: [VentasController]
})
export class VentasModule {}
