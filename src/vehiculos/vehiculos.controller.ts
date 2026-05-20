import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VehiculosService } from './vehiculos.service';

@ApiTags('G5 - Vehiculos')
@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar vehículos disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de vehículos activos.' })
  findDisponibles() {
    return this.vehiculosService.findDisponibles();
  }
}