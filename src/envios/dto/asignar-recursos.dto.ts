import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AsignarRecursosDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  idvehiculo!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  idchofer!: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  idruta!: number;
}