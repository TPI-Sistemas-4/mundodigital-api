import { Controller, Post, Get, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { CuponesService } from './cupones.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCuponDto } from './dto/create-cupon.dto';

@ApiTags('G4 - Cupones')
@Controller('cupones')
export class CuponesController {
    constructor(private readonly cuponesService: CuponesService) { }

    @Post()
    @ApiOperation({summary: 'Registrar un cupón'})
    create(@Body() dto: CreateCuponDto) {
        return this.cuponesService.create(dto);
    }

    @Get('generar-codigo')
    @ApiOperation({ summary: 'Generar-codigo — Obtener un código único sugerido' })
    generarCodigo() {
        return this.cuponesService.generarCodigo();
    }

    @Get()
    @ApiOperation({summary: 'Listar todos los cupones activos'})
    findAll() {
        return this.cuponesService.findAll();
    }

    @Get(':id')
    @ApiOperation({summary: 'Obtener un cupón por id'})
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.cuponesService.findOne(id);
    }

    @Patch(':id/anular')
    @ApiOperation({summary: 'Anular (soft delete) un cupon'})
    anular(@Param('id', ParseIntPipe) id: number) {
        return this.cuponesService.anular(id);
    }
}
