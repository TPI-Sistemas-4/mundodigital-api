import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDetallePromocionDto } from './create-detalle-promocion.dto';

export class CreatePromocionDto {
  @ApiProperty({ example: 'Hot Sale 2026', description: 'Nombre de la promoción' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({ example: 'Descuentos en productos tecnológicos seleccionados', description: 'Descripción detallada' })
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @ApiProperty({ example: '2026-06-01', description: 'Fecha de inicio. Formato YYYY-MM-DD. No puede ser anterior a hoy.' })
  @IsDateString()
  @IsNotEmpty()
  fechaDesde!: string;

  @ApiProperty({ example: '2026-06-30', description: 'Fecha de fin. Debe ser posterior a fechaDesde.' })
  @IsDateString()
  @IsNotEmpty()
  fechaHasta!: string;

  @ApiProperty({ description: 'Productos incluidos en la promoción', type: [CreateDetallePromocionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => CreateDetallePromocionDto)
  detalles!: CreateDetallePromocionDto[];
}