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
}