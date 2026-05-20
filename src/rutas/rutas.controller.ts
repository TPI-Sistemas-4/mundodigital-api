import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RutasService } from './rutas.service';

@ApiTags('G5 - Rutas')
@Controller('rutas')
export class RutasController {
  constructor(private readonly rutasService: RutasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar rutas activas' })
  @ApiResponse({ status: 200, description: 'Lista de rutas activas.' })
  findActivas() {
    return this.rutasService.findActivas();
  }
}