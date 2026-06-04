import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create.venta.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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

    @Get(':id')
    @ApiOperation({ summary: 'Visualizar detalle de una venta' })
    @ApiResponse({ status: 200, description: 'Detalle de la venta con productos y montos.' })
    @ApiResponse({ status: 404, description: 'Venta no encontrada.' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.ventasService.findOne(id);
    }
}
