import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { PuntosService } from './punto.service';
import { CreatePuntoDto } from './dto/create-punto.dto';

@Controller('puntos')
export class PuntosController {
  constructor(private readonly puntosService: PuntosService) { }

  /** GET /puntos/regla — Regla vigente de conversion */
  @Get('regla')
  getRegla() {
    return this.puntosService.getRegla();
  }

  /** GET /puntos — Saldo de puntos por cliente */
  @Get()
  findAll() {
    return this.puntosService.findAll();
  }

  /** GET /puntos/cliente/:id — Historial y saldo de un cliente */
  @Get('cliente/:id')
  getHistorial(@Param('id', ParseIntPipe) id: number) {
    return this.puntosService.getHistorial(id);
  }

  /** GET /puntos/cliente/:id/saldo — saldo, movimientos recientes y estado frecuente */
  @Get('cliente/:id/saldo')
  consultarSaldo(@Param('id', ParseIntPipe) id: number) {
    return this.puntosService.consultarSaldo(id);
  }

  /** POST /puntos — Registrar puntos por compra */
  @Post()
  registrar(@Body() dto: CreatePuntoDto) {
    return this.puntosService.registrar(dto);
  }
}