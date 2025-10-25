import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Empleado {
  idEmpleado?: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  direccion: string;
  cargo: string;
  usuario: string;
  contrasena: string;
  estado: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class EmpleadoService {
  private baseUrl = 'http://localhost:8080/api/empleados';

  constructor(private http: HttpClient) {}

  // GET /api/empleados
  getEmpleados(): Observable<Empleado[]> {
    console.log('🔄 Llamando a:', this.baseUrl);
    return this.http.get<Empleado[]>(this.baseUrl);
  }

  // GET /api/empleados/{id}
  getEmpleado(id: number): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.baseUrl}/${id}`);
  }

  // POST /api/empleados
  crearEmpleado(empleado: Empleado): Observable<Empleado> {
    return this.http.post<Empleado>(this.baseUrl, empleado);
  }

  // PUT /api/empleados/{id}
  actualizarEmpleado(id: number, empleado: Empleado): Observable<Empleado> {
    return this.http.put<Empleado>(`${this.baseUrl}/${id}`, empleado);
  }

  // DELETE /api/empleados/{id}
  eliminarEmpleado(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // PUT /api/empleados/{id}/toggle-estado
  toggleEstado(id: number): Observable<Empleado> {
    return this.http.put<Empleado>(`${this.baseUrl}/${id}/toggle-estado`, {});
  }
}
