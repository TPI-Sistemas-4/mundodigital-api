import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CrearEnvioDto {
  @ApiProperty({ example: 12 })
  @IsInt()
  idventa!: number;

  @ApiProperty({ example: 'Av. Siempre Viva 742' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  direccionentrega!: string;

  @ApiPropertyOptional({ example: 'Dejar en portería' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  observaciones?: string;
}