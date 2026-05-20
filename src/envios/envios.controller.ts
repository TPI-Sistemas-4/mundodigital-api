import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EnviosService } from './envios.service';
import { CrearEnvioDto } from './dto/crear-envio.dto';

@ApiTags('Envios')
@Controller('envios')
export class EnviosController {
  constructor(private readonly enviosService: EnviosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un nuevo envío asociado a una venta' })
  @ApiResponse({ status: 201, description: 'Envío creado con estado Preparado.' })
  @ApiResponse({ status: 400, description: 'La venta ya tiene un envío activo.' })
  @ApiResponse({ status: 404, description: 'La venta no existe.' })
  registrar(@Body() dto: CrearEnvioDto) {
    return this.enviosService.registrar(dto);
  }
}