import { Module } from '@nestjs/common';
import { PromocionesService } from './promociones.service';
import { PromocionesController } from './promociones.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [PromocionesService, PrismaService],
  controllers: [PromocionesController]
})
export class PromocionesModule {}
