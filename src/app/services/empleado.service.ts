import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Empleado {
  idEmpleado: number;      
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
  providedIn: 'root'
})
export class EmpleadoService {
  private baseUrl = 'http://localhost:8081/api/empleados';

  constructor(private http: HttpClient) {}

  getEmpleados(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.baseUrl);
  }
}
