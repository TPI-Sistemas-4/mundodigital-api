import { Controller, Get, Post, Body, Param, ParseIntPipe, Query, Patch } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create.venta.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterVentaDto } from './dto/filter-venta.dto';

@ApiTags('G1 - Ventas')
@Controller('ventas')
export class VentasController {
    constructor(private readonly ventasService: VentasService) {}

    @Get()
    async findAll() {
        return await this.ventasService.findAll();
    }

    @Post()
    async create(@Body() createVentaDto: CreateVentaDto) {
        return await this.ventasService.create(createVentaDto);
    }

    @Get('filtrar')
    @ApiOperation({ summary: 'Filtrar ventas por cliente, fecha o estado' })
    @ApiResponse({ status: 200, description: 'Listado de ventas filtradas.' })
    async filtrar(@Query() filters: FilterVentaDto) {
        return await this.ventasService.findWithFilters(filters);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Visualizar detalle de una venta' })
    @ApiResponse({ status: 200, description: 'Detalle de la venta con productos y montos.' })
    @ApiResponse({ status: 404, description: 'Venta no encontrada.' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.ventasService.findOne(id);
    }

    @Patch(':id/cancelar')
    @ApiOperation({ summary: 'Cancelar una venta en estado Pendiente de entrega' })
    @ApiResponse({ status: 200, description: 'Venta cancelada y stock restaurado.' })
    @ApiResponse({ status: 400, description: 'La venta no está en estado Pendiente de entrega.' })
    @ApiResponse({ status: 404, description: 'Venta no encontrada.' })
    async cancelar(@Param('id', ParseIntPipe) id: number) {
    return await this.ventasService.cancelar(id);
    }
}
