import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dto/Usuario.dto';
import { Usuarioervice } from './Usuarios.service';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: Usuarioervice) {}

  @Post()
  @ApiOperation({ summary: 'Crear usuario' })
  async create(@Body() dto: CreateUsuarioDto) {
    return await this.usuariosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios' })
  async findAll() {
    return await this.usuariosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUsuarioDto) {
    return await this.usuariosService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar usuario' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.usuariosService.remove(id);
  }
}