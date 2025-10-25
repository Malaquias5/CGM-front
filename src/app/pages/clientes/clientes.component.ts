import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService, Cliente } from '../../services/cliente.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css'],
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  error: string = '';
  loading: boolean = false;

  // Paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalClientes: number = 0;
  totalPages: number = 0;

  // Búsqueda
  searchQuery: string = '';

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    this.loading = true;
    this.error = '';

    console.log('🔄 Cargando clientes desde backend...');

    this.clienteService.getClientes().subscribe({
      next: (data) => {
        console.log('✅ Clientes recibidos:', data);
        this.clientes = data;
        this.aplicarFiltrosYPaginacion();
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error cargando clientes:', err);
        console.error('Error details:', {
          status: err.status,
          message: err.message,
          url: err.url,
        });
        this.error = `Error cargando clientes: ${err.message || err}`;
        this.loading = false;

        // Mostrar datos de prueba si el backend no está disponible
        if (err.status === 0 || err.status === 404) {
          console.log('⚠️  Backend no disponible, usando datos de prueba');
          this.cargarDatosPruebaClientes();
        }
      },
    });
  }

  cargarDatosPruebaClientes(): void {
    this.clientes = [
      {
        idCliente: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@email.com',
        telefono: '555-0101',
        direccion: 'Av. Principal 123',
        tipoDocumento: 'DNI',
        documento: '12345678',
        tipoCliente: 'Regular',
      },
      {
        idCliente: 2,
        nombre: 'María',
        apellido: 'García',
        email: 'maria.garcia@email.com',
        telefono: '555-0102',
        direccion: 'Calle Secundaria 456',
        tipoDocumento: 'DNI',
        documento: '87654321',
        tipoCliente: 'Premium',
      },
      {
        idCliente: 3,
        nombre: 'Carlos',
        apellido: 'López',
        email: 'carlos.lopez@email.com',
        telefono: '555-0103',
        direccion: 'Boulevard Central 789',
        tipoDocumento: 'DNI',
        documento: '11223344',
        tipoCliente: 'Regular',
      },
    ];
    this.error = '';
    this.aplicarFiltrosYPaginacion();
  }

  // PAGINACIÓN Y FILTRADO
  aplicarFiltrosYPaginacion(): void {
    // Filtrar clientes
    let clientesFiltrados = [...this.clientes];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      clientesFiltrados = clientesFiltrados.filter(
        (cliente) =>
          cliente.nombre.toLowerCase().includes(query) ||
          cliente.apellido.toLowerCase().includes(query) ||
          cliente.email.toLowerCase().includes(query) ||
          cliente.documento.includes(query) ||
          cliente.telefono.includes(query)
      );
    }

    // Calcular paginación
    this.totalClientes = clientesFiltrados.length;
    this.totalPages = Math.ceil(this.totalClientes / this.pageSize);

    // Aplicar paginación
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.clientesFiltrados = clientesFiltrados.slice(startIndex, endIndex);

    console.log(
      `📄 Página ${this.currentPage} de ${this.totalPages} - Mostrando ${this.clientesFiltrados.length} de ${this.totalClientes} clientes`
    );
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
  editarCliente(cliente: Cliente): void {
    console.log('✏️ Editando cliente:', cliente);
    // TODO: Implementar modal de edición
    alert(
      `Editando cliente: ${cliente.nombre} ${cliente.apellido}\n\nFuncionalidad en desarrollo...`
    );
  }

  eliminarCliente(cliente: Cliente): void {
    console.log('🗑️ Eliminando cliente:', cliente);

    const confirmacion = confirm(
      `¿Estás seguro de que quieres eliminar al cliente ${cliente.nombre} ${cliente.apellido}?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmacion) {
      if (cliente.idCliente) {
        // Intentar eliminar del backend
        this.clienteService.eliminarCliente(cliente.idCliente).subscribe({
          next: () => {
            console.log('✅ Cliente eliminado del backend');
            this.loadClientes(); // Recargar la lista
            alert('Cliente eliminado exitosamente');
          },
          error: (err) => {
            console.error('❌ Error eliminando del backend:', err);
            // Eliminar localmente si el backend falla
            this.eliminarClienteLocal(cliente);
          },
        });
      } else {
        // Eliminar solo localmente
        this.eliminarClienteLocal(cliente);
      }
    }
  }

  eliminarClienteLocal(cliente: Cliente): void {
    const index = this.clientes.findIndex(
      (c) =>
        c.idCliente === cliente.idCliente ||
        (c.nombre === cliente.nombre && c.apellido === cliente.apellido)
    );

    if (index > -1) {
      this.clientes.splice(index, 1);
      console.log('✅ Cliente eliminado localmente');
      alert('Cliente eliminado exitosamente (modo local)');
    }
  }
}
