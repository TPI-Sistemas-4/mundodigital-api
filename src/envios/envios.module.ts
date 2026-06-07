import { Module } from '@nestjs/common';
import { EnviosController } from './envios.controller';
import { EnviosService } from './envios.service';
import { PrismaService } from 'src/prisma.service';
import { VentasService } from 'src/ventas/ventas.service';

@Module({
  imports: [EnviosModule],
  controllers: [EnviosController],
  providers: [EnviosService, PrismaService, VentasService],
})
export class EnviosModule {}
