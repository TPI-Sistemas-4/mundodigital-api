import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateCuponDto {
  @IsString()
  @MaxLength(20)
  codigo!: string;

  @IsInt()
  @Min(1)
  @Max(100)
  descuentoporcentaje!: number;

  @IsOptional()
  @IsInt()
  idcliente?: number;

  @IsOptional()
  @IsInt()
  idpromocion?: number;

  @IsOptional()
  @IsDateString()
  fechavencimiento?: string;
}