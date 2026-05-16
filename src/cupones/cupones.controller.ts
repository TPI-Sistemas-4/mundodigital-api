import { Controller, Get } from '@nestjs/common';
import { CuponesService } from './cupones.service';

@Controller('cupones')
export class CuponesController {
    constructor(private readonly cuponesService: CuponesService) {}

    @Get()
    async findAll() {
        return await this.cuponesService.findAll();
    }
}
