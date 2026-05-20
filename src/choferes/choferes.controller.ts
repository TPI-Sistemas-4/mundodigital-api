import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChoferesService } from './choferes.service';

@ApiTags('G5 - Choferes')
@Controller('choferes')
export class ChoferesController {
  constructor(private readonly choferesService: ChoferesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar choferes disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de choferes activos.' })
  findDisponibles() {
    return this.choferesService.findDisponibles();
  }
}