import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export type TipoUsuario = 'SISTEMA' | 'CLIENTE';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'juan@mundodigital.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'MiPassword123!', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({
    enum: ['SISTEMA', 'CLIENTE'],
    default: 'CLIENTE',
    description: 'Rol del usuario',
  })
  @IsOptional()
  @IsEnum(['SISTEMA', 'CLIENTE'])
  tipousuario?: TipoUsuario;
}

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}