import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Categoria {
  idCategoria: number;
  nombre: string;
  descripcion: string;
}

export interface Producto {
  idProducto?: number;
  categoria: Categoria;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  grosor: number;
  alto: number;
  ancho: number;
  color: string;
  precioCompra: number;
  precioVenta: number;
  stockActual: number;
  estado?: string;

  // Propiedades calculadas para compatibilidad
  id?: number;
  precio?: number;
  stock?: number;
  activo?: boolean;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

// Producto normalizado para el frontend
export interface ProductoNormalizado {
  id?: number;
  nombre: string;
  codigo: string;
  precio: number;
  stock: number;
  categoria: string;
  activo: boolean;
  descripcion?: string;
  tipo?: string;
  grosor?: number;
  alto?: number;
  ancho?: number;
  color?: string;
  precioCompra?: number;
  precioVenta?: number;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface ProductoResponse {
  productos: ProductoNormalizado[];
  total: number;
  page: number;
  size: number;
}

export interface AjusteStock {
  cantidad: number;
  tipo: 'INCREMENTO' | 'DECREMENTO';
  motivo: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private apiUrl = 'http://localhost:8080/api/productos';

  constructor(private http: HttpClient) {}

  // GET /api/productos?page=&size=&q=&categoria=&soloConStock=
  getProductos(
    page: number = 1,
    size: number = 10,
    q?: string,
    categoria?: string,
    soloConStock?: boolean
  ): Observable<ProductoResponse> {
    let params = new HttpParams();

    if (page) params = params.set('page', page.toString());
    if (size) params = params.set('size', size.toString());
    if (q) params = params.set('q', q);
    if (categoria) params = params.set('categoria', categoria);
    if (soloConStock) params = params.set('soloConStock', 'true');

    return this.http.get<Producto[]>(this.apiUrl, { params }).pipe(
      map((productos: Producto[]) => {
        // Normalizar productos para compatibilidad con el frontend
        const productosNormalizados: ProductoNormalizado[] = productos.map(
          (p) => ({
            id: p.idProducto,
            nombre: p.nombre,
            codigo: p.codigo,
            precio: p.precioVenta,
            stock: p.stockActual,
            categoria: p.categoria?.nombre || 'Sin categoría',
            activo: p.estado !== 'INACTIVO',
            descripcion: p.descripcion,
            tipo: p.tipo,
            grosor: p.grosor,
            alto: p.alto,
            ancho: p.ancho,
            color: p.color,
            precioCompra: p.precioCompra,
            precioVenta: p.precioVenta,
          })
        );

        return {
          productos: productosNormalizados,
          total: productos.length,
          page: page,
          size: size,
        };
      })
    );
  }

  // GET /api/productos/{id}
  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  // POST /api/productos
  // POST /api/productos
  crearProducto(productoForm: any): Observable<Producto> {
    console.log('📤 Enviando datos al backend:', productoForm);

    // Transformar datos del frontend al formato del backend
    const productoBackend: any = {
      nombre: productoForm.nombre,
      codigo: productoForm.codigo,
      tipo: productoForm.tipo || 'GENERAL',
      grosor: productoForm.grosor || null,
      alto: productoForm.alto || null,
      ancho: productoForm.ancho || null,
      color: productoForm.color || null,
      precioCompra: productoForm.precioCompra || productoForm.precio || 0,
      precioVenta: productoForm.precio || productoForm.precioVenta || 0,
      stockActual: productoForm.stock || productoForm.stockActual || 0,
      estado: productoForm.activo === false ? 'INACTIVO' : 'ACTIVO',
      descripcion: productoForm.descripcion || '',
      categoria: productoForm.categoria || 'Sin categoría',
    };

    console.log('🔄 Datos transformados para backend:', productoBackend);

    return this.http.post<Producto>(this.apiUrl, productoBackend).pipe(
      tap({
        next: (response) => console.log('✅ Respuesta del backend:', response),
        error: (error) => {
          console.error('❌ Error del backend:', error);
          console.error('📋 Datos que se enviaron:', productoBackend);
        },
      })
    );
  }

  // PUT /api/productos/{id}
  actualizarProducto(id: number, productoForm: any): Observable<Producto> {
    console.log('📤 Actualizando producto en backend:', id, productoForm);

    // Transformar datos del frontend al formato del backend
    const productoBackend: any = {
      nombre: productoForm.nombre,
      codigo: productoForm.codigo,
      tipo: productoForm.tipo || 'GENERAL',
      grosor: productoForm.grosor || null,
      alto: productoForm.alto || null,
      ancho: productoForm.ancho || null,
      color: productoForm.color || null,
      precioCompra: productoForm.precioCompra || productoForm.precio || 0,
      precioVenta: productoForm.precio || productoForm.precioVenta || 0,
      stockActual: productoForm.stock || productoForm.stockActual || 0,
      estado: productoForm.activo === false ? 'INACTIVO' : 'ACTIVO',
      descripcion: productoForm.descripcion || '',
      categoria: productoForm.categoria || 'Sin categoría',
    };

    console.log('🔄 Datos transformados para actualización:', productoBackend);

    return this.http
      .put<Producto>(`${this.apiUrl}/${id}`, productoBackend)
      .pipe(
        tap({
          next: (response) => console.log('✅ Producto actualizado:', response),
          error: (error) => {
            console.error('❌ Error actualizando:', error);
            console.error('📋 Datos enviados:', productoBackend);
          },
        })
      );
  }

  // DELETE /api/productos/{id}
  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // POST /api/productos/{id}/ajustar-stock
  ajustarStock(id: number, ajuste: AjusteStock): Observable<Producto> {
    return this.http.post<Producto>(
      `${this.apiUrl}/${id}/ajustar-stock`,
      ajuste
    );
  }

  // PUT /api/productos/{id}/toggle-estado
  toggleEstado(id: number): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}/toggle-estado`, {});
  }

  // POST /api/productos/importar
  importarCSV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/importar`, formData);
  }

  // GET /api/productos/exportar
  exportarCSV(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar`, {
      responseType: 'blob',
    });
  }

  // GET /api/productos/{id}/historial
  getHistorialStock(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/historial`);
  }
}
