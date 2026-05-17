import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export enum EstadoVenta {
  PENDIENTE = 'Pendiente_de_entrega',
  ENTREGADA = 'Entregada',
  CANCELADA = 'Cancelada',
}

export class CreateDetalleVentaDto {
  @ApiProperty({ example: 3, description: 'RN05: debe tener stock suficiente' })
  @IsInt()
  @IsNotEmpty()
  idProducto!: number;

  @ApiProperty({ example: 2, description: 'RN05: cantidad a descontar del stock' })
  @IsInt()
  @Min(1)
  cantidad!: number;
}

export class CreateVentaDto {
  @ApiProperty({ example: 1, description: 'RN04: ID del cliente registrado' })
  @IsInt()
  @IsNotEmpty()
  idCliente!: number;

  @ApiPropertyOptional({
    example: 'Av. Corrientes 1234, CABA',
    description: 'Dirección de entrega para la venta',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  direccionEntrega?: string;

  @ApiPropertyOptional({ example: 'Timbre 3B' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  indicacionesEntrega?: string;

  @ApiPropertyOptional({
    enum: EstadoVenta,
    default: EstadoVenta.PENDIENTE,
    description: 'RN06/RN07: Estado de la venta',
  })
  @IsOptional()
  @IsEnum(EstadoVenta, {
    message: `RN07: El estado debe ser uno de: ${Object.values(EstadoVenta).join(' | ')}`,
  })
  estado?: EstadoVenta = EstadoVenta.PENDIENTE;

  @ApiProperty({
    type: [CreateDetalleVentaDto],
    description: 'RN05: Lista de productos. El servicio valida stock antes de confirmar.',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'La venta debe tener al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleVentaDto)
  detalles!: CreateDetalleVentaDto[];
}