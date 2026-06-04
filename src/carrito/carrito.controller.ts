import { Controller, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CarritoService } from './carrito.service';

@ApiTags('G1 - Ventas')
@Controller('carrito')
export class CarritoController {
  constructor(private readonly carritoService: CarritoService) {}

  @Delete(':idCliente')
  @ApiOperation({ summary: 'Vaciar completamente el carrito de un cliente' })
  @ApiResponse({ status: 200, description: 'Carrito vaciado correctamente.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  async vaciar(@Param('idCliente', ParseIntPipe) idCliente: number) {
    return await this.carritoService.vaciar(idCliente);
  }
}