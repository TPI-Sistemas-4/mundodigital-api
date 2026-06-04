import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@ApiTags('G1 - Ventas')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los clientes' })
  async findAll() {
    return await this.clientesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente registrado correctamente.' })
  @ApiResponse({ status: 400, description: 'Email ya registrado o campos inválidos.' })
  async create(@Body() dto: CreateClienteDto) {
    return await this.clientesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modificar datos de un cliente' })
  @ApiResponse({ status: 200, description: 'Cliente actualizado correctamente.' })
  @ApiResponse({ status: 400, description: 'Email ya en uso por otro cliente.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  async update(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateClienteDto,
    ) {
    return await this.clientesService.update(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar perfil de cliente con historial de ventas' })
  @ApiResponse({ status: 200, description: 'Perfil del cliente con historial.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.clientesService.findOne(id);
  }
}