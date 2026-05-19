import { Injectable } from '@nestjs/common';
import { CreateAlertasStockDto } from './dto/create-alertas-stock.dto';
import { UpdateAlertasStockDto } from './dto/update-alertas-stock.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AlertasStockService {
  constructor(private readonly prisma: PrismaService) {}

  // HU2 de Grupo 2- Consultar alertas de reposición enviadas por G3
  // Cada alerta debe mostrar producto, stock actual y punto de reposición
  async findAll() {
    return this.prisma.alertasingresostock.findMany({
      where: { leida: false },
      include: {
        ingresosstock: {
          include: {
            ordenescompra: {
              include: {
                detalleordencompra: {
                  include: {
                    productos: {
                      select: {
                        idproducto:     true,
                        nombre:         true,
                        stockactual:    true,
                        puntoreposicion: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { fechaalerta: 'desc' },
    });
  }

   // ─── HU-5 de G3: Generar alertas de stock crítico y faltante (RN-05, RN-09) ────
  async generarAlertasStock(): Promise<void> {
    const productos = await this.prisma.productos.findMany({
      select: {
        idproducto:      true,
        nombre:          true,
        stockactual:     true,
        puntoreposicion: true,
      },
    });

    for (const p of productos) {
      const stock = p.stockactual ?? 0;
      const punto = p.puntoreposicion ?? 5;

      let tipo: string | null = null;
      if (stock === 0)          tipo = 'SIN_STOCK';
      else if (stock <= punto)  tipo = 'STOCK_CRITICO';

      if (!tipo) continue;

      // RN-09: no duplicar alerta activa del mismo tipo para el mismo producto
      const yaExiste = await this.prisma.alertasingresostock.findFirst({
        where: {
          tipo,
          leida: false,
          mensaje: { contains: `[ID:${p.idproducto}]` },
        },
      });

      if (yaExiste) continue;

      await this.prisma.alertasingresostock.create({
        data: {
          idingreso:  null,
          tipo,
          mensaje:    `[ID:${p.idproducto}] ${p.nombre}: ${tipo === 'SIN_STOCK' ? 'sin stock disponible' : `stock crítico (${stock}/${punto})`}`,
          leida:      false,
        },
      });
    }
  }

  // ─── HU-5 de G3: Consultar alertas de stock (no leídas primero) ────────────────
  async findAlertasStock() {
    return this.prisma.alertasingresostock.findMany({
      where: { tipo: { in: ['SIN_STOCK', 'STOCK_CRITICO'] } },
      orderBy: [{ leida: 'asc' }, { fechaalerta: 'desc' }],
    });
  }

  // ─── HU-5 / HU-8 de G3: Marcar alerta como leída (RN-10) ──────────────────────
  async marcarLeida(id: number) {
    return this.prisma.alertasingresostock.update({
      where: { idalerta: id },
      data:  { leida: true },
    });
  }

  // ─── HU-8 de G3: Consultar alertas de ingreso (existente, corregido) ───────────
  async findAlertasIngreso() {
    return this.prisma.alertasingresostock.findMany({
      where: { tipo: 'INGRESO' },
      orderBy: [{ leida: 'asc' }, { fechaalerta: 'desc' }],
    });
  }

  create(createAlertasStockDto: CreateAlertasStockDto) {
    return 'This action adds a new alertasStock';
  }

  findOne(id: number) {
    return `This action returns a #${id} alertasStock`;
  }

  update(id: number, updateAlertasStockDto: UpdateAlertasStockDto) {
    return `This action updates a #${id} alertasStock`;
  }

  remove(id: number) {
    return `This action removes a #${id} alertasStock`;
  }
}
