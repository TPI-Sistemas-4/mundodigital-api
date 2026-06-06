import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';

import { CrearEnvioDto } from './dto/crear-envio.dto';
import { EnvioResponseDto } from './dto/envio-response.dto';
import { PrismaService } from 'src/prisma.service';
import { ActualizarEstadoEnvioDto } from './dto/actualizar-estado-envio.dto';
import { CrearDetalleEnvioDto } from './dto/crear-detalle-envio.dto';
import { AsignarRecursosDto } from './dto/asignar-recursos.dto';

@Injectable()
export class EnviosService {
  constructor(private readonly prisma: PrismaService) {}

  // Mapa de transiciones válidas (CA: solo se permiten estas)
  private readonly TRANSICIONES: Record<string, string> = {
    'Generado':  'Preparado',
    'Preparado': 'En Camino',
    'En Camino': 'Entregado',
  };

  // Estados finales — no admiten ninguna transición saliente
  private readonly ESTADOS_FINALES = ['Entregado', 'Cancelado'];

  async findAll(estado?: string, activo?: boolean) {
    return this.prisma.envios.findMany({
      where: {
        ...(estado !== undefined && { estado }),
        ...(activo !== undefined && { activo }),
      },
      include: {
        ventas:          { select: { idventa: true, fechaventa: true, total: true } },
        asignacionenvio: { select: { idvehiculo: true, idchofer: true, idruta: true } },
      },
      orderBy: { fechaenvio: 'desc' },
    });
  }

  // ─── HU1: Registrar envío ─────────────────────────────────────────────────
  async registrar(dto: CrearEnvioDto): Promise<EnvioResponseDto> {
    // CA: validar que la venta exista
    const venta = await this.prisma.ventas.findUnique({
      where: { idventa: dto.idventa },
    });
    if (!venta) {
      throw new NotFoundException(`La venta #${dto.idventa} no existe.`);
    }

    // CA: no debe existir más de un envío activo por venta
    const envioExistente = await this.prisma.envios.findFirst({
      where: { idventa: dto.idventa, activo: true },
    });
    if (envioExistente) {
      throw new BadRequestException(
        `La venta #${dto.idventa} ya tiene un envío activo (#${envioExistente.idenvio}).`,
      );
    }

    // Crear envío con estado inicial "Preparado"
    const envio = await this.prisma.envios.create({
      data: {
        idventa:          dto.idventa,
        direccionentrega: dto.direccionentrega,
        observaciones:    dto.observaciones ?? null,
        estado:           'Preparado',
        activo:           true,
      },
    });

    return this.mapResponse(envio);
  }

  // ─── HU4: Actualizar estado del envío ────────────────────────────────────
  async actualizarEstado(
    idenvio: number,
    dto: ActualizarEstadoEnvioDto,
  ): Promise<EnvioResponseDto> {
    // Verificar que el envío exista y esté activo
    const envio = await this.prisma.envios.findFirst({
      where: { idenvio, activo: true },
      include: { asignacionenvio: true },
    });
    if (!envio) {
      throw new NotFoundException(`El envío #${idenvio} no existe o no está activo.`);
    }

    const estadoActual = envio.estado ?? 'Preparado';

    // CA: estados finales no admiten ninguna transición saliente
    if (this.ESTADOS_FINALES.includes(estadoActual)) {
      throw new BadRequestException(
        `El envío ya se encuentra en estado "${estadoActual}" y no admite más cambios.`,
      );
    }

    // CA: Cancelado puede aplicarse desde cualquier estado no final
    if (dto.estadonuevo !== 'Cancelado') {
      // Para el resto, validar contra el mapa de transiciones
      if (this.TRANSICIONES[estadoActual] !== dto.estadonuevo) {
        throw new BadRequestException(
          `Transición inválida: ${estadoActual} → ${dto.estadonuevo}. ` +
          `Desde "${estadoActual}" solo se puede pasar a "${this.TRANSICIONES[estadoActual]}" o "Cancelado".`,
        );
      }

      // CA: para pasar a "En Camino" debe existir asignación
      if (dto.estadonuevo === 'En Camino' && !envio.asignacionenvio) {
        throw new BadRequestException(
          `No se puede pasar a "En Camino" sin vehículo, chofer y ruta asignados.`,
        );
      }
    }

    // Actualizar estado y registrar en tracking — transacción
    const [envioActualizado] = await this.prisma.$transaction([
      this.prisma.envios.update({
        where: { idenvio },
        data: { estado: dto.estadonuevo },
      }),
      this.prisma.trackingenvio.create({
        data: {
          idenvio,
          estadoanterior: estadoActual,
          estadonuevo:    dto.estadonuevo,
          observaciones:  dto.observaciones ?? null,
        },
      }),
    ]);

    return this.mapResponse(envioActualizado);
  }

  // ─── Consultar historial de tracking ─────────────────────────────────────
  async obtenerTracking(idenvio: number) {
    const envio = await this.prisma.envios.findFirst({
      where: { idenvio, activo: true },
    });
    if (!envio) {
      throw new NotFoundException(`El envío #${idenvio} no existe o no está activo.`);
    }

    return this.prisma.trackingenvio.findMany({
      where: { idenvio },
      orderBy: { fechacambio: 'asc' },
    });
  }

  async obtenerPorId(idenvio: number): Promise<EnvioResponseDto> {
    const envio = await this.prisma.envios.findFirst({
      where: { idenvio, activo: true },
    });
    if (!envio) {
      throw new NotFoundException(`El envío #${idenvio} no existe o no está activo.`);
    }
    return this.mapResponse(envio);
  }

  async obtenerPorVenta(idventa: number): Promise<EnvioResponseDto> {
    const envio = await this.prisma.envios.findFirst({
      where: { idventa, activo: true },
    });
    if (!envio) {
      throw new NotFoundException(`No existe un envío activo para la venta #${idventa}.`);
    }
    return this.mapResponse(envio);
  }

  // ─── HU2: Registrar detalle del envío ────────────────────────────────────
  async registrarDetalle(
    idenvio: number,
    dto: CrearDetalleEnvioDto,
  ): Promise<{ idenvio: number; detalle: any[] }> {
    // Verificar que el envío exista y esté activo
    const envio = await this.prisma.envios.findFirst({
      where: { idenvio, activo: true },
    });
    if (!envio) {
      throw new NotFoundException(`El envío #${idenvio} no existe o no está activo.`);
    }

    // CA: verificar que todos los productos existan
    const idsProducto = dto.detalle.map((d) => d.idproducto);
    const productosEncontrados = await this.prisma.productos.findMany({
      where: { idproducto: { in: idsProducto } },
      select: { idproducto: true },
    });

    const idsEncontrados = productosEncontrados.map((p) => p.idproducto);
    const idsInexistentes = idsProducto.filter((id) => !idsEncontrados.includes(id));
    if (idsInexistentes.length > 0) {
      throw new BadRequestException(
        `Los siguientes productos no existen: ${idsInexistentes.join(', ')}.`,
      );
    }

    // Insertar detalle — createMany para eficiencia
    const detalleExistente = await this.prisma.detalleenvio.findFirst({
      where: { idenvio },
    })

    if (detalleExistente) {
      throw new BadRequestException(
        `El envío #${idenvio} ya tiene detalle registrado.`,
      )
    }
    
    await this.prisma.detalleenvio.createMany({
      data: dto.detalle.map((item) => ({
        idenvio,
        idproducto: item.idproducto,
        cantidad:   item.cantidad,
      })),
    });

    // Devolver el detalle completo con nombres de producto
    const detalleGuardado = await this.prisma.detalleenvio.findMany({
      where: { idenvio },
      include: { productos: { select: { idproducto: true, nombre: true, precio: true } } },
    });

    return { idenvio, detalle: detalleGuardado };
  }

  // ─── HU3: Asignar recursos logísticos ────────────────────────────────────
  async asignarRecursos(idenvio: number, dto: AsignarRecursosDto) {
    // Verificar que el envío exista y esté activo
    const envio = await this.prisma.envios.findFirst({
      where: { idenvio, activo: true },
    });
    if (!envio) {
      throw new NotFoundException(`El envío #${idenvio} no existe o no está activo.`);
    }

    // CA: no se permiten recursos inactivos
    const vehiculo = await this.prisma.vehiculos.findFirst({
      where: { idvehiculo: dto.idvehiculo, activo: true },
    });
    if (!vehiculo) {
      throw new BadRequestException(
        `El vehículo #${dto.idvehiculo} no existe o no está activo.`,
      );
    }

    const chofer = await this.prisma.choferes.findFirst({
      where: { idchofer: dto.idchofer, activo: true },
    });
    if (!chofer) {
      throw new BadRequestException(
        `El chofer #${dto.idchofer} no existe o no está activo.`,
      );
    }

    const ruta = await this.prisma.rutas.findFirst({
      where: { idruta: dto.idruta, activo: true },
    });
    if (!ruta) {
      throw new BadRequestException(
        `La ruta #${dto.idruta} no existe o no está activa.`,
      );
    }

    // upsert: si ya existe asignación la pisa, si no la crea
    const asignacion = await this.prisma.asignacionenvio.upsert({
      where:  { idenvio },
      update: {
        idvehiculo: dto.idvehiculo,
        idchofer:   dto.idchofer,
        idruta:     dto.idruta,
        fechaasignacion: new Date(),
      },
      create: {
        idenvio,
        idvehiculo: dto.idvehiculo,
        idchofer:   dto.idchofer,
        idruta:     dto.idruta,
      },
    });

    return asignacion;
  }

  // ─── Utilidad ─────────────────────────────────────────────────────────────
  private mapResponse(envio: any): EnvioResponseDto {
    return {
      idenvio:          envio.idenvio,
      idventa:          envio.idventa,
      direccionentrega: envio.direccionentrega,
      estado:           envio.estado,
      fechaenvio:       envio.fechaenvio,
      observaciones:    envio.observaciones,
    };
  }
}