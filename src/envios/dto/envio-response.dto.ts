export class EnvioResponseDto {
  idenvio!:          number;
  idventa!:          number;
  direccionentrega!: string;
  estado!:           string;
  fechaenvio!:       Date;
  observaciones!:    string | null;
}