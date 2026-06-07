import { Module, forwardRef } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { PrismaService } from 'src/prisma.service';
import { PuntosService } from 'src/puntos/punto.service';
import { EnviosModule } from 'src/envios/envios.module';

@Module({
  imports: [forwardRef(() => EnviosModule)],
  providers: [VentasService, PrismaService, PuntosService],
  controllers: [VentasController],
  exports: [VentasService],
})
export class VentasModule {}