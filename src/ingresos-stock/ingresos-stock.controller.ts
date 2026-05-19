import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { IngresosStockService } from './ingresos-stock.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('G3 - Almacen')
@Controller('ingresos-stock')
export class IngresosStockController {
  constructor(private readonly ingresosStockService: IngresosStockService) {}

  @Post(':idorden')
  @ApiOperation({ summary: 'Registrar ingreso de stock desde una orden recibida' })
  @ApiParam({ name: 'idorden', type: Number, description: 'ID de la orden en estado "Recibida"' })
  @ApiResponse({ status: 201, description: 'Ingreso registrado correctamente' })
  @ApiResponse({ status: 400, description: 'La orden no está en estado "Recibida"' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  async registrarIngreso(@Param('idorden', ParseIntPipe) idorden: number) {
    return this.ingresosStockService.registrarIngreso(idorden);
  }

  @Get()
  @ApiOperation({ summary: 'Consultar historial de ingresos de stock' })
  @ApiResponse({ status: 200, description: 'Listado de ingresos con detalle de productos y órdenes asociadas' })
  async findAll() {
    return this.ingresosStockService.findAll();
  }
}