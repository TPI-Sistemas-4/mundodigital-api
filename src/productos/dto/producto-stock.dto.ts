export type EstadoStock = 'Disponible' | 'Critico' | 'Sin Stock';

export class ProductoStockDto {
  idProducto: number;
  nombre: string;
  precio: number;
  stockActual: number;
  puntoReposicion: number;
  estadoStock: EstadoStock;
}
