import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AddItemCarritoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  idProducto!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  cantidad!: number;
}