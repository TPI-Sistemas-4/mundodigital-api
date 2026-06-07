import { Module, forwardRef } from '@nestjs/common';
import { EnviosController } from './envios.controller';
import { EnviosService } from './envios.service';
import { PrismaService } from 'src/prisma.service';
import { VentasModule } from 'src/ventas/ventas.module';

@Module({
  imports: [forwardRef(() => VentasModule)],
  providers: [EnviosService, PrismaService],
  controllers: [EnviosController],
  exports: [EnviosService],
})
export class EnviosModule {}