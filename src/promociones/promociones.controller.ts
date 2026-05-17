import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { PromocionesService } from './promociones.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';

@Controller('promociones')
export class PromocionesController {
    constructor(private readonly promocionesService: PromocionesService) { }

    @Get()
    async findAll() {
        return await this.promocionesService.findAll();
    }

    @Post()
    @ApiOperation({ summary: 'Registrar una promoción con sus productos' })
    create(@Body() dto: CreatePromocionDto) {
        return this.promocionesService.create(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar una promoción' })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdatePromocionDto,
    ) {
        return await this.promocionesService.update(Number(id), dto);
    }

}
