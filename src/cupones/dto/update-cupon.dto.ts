import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateCuponDto } from './create-cupon.dto';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class UpdateCuponDto extends PartialType(
  PickType(CreateCuponDto, ['descuentoporcentaje', 'fechavencimiento'] as const)
) {
  @IsOptional()
  @IsInt()
  idcliente?: number | null;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}