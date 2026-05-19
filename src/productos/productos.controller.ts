import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ProductosService } from './productos.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('G3 - Almacen')
@Controller('productos')
export class ProductosController {

  constructor(private readonly productosService: ProductosService) {}

  @ApiOperation({ summary: 'Obtener todos los productos' })
  @Get()
    async findAll() {
        return await this.productosService.findAll();
    }

  /**
   * HU-1: Consultar stock
   * GET /productos/stock
   * Devuelve todos los productos con su estado calculado, ordenados por prioridad.
   */
  @Get('stock')
  async getStock() {
    return this.productosService.findAllConStock();
  }

  /**
   * HU-2: Emitir listado de productos y stock actual en PDF
   * GET /productos/stock/pdf
   * Genera y descarga el reporte PDF del inventario.
   */
  @Get('stock/pdf')
  async getPdfListado(@Res() res: Response) {
    const pdfBuffer = await this.productosService.generarPdfListado();

    const fecha = new Date().toISOString().split('T')[0]; // ej: 2026-05-20
    const filename = `listado-stock-${fecha}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  /**
   * HU-3: Reporte gráfico de estado de stock
   * GET /productos/stock/resumen
   */
  @Get('stock/resumen')
  async getResumenEstados() {
    return this.productosService.getResumenEstados();
  }
}
