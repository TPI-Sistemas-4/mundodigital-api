import { Injectable } from '@nestjs/common';
import { ProductoStockDto, EstadoStock } from './dto/producto-stock.dto';
import PDFDocument from 'pdfkit';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}


  async findAll() {
        return await this.prisma.productos.findMany();
    }
  // ─── Lógica de negocio (RN-08) ───────────────────────────────────────────
  private calcularEstado(stockActual: number, puntoReposicion: number): EstadoStock {
    if (stockActual === 0) return 'Sin Stock';
    if (stockActual <= puntoReposicion) return 'Critico';
    return 'Disponible';
  }

  // ─── HU-1 / HU-2: Obtener todos los productos con estado calculado ────────
  async findAllConStock(): Promise<ProductoStockDto[]> {
    const productos = await this.prisma.productos.findMany({
      orderBy: { nombre: 'asc' },
    });

    const mapped = productos.map((p) => ({
      idProducto: p.idproducto,
      nombre: p.nombre,
      precio: Number(p.precio),
      stockActual: p.stockactual ?? 0,
      puntoReposicion: p.puntoreposicion ?? 0,
      estadoStock: this.calcularEstado(p.stockactual ?? 0, p.puntoreposicion ?? 0),
    }));

    // Ordenar: Sin Stock → Critico → Disponible (HU-1 criterio de aceptación)
    const prioridad: Record<EstadoStock, number> = {
      'Sin Stock': 0,
      Critico: 1,
      Disponible: 2,
    };
    return mapped.sort((a, b) => prioridad[a.estadoStock] - prioridad[b.estadoStock]);
  }

  // ─── HU-2: Generar PDF del listado de productos ───────────────────────────
  async generarPdfListado(): Promise<Buffer> {
    const productos = await this.findAllConStock();
    const fechaEmision = new Date().toLocaleString('es-AR');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ── Encabezado ──
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('MundoDigital S.A.', { align: 'center' });
      doc
        .fontSize(13)
        .font('Helvetica')
        .text('Listado de Productos y Stock Actual', { align: 'center' });
      doc
        .fontSize(9)
        .fillColor('#666666')
        .text(`Fecha de emisión: ${fechaEmision}`, { align: 'center' });

      doc.moveDown(1.5);

      // ── Encabezados de tabla ──
      const colX = { nombre: 40, stock: 280, reposicion: 360, estado: 450 };
      const rowHeight = 20;

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#000000');

      doc.text('Producto', colX.nombre, doc.y);
      doc.text('Stock actual', colX.stock, doc.y - 10);
      doc.text('Reposición', colX.reposicion, doc.y - 10);
      doc.text('Estado', colX.estado, doc.y - 10);

      doc.moveDown(0.3);
      doc
        .moveTo(40, doc.y)
        .lineTo(560, doc.y)
        .strokeColor('#cccccc')
        .stroke();
      doc.moveDown(0.3);

      // ── Filas ──
      const colorEstado: Record<string, string> = {
        Disponible: '#16a34a',
        Critico: '#d97706',
        'Sin Stock': '#dc2626',
      };

      productos.forEach((p) => {
        const y = doc.y;
        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#000000')
          .text(p.nombre, colX.nombre, y, { width: 230 });
        doc.text(String(p.stockActual), colX.stock, y);
        doc.text(String(p.puntoReposicion), colX.reposicion, y);
        doc
          .fillColor(colorEstado[p.estadoStock] ?? '#000000')
          .text(p.estadoStock, colX.estado, y);

        doc.fillColor('#000000').moveDown(0.2);

        doc
          .moveTo(40, doc.y)
          .lineTo(560, doc.y)
          .strokeColor('#eeeeee')
          .stroke();
        doc.moveDown(0.2);
      });

      // ── Pie ──
      doc
        .moveDown(2)
        .fontSize(8)
        .fillColor('#999999')
        .text(`Total de productos: ${productos.length}`, { align: 'right' });

      doc.end();
    });
  }


  // ─── HU-3: Resumen de estados de stock ───────────────────────────────
  async getResumenEstados() {
    const productos = await this.findAllConStock();

    const resumen = { Disponible: 0, Critico: 0, 'Sin Stock': 0 };
    productos.forEach((p) => resumen[p.estadoStock]++);

    return {
      total: productos.length,
      distribucion: [
        { estado: 'Disponible', cantidad: resumen['Disponible'] },
        { estado: 'Critico',    cantidad: resumen['Critico'] },
        { estado: 'Sin Stock',  cantidad: resumen['Sin Stock'] },
      ],
    };
  }
}
