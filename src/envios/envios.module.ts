import { Module } from '@nestjs/common';
import { EnviosController } from './envios.controller';
import { EnviosService } from './envios.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [EnviosController],
  providers: [EnviosService, PrismaService]
})
export class EnviosModule {}
