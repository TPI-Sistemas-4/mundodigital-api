import { Module } from '@nestjs/common';
import { IngresosStockController } from './ingresos-stock.controller';
import { IngresosStockService } from './ingresos-stock.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [IngresosStockController],
  providers: [IngresosStockService, PrismaService],
})
export class IngresosStockModule {}
