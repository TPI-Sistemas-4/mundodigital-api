import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateDetalleVentaDto {
  @ApiProperty({ example: 3, description: 'RN05: debe tener stock suficiente' })
  @IsInt()
  @IsNotEmpty()
  idProducto!: number;

  @ApiProperty({ example: 2, description: 'RN05: cantidad a descontar del stock' })
  @IsInt()
  @Min(1)
  cantidad!: number;

  @ApiProperty({ example: 'Av. Corrientes 1234, CABA' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  direccionEntrega!: string;

  @ApiPropertyOptional({ example: 'Timbre 3B, no tocar el portero' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  indicacionesEntrega?: string;
}