import { Controller, Get } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('G1 - Ventas')
@Controller('clientes')
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) {}

    @Get()
    async findAll() {
        return await this.clientesService.findAll();
    }
}
