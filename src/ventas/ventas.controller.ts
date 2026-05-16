import { Controller, Get } from '@nestjs/common';
import { VentasService } from './ventas.service';

@Controller('ventas')
export class VentasController {
    constructor(private readonly ventasService: VentasService) {}

    @Get()
    async findAll() {
        return await this.ventasService.findAll();
    }
}
