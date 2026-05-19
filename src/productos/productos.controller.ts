import { Controller, Get } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('G3 - Almacen')
@Controller('productos')
export class ProductosController {

    constructor(private readonly productosService: ProductosService) {}

    @Get()
    async findAll() {
        return await this.productosService.findAll();
    }
}
