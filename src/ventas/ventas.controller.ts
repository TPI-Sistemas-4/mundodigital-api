import { Controller, Get, Post, Body } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create.venta.dto';
import { ApiTags } from '@nestjs/swagger';

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
}
