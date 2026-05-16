import { Controller, Get } from '@nestjs/common';
import { ProductosService } from './productos.service';

@Controller('productos')
export class ProductosController {

    constructor(private readonly productosService: ProductosService) {}

    @Get()
    async findAll() {
        return await this.productosService.findAll();
    }
}
