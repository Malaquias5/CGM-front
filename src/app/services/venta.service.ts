import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from './producto.service';

export interface Venta {
  id?: number;
  producto: Producto;
  cantidad: number;
  total: number;
  fecha?: string;
}

export interface VentaCreateDTO {
  productoId: number;
  cantidad: number;
}

@Injectable({
  providedIn: 'root',
})
export class VentaService {
  private apiUrl = 'http://localhost:8080/api/ventas';

  constructor(private http: HttpClient) {}

  // Crear una venta en el backend
  crearVenta(venta: VentaCreateDTO): Observable<Venta> {
    return this.http.post<Venta>(this.apiUrl, venta);
  }

  // Listar ventas paginadas
  listarVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.apiUrl);
  }

  // Cancelar venta
  cancelarVenta(id: number, motivo?: string): Observable<Venta> {
    const params = motivo ? { params: { motivo } } : {};
    return this.http.put<Venta>(`${this.apiUrl}/${id}/cancel`, null, params);
  }
}
