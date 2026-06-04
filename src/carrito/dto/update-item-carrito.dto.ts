import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class UpdateItemCarritoDto {
  @ApiProperty({ example: 3 })
  @IsInt()
  @IsPositive()
  cantidad!: number;
}