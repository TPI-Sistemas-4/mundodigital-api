import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CarritoService {
  constructor(private readonly prismaService: PrismaService) {}

  async vaciar(idCliente: number) {
    // CA: debe existir el cliente
    const cliente = await this.prismaService.clientes.findUnique({
      where: { idcliente: idCliente },
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente ${idCliente} no encontrado`);
    }

    await this.prismaService.carritovirtual.deleteMany({
      where: { idcliente: idCliente },
    });

    return { message: `Carrito del cliente ${idCliente} vaciado correctamente` };
  }

  async findByCliente(idCliente: number) {
    const cliente = await this.prismaService.clientes.findUnique({
        where: { idcliente: idCliente },
    });
    if (!cliente) {
        throw new NotFoundException(`Cliente ${idCliente} no encontrado`);
    }

    const items = await this.prismaService.carritovirtual.findMany({
        where: { idcliente: idCliente },
        include: {
        productos: true, // nombre, precio, stock
        },
    });

    return {
        idCliente,
        items: items.map((i) => ({
        idCarrito:  i.idcarrito,
        idProducto: i.idproducto,
        nombre:     i.productos.nombre,
        precio:     Number(i.productos.precio),
        cantidad:   i.cantidad,
        subtotal:   Number(i.productos.precio) * i.cantidad,
        })),
        total: items.reduce(
        (acc, i) => acc + Number(i.productos.precio) * i.cantidad,
        0,
        ),
    };
  }
}