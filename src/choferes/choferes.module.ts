import { Module } from '@nestjs/common';
import { ChoferesController } from './choferes.controller';
import { ChoferesService } from './choferes.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ChoferesController],
  providers: [ChoferesService, PrismaService]
})
export class ChoferesModule {}
