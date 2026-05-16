import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [ProductosService, PrismaService],
  controllers: [ProductosController]
})
export class ProductosModule {}
