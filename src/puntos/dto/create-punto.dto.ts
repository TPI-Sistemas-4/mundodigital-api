import { IsInt, IsPositive } from 'class-validator';
 
export class CreatePuntoDto {
  @IsInt()
  @IsPositive()
  idventa!: number;
}