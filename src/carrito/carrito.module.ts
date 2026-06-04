import { Module } from '@nestjs/common';
import { CarritoService } from './carrito.service';
import { CarritoController } from './carrito.controller';

@Module({
  providers: [CarritoService],
  controllers: [CarritoController]
})
export class CarritoModule {}
