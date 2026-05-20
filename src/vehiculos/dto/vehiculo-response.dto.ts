export class VehiculoResponseDto {
  idvehiculo!:     number;
  patente!:        string;
  marca!:          string;
  modelo!:         string;
  anio!:           number;
  capacidadcarga!: number | null;
  estado!:         string;
}