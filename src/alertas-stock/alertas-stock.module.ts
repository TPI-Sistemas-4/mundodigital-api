import { Module } from '@nestjs/common';
import { AlertasStockService } from './alertas-stock.service';
import { AlertasStockController } from './alertas-stock.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [AlertasStockController],
  providers: [AlertasStockService, PrismaService],
})
export class AlertasStockModule {}
