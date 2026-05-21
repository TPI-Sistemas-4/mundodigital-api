import { Controller, Post, Get, Param, Body, ParseIntPipe } from '@nestjs/common';
import { CuponesService } from './cupones.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateCuponDto } from './dto/create-cupon.dto';

@ApiTags('G4 - Cupones')
@Controller('cupones')
export class CuponesController {
    constructor(private readonly cuponesService: CuponesService) { }

    /** POST /cupones — Registrar un cupón */
    @Post()
    create(@Body() dto: CreateCuponDto) {
        return this.cuponesService.create(dto);
    }

    /** GET /cupones/generar-codigo — Obtener un código único sugerido */
    @Get('generar-codigo')
    generarCodigo() {
        return this.cuponesService.generarCodigo();
    }

    /** GET /cupones — Listar todos los cupones activos */
    @Get()
    findAll() {
        return this.cuponesService.findAll();
    }

    /** GET /cupones/:id — Obtener un cupón por id */
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.cuponesService.findOne(id);
    }
}
