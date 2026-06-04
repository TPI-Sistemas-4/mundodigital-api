import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AddItemCarritoDto } from './dto/add-item-carrito.dto';
import { UpdateItemCarritoDto } from './dto/update-item-carrito.dto';

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

  async agregarItem(idCliente: number, dto: AddItemCarritoDto) {
    // Validar que el cliente exista
    const cliente = await this.prismaService.clientes.findUnique({
        where: { idcliente: idCliente },
    });
    if (!cliente) {
        throw new NotFoundException(`Cliente ${idCliente} no encontrado`);
    }

    // Validar que el producto exista
    const producto = await this.prismaService.productos.findUnique({
        where: { idproducto: dto.idProducto },
    });
    if (!producto) {
        throw new NotFoundException(`Producto ${dto.idProducto} no encontrado`);
    }

    // Validar stock disponible
    if ((producto.stockactual ?? 0) < dto.cantidad) {
        throw new BadRequestException(
        `Stock insuficiente para "${producto.nombre}": ` +
        `disponible ${producto.stockactual}, solicitado ${dto.cantidad}`,
        );
    }

    // Si el producto ya está en el carrito, incrementar cantidad
    const itemExistente = await this.prismaService.carritovirtual.findFirst({
        where: {
        idcliente:  idCliente,
        idproducto: dto.idProducto,
        },
    });

    if (itemExistente) {
        const nuevaCantidad = itemExistente.cantidad + dto.cantidad;

        // Revalidar stock con la cantidad acumulada
        if ((producto.stockactual ?? 0) < nuevaCantidad) {
        throw new BadRequestException(
            `Stock insuficiente para "${producto.nombre}": ` +
            `disponible ${producto.stockactual}, acumulado en carrito ${nuevaCantidad}`,
        );
        }

        return await this.prismaService.carritovirtual.update({
        where: { idcarrito: itemExistente.idcarrito },
        data:  { cantidad: nuevaCantidad },
        });
    }

    // Si no existe, crear nuevo ítem
    return await this.prismaService.carritovirtual.create({
        data: {
        idcliente:  idCliente,
        idproducto: dto.idProducto,
        cantidad:   dto.cantidad,
        },
    });
    }

  async modificarCantidad(idCarrito: number, dto: UpdateItemCarritoDto) {
    // Validar que el ítem exista
    const item = await this.prismaService.carritovirtual.findUnique({
      where: { idcarrito: idCarrito },
    });
    if (!item) {
      throw new NotFoundException(`Ítem de carrito ${idCarrito} no encontrado`);
    }
  
    // Validar stock disponible para la nueva cantidad
    const producto = await this.prismaService.productos.findUnique({
      where: { idproducto: item.idproducto },
    });
    if ((producto?.stockactual ?? 0) < dto.cantidad) {
      throw new BadRequestException(
        `Stock insuficiente para "${producto?.nombre}": ` +
        `disponible ${producto?.stockactual}, solicitado ${dto.cantidad}`,
      );
    }
  
    return await this.prismaService.carritovirtual.update({
      where: { idcarrito: idCarrito },
      data:  { cantidad: dto.cantidad },
    });
  }
}