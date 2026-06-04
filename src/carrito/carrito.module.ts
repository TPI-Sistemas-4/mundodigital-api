import { Module } from '@nestjs/common';
import { CarritoService } from './carrito.service';
import { CarritoController } from './carrito.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [CarritoService, PrismaService],
  controllers: [CarritoController],
})
export class CarritoModule {}
