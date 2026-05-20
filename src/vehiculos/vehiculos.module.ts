import { Module } from '@nestjs/common';
import { VehiculosController } from './vehiculos.controller';
import { VehiculosService } from './vehiculos.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [VehiculosController],
  providers: [VehiculosService, PrismaService]
})
export class VehiculosModule {}
