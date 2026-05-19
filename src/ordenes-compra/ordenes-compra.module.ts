import { Module } from '@nestjs/common';
import { OrdenesCompraService } from './ordenes-compra.service';
import { OrdenesCompraController } from './ordenes-compra.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [OrdenesCompraController],
  providers: [OrdenesCompraService, PrismaService],
})
export class OrdenesCompraModule {}
