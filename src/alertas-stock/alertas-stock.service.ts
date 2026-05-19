import { Injectable } from '@nestjs/common';
import { CreateAlertasStockDto } from './dto/create-alertas-stock.dto';
import { UpdateAlertasStockDto } from './dto/update-alertas-stock.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AlertasStockService {
  constructor(private readonly prisma: PrismaService) {}

  // HU2 - Consultar alertas de reposición enviadas por G3
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
