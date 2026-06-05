import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OrdenesCompraService } from './ordenes-compra.service';
import { CreateOrdenesCompraDto } from './dto/create-ordenes-compra.dto';
import { UpdateOrdenesCompraDto } from './dto/update-ordenes-compra.dto';

@ApiTags('G2 - Ordenes de Compra')
@Controller('ordenes-compra')
export class OrdenesCompraController {
  constructor(private readonly ordenesCompraService: OrdenesCompraService) {}

  // RN03 - Listado de órdenes con filtro opcional por estado
  @Get()
  @ApiOperation({ summary: 'Listar órdenes de compra. Filtrar por estado: Generada | Recibida | Cancelada' })
  @ApiQuery({ name: 'estado', required: false, enum: ['Generada', 'Recibida', 'Cancelada'] })
  findAll(@Query('estado') estado?: string) {
    return this.ordenesCompraService.findAll(estado);
  }

  // RN03 - Detalle completo de una orden con proveedor y productos
  @Get(':id')
  @ApiOperation({ summary: 'Consultar detalle de una orden de compra' })
  findOne(@Param('id') id: string) {
    return this.ordenesCompraService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear orden de compra con detalle de productos' })
  create(@Body() dto: CreateOrdenesCompraDto) {
    return this.ordenesCompraService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar orden de compra (HU3 - pendiente)' })
  update(@Param('id') id: string, @Body() dto: UpdateOrdenesCompraDto) {
    return this.ordenesCompraService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar orden de compra (no aplica para G2)' })
  remove(@Param('id') id: string) {
    return this.ordenesCompraService.remove(+id);
  }

  /**
   * HU-4: Reporte gráfico de órdenes de compra por estado
   * GET /ordenes-compra/resumen
   */
  @Get('resumen')
  async getResumenEstados() {
    return this.ordenesCompraService.getResumenEstados();
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar una orden en estado Generada (HU5)' })
  cancelar(@Param('id') id: string) {
    return this.ordenesCompraService.cancelar(+id);
  }
}
