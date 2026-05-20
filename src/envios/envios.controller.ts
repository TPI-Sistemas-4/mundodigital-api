import { Controller, Post, Body, HttpCode, HttpStatus, Param, ParseIntPipe, Get, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EnviosService } from './envios.service';
import { CrearEnvioDto } from './dto/crear-envio.dto';
import { ActualizarEstadoEnvioDto } from './dto/actualizar-estado-envio.dto';
import { CrearDetalleEnvioDto } from './dto/crear-detalle-envio.dto';
import { AsignarRecursosDto } from './dto/asignar-recursos.dto';
import { EnvioResponseDto } from './dto/envio-response.dto';

@ApiTags('G5 - Envios')
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

  @Get('venta/:idVenta')
  @ApiOperation({ summary: 'Obtener envío por ID de venta' })
  @ApiParam({ name: 'idVenta', type: Number, description: 'ID de la venta' })
  @ApiResponse({ status: 200, description: 'Envío encontrado.', type: EnvioResponseDto })
  @ApiResponse({ status: 404, description: 'No existe envío para esa venta.' })
  obtenerPorVenta(@Param('idVenta', ParseIntPipe) idVenta: number) {
    return this.enviosService.obtenerPorVenta(idVenta);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener envío por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del envío' })
  @ApiResponse({ status: 200, description: 'Envío encontrado.', type: EnvioResponseDto })
  @ApiResponse({ status: 404, description: 'Envío no encontrado o inactivo.' })
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.enviosService.obtenerPorId(id);
  }



  @Post(':id/detalle')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar productos y cantidades del envío' })
  @ApiResponse({ status: 201, description: 'Detalle registrado correctamente.' })
  @ApiResponse({ status: 400, description: 'Productos inexistentes o detalle vacío.' })
  @ApiResponse({ status: 404, description: 'Envío no encontrado.' })
  registrarDetalle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearDetalleEnvioDto,
  ) {
    return this.enviosService.registrarDetalle(id, dto);
  }

  @Post(':id/asignacion')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Asignar vehículo, chofer y ruta a un envío' })
  @ApiResponse({ status: 201, description: 'Recursos asignados correctamente.' })
  @ApiResponse({ status: 400, description: 'Recurso inexistente o inactivo.' })
  @ApiResponse({ status: 404, description: 'Envío no encontrado.' })
  asignarRecursos(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarRecursosDto,
  ) {
    return this.enviosService.asignarRecursos(id, dto);
  }
}