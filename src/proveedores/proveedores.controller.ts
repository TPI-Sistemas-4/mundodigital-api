import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedoreDto } from './dto/create-proveedore.dto';
import { UpdateProveedoreDto } from './dto/update-proveedore.dto';

@ApiTags('G2 - Proveedores')
@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo proveedor' })
  create(@Body() dto: CreateProveedoreDto) {
    return this.proveedoresService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar proveedores activos' })
  findAll() {
    return this.proveedoresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un proveedor por ID' })
  findOne(@Param('id') id: string) {
    return this.proveedoresService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar datos de un proveedor' })
  update(@Param('id') id: string, @Body() dto: UpdateProveedoreDto) {
    return this.proveedoresService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Baja lógica de proveedor (activo = false)' })
  remove(@Param('id') id: string) {
    return this.proveedoresService.remove(+id);
  }
}