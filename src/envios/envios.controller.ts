import { Controller, Post, Body, HttpCode, HttpStatus, Param, ParseIntPipe, Get, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EnviosService } from './envios.service';
import { CrearEnvioDto } from './dto/crear-envio.dto';
import { ActualizarEstadoEnvioDto } from './dto/actualizar-estado-envio.dto';

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

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Actualizar estado del envío' })
  @ApiResponse({ status: 200, description: 'Estado actualizado y registrado en tracking.' })
  @ApiResponse({ status: 400, description: 'Transición inválida o sin asignación.' })
  @ApiResponse({ status: 404, description: 'Envío no encontrado.' })
  actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarEstadoEnvioDto,
  ) {
    return this.enviosService.actualizarEstado(id, dto);
  }

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Consultar historial de estados del envío' })
  @ApiResponse({ status: 200, description: 'Historial de tracking.' })
  @ApiResponse({ status: 404, description: 'Envío no encontrado.' })
  obtenerTracking(@Param('id', ParseIntPipe) id: number) {
    return this.enviosService.obtenerTracking(id);
  }
}