import { Module } from '@nestjs/common';
import { CuponesService } from './cupones.service';
import { CuponesController } from './cupones.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [CuponesService, PrismaService],
  controllers: [CuponesController]
})
export class CuponesModule {}
