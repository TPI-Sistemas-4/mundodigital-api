import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateDetallePromocionDto {
  @ApiProperty({ example: 3, description: 'ID del producto a incluir en la promoción' })
  @IsInt()
  @IsOptional()
  idProducto?: number;

  @ApiProperty({ example: 15, description: 'Porcentaje de descuento. Entre 1 y 90.' })
  @IsInt()
  @Min(1)
  @Max(90)
  descuentoPorcentaje!: number;
}