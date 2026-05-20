import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type EstadoEnvio = 'Preparado' | 'En Camino' | 'Entregado';

const ESTADOS_VALIDOS: EstadoEnvio[] = ['Preparado', 'En Camino', 'Entregado'];

export class ActualizarEstadoEnvioDto {
  @ApiProperty({ enum: ESTADOS_VALIDOS, example: 'En Camino' })
  @IsIn(ESTADOS_VALIDOS, {
    message: `El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`,
  })
  estadonuevo!: EstadoEnvio;

  @ApiPropertyOptional({ example: 'Salió del depósito a las 9hs' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}