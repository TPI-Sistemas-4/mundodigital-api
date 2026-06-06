import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { PrismaService } from 'src/prisma.service';
import { EnviosService } from 'src/envios/envios.service';
import { PuntosService } from 'src/puntos/punto.service';

@Module({
  providers: [VentasService, PrismaService, EnviosService, PuntosService],
  controllers: [VentasController],
  exports: [EnviosService],
})
export class VentasModule {}
