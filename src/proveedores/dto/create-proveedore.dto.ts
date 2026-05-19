import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreateProveedoreDto {
  @ApiProperty({ example: 'TecnoDistribuidora SA', description: 'Razón social del proveedor' })
  @IsString()
  @IsNotEmpty()
  razonsocial!: string;

  @ApiProperty({ example: '30-71234567-8', description: 'CUIT del proveedor. Debe ser único.' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}-\d{8}-\d{1}$/, { message: 'CUIT debe tener formato XX-XXXXXXXX-X' })
  cuit!: string;

  @ApiProperty({ example: 'ventas@tecnodistribuidora.com.ar' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '011-4321-5678', required: false })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({ example: 'Av. Rivadavia 3456, CABA', required: false })
  @IsString()
  @IsOptional()
  direccion?: string;
}