import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';

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
}