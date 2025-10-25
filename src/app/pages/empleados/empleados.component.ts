import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadoService, Empleado } from '../../services/empleado.service';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css'],
})
export class EmpleadosComponent implements OnInit {
  empleados: Empleado[] = [];
  empleadosFiltrados: Empleado[] = [];
  loading: boolean = false;
  error: string = '';

  // Paginación
  currentPage: number = 1;
  pageSize: number = 5;
  totalEmpleados: number = 0;
  totalPages: number = 0;

  // Búsqueda
  searchQuery: string = '';

  constructor(private empleadoService: EmpleadoService) {}

  ngOnInit(): void {
    this.loadEmpleados();
  }

  loadEmpleados(): void {
    this.loading = true;
    this.error = '';

    console.log('🔄 Cargando empleados desde backend...');

    this.empleadoService.getEmpleados().subscribe({
      next: (data) => {
        console.log('✅ Empleados recibidos:', data);
        this.empleados = data;
        this.aplicarFiltrosYPaginacion();
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error cargando empleados:', err);
        console.error('Error details:', {
          status: err.status,
          message: err.message,
          url: err.url,
        });
        this.error = `Error cargando empleados: ${err.message || err}`;
        this.loading = false;

        // Mostrar datos de prueba si el backend no está disponible
        if (err.status === 0 || err.status === 404) {
          console.log('⚠️  Backend no disponible, usando datos de prueba');
          this.cargarDatosPruebaEmpleados();
        }
      },
    });
  }

  cargarDatosPruebaEmpleados(): void {
    this.empleados = [
      {
        idEmpleado: 1,
        nombre: 'Ana',
        apellido: 'Martínez',
        dni: '12345678',
        telefono: '555-0201',
        direccion: 'Calle Trabajo 123',
        cargo: 'Vendedora',
        usuario: 'ana.martinez',
        contrasena: '********',
        estado: true,
      },
      {
        idEmpleado: 2,
        nombre: 'Roberto',
        apellido: 'Silva',
        dni: '87654321',
        telefono: '555-0202',
        direccion: 'Av. Laboral 456',
        cargo: 'Instalador',
        usuario: 'roberto.silva',
        contrasena: '********',
        estado: true,
      },
      {
        idEmpleado: 3,
        nombre: 'Laura',
        apellido: 'González',
        dni: '11223344',
        telefono: '555-0203',
        direccion: 'Boulevard Empresa 789',
        cargo: 'Supervisora',
        usuario: 'laura.gonzalez',
        contrasena: '********',
        estado: true,
      },
    ];
    this.error = '';
    this.aplicarFiltrosYPaginacion();
  }

  // PAGINACIÓN Y FILTRADO
  aplicarFiltrosYPaginacion(): void {
    // Filtrar empleados
    let empleadosFiltrados = [...this.empleados];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      empleadosFiltrados = empleadosFiltrados.filter(
        (empleado) =>
          empleado.nombre.toLowerCase().includes(query) ||
          empleado.apellido.toLowerCase().includes(query) ||
          empleado.dni.includes(query) ||
          empleado.cargo.toLowerCase().includes(query)
      );
    }

    // Calcular paginación
    this.totalEmpleados = empleadosFiltrados.length;
    this.totalPages = Math.ceil(this.totalEmpleados / this.pageSize);

    // Aplicar paginación
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.empleadosFiltrados = empleadosFiltrados.slice(startIndex, endIndex);
  }

  buscar(): void {
    this.currentPage = 1;
    this.aplicarFiltrosYPaginacion();
  }

  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.aplicarFiltrosYPaginacion();
    }
  }

  siguientePagina(): void {
    this.cambiarPagina(this.currentPage + 1);
  }

  anteriorPagina(): void {
    this.cambiarPagina(this.currentPage - 1);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // MÉTODOS DE EDICIÓN Y ELIMINACIÓN
  editarEmpleado(empleado: Empleado): void {
    console.log('✏️ Editando empleado:', empleado);
    // TODO: Implementar modal de edición
    alert(
      `Editando empleado: ${empleado.nombre} ${empleado.apellido}\nCargo: ${empleado.cargo}\n\nFuncionalidad en desarrollo...`
    );
  }

  eliminarEmpleado(empleado: Empleado): void {
    console.log('🗑️ Eliminando empleado:', empleado);

    const confirmacion = confirm(
      `¿Estás seguro de que quieres eliminar al empleado ${empleado.nombre} ${empleado.apellido}?\nCargo: ${empleado.cargo}\n\nEsta acción no se puede deshacer.`
    );

    if (confirmacion) {
      if (empleado.idEmpleado) {
        // Intentar eliminar del backend
        this.empleadoService.eliminarEmpleado(empleado.idEmpleado).subscribe({
          next: () => {
            console.log('✅ Empleado eliminado del backend');
            this.loadEmpleados(); // Recargar la lista
            alert('Empleado eliminado exitosamente');
          },
          error: (err) => {
            console.error('❌ Error eliminando del backend:', err);
            // Eliminar localmente si el backend falla
            this.eliminarEmpleadoLocal(empleado);
          },
        });
      } else {
        // Eliminar solo localmente
        this.eliminarEmpleadoLocal(empleado);
      }
    }
  }

  eliminarEmpleadoLocal(empleado: Empleado): void {
    const index = this.empleados.findIndex(
      (e) =>
        e.idEmpleado === empleado.idEmpleado ||
        (e.nombre === empleado.nombre &&
          e.apellido === empleado.apellido &&
          e.dni === empleado.dni)
    );

    if (index > -1) {
      this.empleados.splice(index, 1);
      console.log('✅ Empleado eliminado localmente');
      alert('Empleado eliminado exitosamente (modo local)');
    }
  }

  toggleEstadoEmpleado(empleado: Empleado): void {
    console.log('🔄 Cambiando estado del empleado:', empleado);

    const nuevoEstado = !empleado.estado;
    const accion = nuevoEstado ? 'activar' : 'desactivar';

    const confirmacion = confirm(
      `¿Estás seguro de que quieres ${accion} al empleado ${empleado.nombre} ${empleado.apellido}?`
    );

    if (confirmacion) {
      if (empleado.idEmpleado) {
        // Intentar actualizar en el backend
        this.empleadoService
          .actualizarEmpleado(empleado.idEmpleado, {
            ...empleado,
            estado: nuevoEstado,
          })
          .subscribe({
            next: () => {
              console.log(`✅ Estado del empleado ${accion}do en el backend`);
              empleado.estado = nuevoEstado;
              alert(`Empleado ${accion}do exitosamente`);
            },
            error: (err) => {
              console.error('❌ Error actualizando estado en el backend:', err);
              // Actualizar localmente si el backend falla
              empleado.estado = nuevoEstado;
              alert(`Empleado ${accion}do exitosamente (modo local)`);
            },
          });
      } else {
        // Actualizar solo localmente
        empleado.estado = nuevoEstado;
        alert(`Empleado ${accion}do exitosamente (modo local)`);
      }
    }
  }
}
