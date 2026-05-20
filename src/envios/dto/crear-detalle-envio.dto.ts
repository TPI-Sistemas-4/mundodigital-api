import { Type } from 'class-transformer';
import { IsInt, IsPositive, ArrayMinSize, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DetalleEnvioItemDto {
  @ApiProperty({ example: 3 })
  @IsInt()
  idproducto!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive({ message: 'La cantidad debe ser mayor a cero.' })
  cantidad!: number;
}

export class CrearDetalleEnvioDto {
  @ApiProperty({ type: [DetalleEnvioItemDto] })
  @ArrayMinSize(1, { message: 'El envío debe contener al menos un producto.' })
  @ValidateNested({ each: true })
  @Type(() => DetalleEnvioItemDto)
  detalle!: DetalleEnvioItemDto[];
}