import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateClienteDto {
  @ApiPropertyOptional({ example: 'Juan' })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  @IsString()
  @IsOptional()
  apellido?: string;

  @ApiPropertyOptional({ example: 'juan.perez@email.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '3514123456' })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({ example: 'Av. Siempre Viva 742' })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean; // CA: el estado activo/inactivo se puede modificar
}