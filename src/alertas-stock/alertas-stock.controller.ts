import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AlertasStockService } from './alertas-stock.service';
import { CreateAlertasStockDto } from './dto/create-alertas-stock.dto';
import { UpdateAlertasStockDto } from './dto/update-alertas-stock.dto';

@ApiTags('G2 - Alertas de Stock')
@Controller('alertas-stock')
export class AlertasStockController {
  constructor(private readonly alertasStockService: AlertasStockService) {}

  // HU2 de Grupo 2 - Visualizar alertas pendientes enviadas por G3
  @Get()
  @ApiOperation({ summary: 'Listar alertas de reposición pendientes enviadas por G3' })
  findAll() {
    return this.alertasStockService.findAll();
  }

  @Get('stock')
  async getAlertasStock() {
    await this.alertasStockService.generarAlertasStock();
    return this.alertasStockService.findAlertasStock();
  }

  @Patch(':id/leida')
  async marcarLeida(@Param('id', ParseIntPipe) id: number) {
    return this.alertasStockService.marcarLeida(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear alerta de stock (uso exclusivo G3)' })
  create(@Body() dto: CreateAlertasStockDto) {
    return this.alertasStockService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertasStockService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAlertasStockDto) {
    return this.alertasStockService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alertasStockService.remove(+id);
  }
}