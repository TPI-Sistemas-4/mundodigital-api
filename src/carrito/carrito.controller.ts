import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CarritoService } from './carrito.service';
import { AddItemCarritoDto } from './dto/add-item-carrito.dto';
import { UpdateItemCarritoDto } from './dto/update-item-carrito.dto';

@ApiTags('G1 - Ventas')
@Controller('carrito')
export class CarritoController {
  constructor(private readonly carritoService: CarritoService) {}

  @Delete(':idCliente')
  @ApiOperation({ summary: 'Vaciar completamente el carrito de un cliente' })
  @ApiResponse({ status: 200, description: 'Carrito vaciado correctamente.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  async vaciar(@Param('idCliente', ParseIntPipe) idCliente: number) {
    return await this.carritoService.vaciar(idCliente);
  }

  @Get(':idCliente')
  @ApiOperation({ summary: 'Visualizar carrito virtual de un cliente' })
  @ApiResponse({ status: 200, description: 'Ítems actuales del carrito con subtotales.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  async findByCliente(@Param('idCliente', ParseIntPipe) idCliente: number) {
  return await this.carritoService.findByCliente(idCliente);
  }

  @Post(':idCliente')
  @ApiOperation({ summary: 'Agregar producto al carrito virtual' })
  @ApiResponse({ status: 201, description: 'Producto agregado al carrito.' })
  @ApiResponse({ status: 400, description: 'Stock insuficiente.' })
  @ApiResponse({ status: 404, description: 'Cliente o producto no encontrado.' })
  async agregarItem(
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Body() dto: AddItemCarritoDto,
  ) {
    return await this.carritoService.agregarItem(idCliente, dto);
  }

  @Patch('item/:idCarrito')
  @ApiOperation({ summary: 'Modificar cantidad de un producto en el carrito' })
  @ApiResponse({ status: 200, description: 'Cantidad actualizada correctamente.' })
  @ApiResponse({ status: 400, description: 'Stock insuficiente.' })
  @ApiResponse({ status: 404, description: 'Ítem de carrito no encontrado.' })
  async modificarCantidad(
    @Param('idCarrito', ParseIntPipe) idCarrito: number,
    @Body() dto: UpdateItemCarritoDto,
  ) {
    return await this.carritoService.modificarCantidad(idCarrito, dto);
  }

  @Delete('item/:idCarrito')
  @ApiOperation({ summary: 'Eliminar un producto del carrito virtual' })
  @ApiResponse({ status: 200, description: 'Ítem eliminado del carrito.' })
  @ApiResponse({ status: 404, description: 'Ítem de carrito no encontrado.' })
  async eliminarItem(@Param('idCarrito', ParseIntPipe) idCarrito: number) {
    return await this.carritoService.eliminarItem(idCarrito);
  }
}