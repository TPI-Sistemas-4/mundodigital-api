import { Module } from '@nestjs/common';
import { PuntosController } from './punto.controller';
import { PuntosService } from './punto.service';
import { PrismaService } from '../prisma.service';
 
@Module({
  controllers: [PuntosController],
  providers: [PuntosService, PrismaService],
  exports: [PuntosService],
})
export class PuntosModule {}