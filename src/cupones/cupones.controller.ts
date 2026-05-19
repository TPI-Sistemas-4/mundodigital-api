import { Controller, Get } from '@nestjs/common';
import { CuponesService } from './cupones.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('G4 - Cupones')
@Controller('cupones')
export class CuponesController {
    constructor(private readonly cuponesService: CuponesService) {}

    @Get()
    async findAll() {
        return await this.cuponesService.findAll();
    }
}
