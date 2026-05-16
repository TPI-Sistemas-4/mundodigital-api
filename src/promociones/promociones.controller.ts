import { Controller, Get } from '@nestjs/common';
import { PromocionesService } from './promociones.service';

@Controller('promociones')
export class PromocionesController {
    constructor(private readonly promocionesService: PromocionesService) {}

    @Get()
    async findAll() {
        return await this.promocionesService.findAll();
    }
}
