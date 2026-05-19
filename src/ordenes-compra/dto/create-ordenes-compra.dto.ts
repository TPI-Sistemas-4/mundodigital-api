import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString, IsOptional, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDetalleOrdenCompraDto } from './create-detalle-orden-compra.dto';

export class CreateOrdenesCompraDto {
  @ApiProperty({ example: 1, description: 'ID del proveedor. Debe existir y estar activo.' })
  @IsInt()
  @IsPositive()
  idProveedor!: number;

  @ApiProperty({ example: 'Reposición periféricos', required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;

  @ApiProperty({ description: 'Productos incluidos en la orden', type: [CreateDetalleOrdenCompraDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleOrdenCompraDto)
  detalle!: CreateDetalleOrdenCompraDto[];
}