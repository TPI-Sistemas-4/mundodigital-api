import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsNumber, Min } from 'class-validator';

export class CreateDetalleOrdenCompraDto {
  @ApiProperty({ example: 6, description: 'ID del producto a incluir en la orden' })
  @IsInt()
  @IsPositive()
  idProducto!: number;

  @ApiProperty({ example: 5, description: 'Cantidad solicitada. Debe ser mayor a cero.' })
  @IsInt()
  @IsPositive()
  cantidad!: number;

  @ApiProperty({ example: 54999.00, description: 'Precio unitario pactado con el proveedor' })
  @IsNumber()
  @Min(0.01)
  precioUnitario!: number;
}