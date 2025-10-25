import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ProductoService,
  ProductoNormalizado,
  ProductoResponse,
} from '../../services/producto.service';

@Component({
  selector: 'app-productos',
  imports: [CurrencyPipe, CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css',
})
export class ProductosComponent implements OnInit {
  productos: ProductoNormalizado[] = [];
  loading = false;

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalProducts = 0;
  totalPages = 0;

  // Filtros
  searchQuery = '';
  selectedCategory = '';
  showOnlyWithStock = false;

  // Modales
  showEditModal = false;
  showStockModal = false;
  showDeleteModal = false;
  selectedProduct: ProductoNormalizado | null = null;

  // Formularios
  productForm: any = {
    nombre: '',
    codigo: '',
    precio: 0,
    stock: 0,
    categoria: '',
    descripcion: '',
    activo: true,
  };

  stockAdjustment: any = {
    cantidad: 1,
    tipo: 'INCREMENTO',
    motivo: '',
  };

  constructor(
    private productoService: ProductoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProductos();
  }

  loadProductos(): void {
    this.loading = true;
    console.log('🔄 Cargando productos desde backend...');

    this.productoService
      .getProductos(
        this.currentPage,
        this.pageSize,
        this.searchQuery || undefined,
        this.selectedCategory || undefined,
        this.showOnlyWithStock || undefined
      )
      .subscribe({
        next: (response: ProductoResponse) => {
          console.log('✅ Productos recibidos:', response);
          this.productos = response.productos;
          this.totalProducts = response.total;
          this.totalPages = Math.ceil(this.totalProducts / this.pageSize);
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error loading productos:', error);
          console.error('Error details:', {
            status: error.status,
            message: error.message,
            url: error.url,
          });
          this.loading = false;

          // Mostrar datos de prueba si el backend no está disponible
          if (error.status === 0 || error.status === 404) {
            console.log('⚠️  Backend no disponible, usando datos de prueba');
            this.cargarDatosPrueba();
          }
        },
      });
  }

  cargarDatosPrueba(): void {
    this.productos = [
      // VIDRIOS
      {
        id: 1,
        nombre: 'Vidrio Templado 6mm',
        codigo: 'VT-6MM-001',
        precio: 150.0,
        stock: 25,
        categoria: 'Vidrios',
        activo: true,
        descripcion: 'Vidrio templado de seguridad 6mm',
      },
      {
        id: 2,
        nombre: 'Vidrio Laminado 8mm',
        codigo: 'VL-8MM-002',
        precio: 180.0,
        stock: 18,
        categoria: 'Vidrios',
        activo: true,
        descripcion: 'Vidrio laminado de seguridad 8mm',
      },
      {
        id: 3,
        nombre: 'Vidrio Float 4mm',
        codigo: 'VF-4MM-003',
        precio: 85.0,
        stock: 35,
        categoria: 'Vidrios',
        activo: true,
        descripcion: 'Vidrio float transparente 4mm',
      },
      // MARCOS
      {
        id: 4,
        nombre: 'Marco Aluminio Standard',
        codigo: 'MA-STD-004',
        precio: 85.5,
        stock: 15,
        categoria: 'Marcos',
        activo: true,
        descripcion: 'Marco de aluminio standard',
      },
      {
        id: 5,
        nombre: 'Marco PVC Blanco',
        codigo: 'MP-BL-005',
        precio: 65.0,
        stock: 22,
        categoria: 'Marcos',
        activo: true,
        descripcion: 'Marco de PVC color blanco',
      },
      {
        id: 6,
        nombre: 'Marco Madera Roble',
        codigo: 'MM-ROB-006',
        precio: 120.0,
        stock: 8,
        categoria: 'Marcos',
        activo: true,
        descripcion: 'Marco de madera roble natural',
      },
      // ACCESORIOS
      {
        id: 7,
        nombre: 'Bisagra Premium',
        codigo: 'BP-001-007',
        precio: 12.75,
        stock: 100,
        categoria: 'Accesorios',
        activo: true,
        descripcion: 'Bisagra premium para puertas',
      },
      {
        id: 8,
        nombre: 'Manija Acero Inox',
        codigo: 'MAI-008',
        precio: 25.0,
        stock: 45,
        categoria: 'Accesorios',
        activo: true,
        descripcion: 'Manija de acero inoxidable',
      },
      {
        id: 9,
        nombre: 'Cerradura Seguridad',
        codigo: 'CS-009',
        precio: 75.0,
        stock: 12,
        categoria: 'Accesorios',
        activo: true,
        descripcion: 'Cerradura de seguridad multipunto',
      },
    ];
    this.totalProducts = this.productos.length;
    this.totalPages = 1;
  }

  // ACCIONES DE TABLA
  confirmarEliminar(producto: ProductoNormalizado): void {
    this.selectedProduct = producto;
    this.showDeleteModal = true;
  }

  eliminarProducto(): void {
    if (!this.selectedProduct?.id) {
      alert('❌ Error: No se puede eliminar el producto');
      return;
    }

    const confirmacion = confirm(
      `¿Estás seguro de que quieres eliminar el producto "${this.selectedProduct.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmacion) {
      return;
    }

    this.loading = true;
    console.log('🗑️ Eliminando producto:', this.selectedProduct);

    this.productoService.eliminarProducto(this.selectedProduct.id).subscribe({
      next: () => {
        console.log('✅ Producto eliminado correctamente');
        this.loading = false;
        alert('✅ Producto eliminado exitosamente');
        this.showDeleteModal = false;
        this.selectedProduct = null;
        this.loadProductos();
      },
      error: (error) => {
        console.error('❌ Error eliminando producto:', error);
        this.loading = false;

        if (error.status === 0) {
          // Backend no disponible, eliminar localmente
          this.eliminarProductoLocal();
        } else if (error.status === 409) {
          alert(
            '❌ No se puede eliminar: El producto está siendo usado en ventas'
          );
        } else {
          alert(
            '❌ Error al eliminar el producto: ' +
              (error.message || 'Error desconocido')
          );
        }
      },
    });
  }

  eliminarProductoLocal(): void {
    if (this.selectedProduct) {
      const index = this.productos.findIndex(
        (p) => p.id === this.selectedProduct?.id
      );
      if (index > -1) {
        this.productos.splice(index, 1);
        this.totalProducts = this.productos.length;
        console.log('✅ Producto eliminado localmente');
        alert('✅ Producto eliminado exitosamente (modo local)');
        this.showDeleteModal = false;
        this.selectedProduct = null;
      }
    }
  }

  toggleEstado(producto: ProductoNormalizado): void {
    if (!producto.id) {
      alert('❌ Error: No se puede cambiar el estado del producto');
      return;
    }

    const nuevoEstado = !producto.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';

    const confirmacion = confirm(
      `¿Estás seguro de que quieres ${accion} el producto "${producto.nombre}"?`
    );

    if (!confirmacion) {
      return;
    }

    console.log(
      `🔄 Cambiando estado del producto ${producto.nombre} a ${
        nuevoEstado ? 'activo' : 'inactivo'
      }`
    );

    this.productoService.toggleEstado(producto.id).subscribe({
      next: () => {
        console.log('✅ Estado cambiado exitosamente');
        alert(`✅ Producto ${accion} exitosamente`);
        this.loadProductos();
      },
      error: (error) => {
        console.error('❌ Error cambiando estado:', error);

        if (error.status === 0) {
          // Backend no disponible, cambiar localmente
          producto.activo = nuevoEstado;
          const index = this.productos.findIndex((p) => p.id === producto.id);
          if (index > -1) {
            this.productos[index].activo = nuevoEstado;
          }
          console.log('✅ Estado cambiado localmente');
          alert(`✅ Producto ${accion} exitosamente (modo local)`);
        } else {
          alert(
            '❌ Error al cambiar el estado: ' +
              (error.message || 'Error desconocido')
          );
        }
      },
    });
  }

  // PAGINACIÓN
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProductos();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProductos();
    }
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadProductos();
  }

  changePageSize(): void {
    this.currentPage = 1;
    this.loadProductos();
  }

  // BÚSQUEDA Y FILTROS
  getProductosFiltrados(): ProductoNormalizado[] {
    console.log('🔍 Aplicando filtros:');
    console.log('- Categoría seleccionada:', this.selectedCategory);
    console.log('- Total productos:', this.productos.length);

    let productosFiltrados = [...this.productos];

    // Filtro por texto de búsqueda
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      productosFiltrados = productosFiltrados.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(query) ||
          producto.codigo.toLowerCase().includes(query) ||
          (producto.categoria &&
            producto.categoria.toLowerCase().includes(query))
      );
      console.log(
        '- Después de filtro de búsqueda:',
        productosFiltrados.length
      );
    }

    // Filtro por categoría
    if (this.selectedCategory) {
      console.log('- Filtrando por categoría:', this.selectedCategory);
      productosFiltrados = productosFiltrados.filter((producto) => {
        const coincide = producto.categoria === this.selectedCategory;
        console.log(
          `  * ${producto.nombre} (${producto.categoria}) -> ${
            coincide ? '✅' : '❌'
          }`
        );
        return coincide;
      });
      console.log(
        '- Después de filtro de categoría:',
        productosFiltrados.length
      );
    }

    // Filtro por stock
    if (this.showOnlyWithStock) {
      productosFiltrados = productosFiltrados.filter(
        (producto) => producto.stock > 0
      );
      console.log('- Después de filtro de stock:', productosFiltrados.length);
    }

    console.log('✅ Productos filtrados finales:', productosFiltrados.length);
    return productosFiltrados;
  }

  buscar(): void {
    // Los filtros se aplican en tiempo real a través de getProductosFiltrados()
    // No necesitamos recargar desde el servidor para filtros de frontend
  }

  limpiarFiltros(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.showOnlyWithStock = false;
    this.currentPage = 1;
    this.loadProductos();
  }

  // MODALES
  closeModal(): void {
    this.showEditModal = false;
    this.showStockModal = false;
    this.showDeleteModal = false;
    this.selectedProduct = null;
    this.resetProductForm();
    this.resetStockForm();
  }

  resetStockForm(): void {
    this.stockAdjustment = {
      cantidad: 1,
      tipo: 'INCREMENTO',
      motivo: '',
    };
  }

  onProductSaved(): void {
    this.closeModal();
    this.loadProductos();
  }

  onStockAdjusted(): void {
    this.closeModal();
    this.loadProductos();
  }

  // FORMULARIO PRODUCTO
  resetProductForm(): void {
    this.productForm = {
      nombre: '',
      codigo: '',
      precio: 0,
      stock: 0,
      categoria: '',
      descripcion: '',
      activo: true,
    };
  }

  loadProductToForm(producto: ProductoNormalizado): void {
    this.productForm = {
      nombre: producto.nombre,
      codigo: producto.codigo,
      precio: producto.precio,
      stock: producto.stock,
      categoria: producto.categoria || '',
      descripcion: producto.descripcion || '',
      activo: producto.activo,
    };
  }

  saveProduct(): void {
    console.log('💾 Intentando actualizar producto...');
    console.log('📋 Datos del formulario:', this.productForm);

    // Validaciones mejoradas
    if (!this.productForm.nombre?.trim()) {
      alert('⚠️ El nombre del producto es obligatorio');
      return;
    }

    if (!this.productForm.codigo?.trim()) {
      alert('⚠️ El código del producto es obligatorio');
      return;
    }

    if (
      this.productForm.precio === null ||
      this.productForm.precio === undefined ||
      this.productForm.precio < 0
    ) {
      alert('⚠️ El precio debe ser mayor o igual a 0');
      return;
    }

    if (
      this.productForm.stock === null ||
      this.productForm.stock === undefined ||
      this.productForm.stock < 0
    ) {
      alert('⚠️ El stock debe ser mayor o igual a 0');
      return;
    }

    if (!this.productForm.categoria?.trim()) {
      alert('⚠️ La categoría del producto es obligatoria');
      return;
    }

    if (!this.selectedProduct?.id) {
      alert('❌ Error: No se puede actualizar el producto');
      return;
    }

    console.log('✅ Validaciones pasadas, actualizando...');
    this.loading = true;

    // Preparar datos limpios
    const productData = {
      nombre: this.productForm.nombre.trim(),
      codigo: this.productForm.codigo.trim(),
      precio: Number(this.productForm.precio),
      stock: Number(this.productForm.stock),
      categoria: this.productForm.categoria.trim(),
      descripcion: this.productForm.descripcion?.trim() || '',
      activo: Boolean(this.productForm.activo),
    };

    console.log('📦 Datos preparados para envío:', productData);
    console.log(
      '📝 Actualizando producto existente con ID:',
      this.selectedProduct.id
    );

    this.productoService
      .actualizarProducto(this.selectedProduct.id, productData)
      .subscribe({
        next: () => {
          console.log('✅ Producto actualizado exitosamente');
          this.loading = false;
          alert('✅ Producto actualizado exitosamente');
          this.onProductSaved();
        },
        error: (error) => {
          console.error('❌ Error actualizando producto:', error);
          this.loading = false;

          if (error.status === 0) {
            // Backend no disponible, actualizar localmente
            this.actualizarProductoLocal(productData);
          } else {
            alert(
              '❌ Error al actualizar el producto: ' +
                (error.message || 'Error desconocido')
            );
          }
        },
      });
  }

  // Actualizar producto localmente cuando el backend no está disponible
  actualizarProductoLocal(productData: any): void {
    if (this.selectedProduct) {
      const index = this.productos.findIndex(
        (p) => p.id === this.selectedProduct?.id
      );
      if (index > -1) {
        this.productos[index] = { ...this.productos[index], ...productData };
        console.log('✅ Producto actualizado localmente');
        alert('✅ Producto actualizado exitosamente (modo local)');
        this.onProductSaved();
      }
    }
  }

  // EDITAR PRODUCTO
  editarProducto(producto: ProductoNormalizado): void {
    this.selectedProduct = producto;
    this.loadProductToForm(producto);
    this.showEditModal = true;
  }

  // AJUSTAR STOCK
  ajustarStock(producto: ProductoNormalizado): void {
    this.selectedProduct = producto;
    this.resetStockForm();
    this.showStockModal = true;
  }

  ajustarStockConfirm(): void {
    if (!this.selectedProduct?.id) {
      alert('❌ Error: No se puede ajustar el stock');
      return;
    }

    if (!this.stockAdjustment.cantidad || this.stockAdjustment.cantidad <= 0) {
      alert('⚠️ La cantidad debe ser mayor a 0');
      return;
    }

    if (!this.stockAdjustment.motivo?.trim()) {
      alert('⚠️ El motivo del ajuste es obligatorio');
      return;
    }

    // Validar stock suficiente para decrementos
    if (this.stockAdjustment.tipo === 'DECREMENTO') {
      const nuevoStock =
        (this.selectedProduct.stock || 0) - this.stockAdjustment.cantidad;
      if (nuevoStock < 0) {
        alert('❌ Stock insuficiente para el decremento solicitado');
        return;
      }
    }

    this.loading = true;
    console.log('📊 Ajustando stock:', {
      producto: this.selectedProduct.nombre,
      tipo: this.stockAdjustment.tipo,
      cantidad: this.stockAdjustment.cantidad,
      motivo: this.stockAdjustment.motivo,
    });

    this.productoService
      .ajustarStock(this.selectedProduct.id, {
        cantidad: Number(this.stockAdjustment.cantidad),
        tipo: this.stockAdjustment.tipo,
        motivo: this.stockAdjustment.motivo.trim(),
      })
      .subscribe({
        next: () => {
          console.log('✅ Stock ajustado exitosamente');
          this.loading = false;
          alert(
            `✅ Stock ${this.stockAdjustment.tipo.toLowerCase()} exitosamente`
          );
          this.onStockAdjusted();
        },
        error: (error) => {
          console.error('❌ Error ajustando stock:', error);
          this.loading = false;

          if (error.status === 0) {
            // Backend no disponible, ajustar localmente
            this.ajustarStockLocal();
          } else if (error.status === 409) {
            alert('❌ Stock insuficiente para realizar el decremento');
          } else {
            alert(
              '❌ Error al ajustar el stock: ' +
                (error.message || 'Error desconocido')
            );
          }
        },
      });
  }

  ajustarStockLocal(): void {
    if (this.selectedProduct) {
      const cambio =
        this.stockAdjustment.tipo === 'INCREMENTO'
          ? this.stockAdjustment.cantidad
          : -this.stockAdjustment.cantidad;

      this.selectedProduct.stock = (this.selectedProduct.stock || 0) + cambio;

      // Actualizar en la lista local
      const index = this.productos.findIndex(
        (p) => p.id === this.selectedProduct?.id
      );
      if (index > -1) {
        this.productos[index].stock = this.selectedProduct.stock;
      }

      console.log('✅ Stock ajustado localmente');
      alert(
        `✅ Stock ${this.stockAdjustment.tipo.toLowerCase()} exitosamente (modo local)`
      );
      this.onStockAdjusted();
    }
  }
}
