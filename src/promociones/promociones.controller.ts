import { Body, Controller, Get, Post, Put, Delete, Param } from '@nestjs/common';
import { PromocionesService } from './promociones.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';

@ApiTags('G4 - Promociones')
@Controller('promociones')
export class PromocionesController {
    constructor(private readonly promocionesService: PromocionesService) { }

    @Get()
    async findAll() {
        return await this.promocionesService.findAll();
    }

    @Get('buscar/:nombre')
    @ApiOperation({ summary: 'Buscar promociones por nombre' })
    buscarPorNombre(@Param('nombre') nombre: string) {
        return this.promocionesService.buscarPorNombre(nombre);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Consultar promoción por ID' })
    findOne(@Param('id') id: string) {
        return this.promocionesService.findOne(Number(id));
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

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar lógicamente una promoción' })
    remove(@Param('id') id: string) {
        return this.promocionesService.remove(Number(id));
    }

}
