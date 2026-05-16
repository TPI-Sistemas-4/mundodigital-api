import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer/types/decorators/type.decorator";
import { IsArray, IsDateString, IsInt, IsString, Max, Min, ValidateNested } from "class-validator";

export class CreateDetallePromocionDto {
  @ApiProperty()
  @IsInt()
  idProducto!: number;

  @ApiProperty()
  @IsInt()
  @Min(1) @Max(100)
  descuentoPorcentaje!: number;
}

// create-promocion.dto.ts
export class CreatePromocionDto {
  @ApiProperty()
  @IsString()
  nombre!: string;

  @ApiProperty()
  @IsString()
  descripcion!: string;

  @ApiProperty()
  @IsDateString()
  fechaDesde!: string;

  @ApiProperty()
  @IsDateString()
  fechaHasta!: string;

  @ApiProperty({ type: [CreateDetallePromocionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetallePromocionDto)
  detalles!: CreateDetallePromocionDto[];
}