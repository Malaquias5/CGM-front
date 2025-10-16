import { Injectable } from '@angular/core';
import { Producto } from './producto.service';

export interface Venta {
  producto: Producto;
  cantidad: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private ventas: Venta[] = [];

  agregarVenta(producto: Producto, cantidad: number) {
    const total = producto.precio * cantidad;
    this.ventas.push({ producto, cantidad, total });
  }

  getVentas() {
    return this.ventas;
  }
}
