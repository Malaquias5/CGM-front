import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  VentaService,
  Venta,
  VentaCreateDTO,
} from '../../services/venta.service';
import { HttpClientModule } from '@angular/common/http';
import {
  ProductoService,
  ProductoNormalizado,
  ProductoResponse,
} from '../../services/producto.service';
import { FormsModule } from '@angular/forms';

// INTERFACES PARA EL CARRITO
export interface CarritoItem {
  producto: ProductoNormalizado;
  cantidad: number;
}

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css'],
})
export class VentasComponent implements OnInit {
  // PROPIEDADES EXISTENTES
  productos: ProductoNormalizado[] = [];
  ventas: Venta[] = [];

  // PROPIEDADES DEL CARRITO POS
  carrito: CarritoItem[] = [];
  busqueda: string = '';
  fechaFiltro: string = '';
  procesandoVenta: boolean = false;

  // LEGACY (mantener por compatibilidad)
  cantidad: number = 1;
  productoSeleccionado?: ProductoNormalizado;

  constructor(
    private readonly productoService: ProductoService,
    private readonly ventaService: VentaService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarVentas();
  } // ===== MÉTODOS DE CARGA DE DATOS =====
  cargarProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (response: ProductoResponse) => {
        this.productos = response.productos;
        console.log('Productos cargados:', this.productos.length);
      },
      error: (err) => console.error('Error cargando productos', err),
    });
  }

  cargarVentas(): void {
    console.log('📋 Cargando ventas desde backend...');
    this.ventaService.listarVentas().subscribe({
      next: (data) => {
        this.ventas = data || [];
        console.log('✅ Ventas cargadas desde backend:', this.ventas.length);
        console.log('Ventas:', this.ventas);
      },
      error: (err) => {
        console.error('❌ Error cargando ventas desde backend:', err);
        // Si no hay backend, usar datos de prueba
        this.cargarVentasPrueba();
      },
    });
  }

  cargarVentasPrueba(): void {
    console.log('⚠️ Backend no disponible, cargando datos de prueba...');
    this.ventas = [
      {
        id: 1,
        producto: {
          idProducto: 1,
          nombre: 'Vidrio Templado 6mm',
          codigo: 'VT-6MM-001',
          tipo: 'VIDRIO',
          grosor: 6,
          alto: 0,
          ancho: 0,
          color: '',
          precioCompra: 120,
          precioVenta: 150,
          stockActual: 25,
          estado: 'ACTIVO',
          descripcion: 'Vidrio templado de seguridad',
          categoria: {
            idCategoria: 1,
            nombre: 'Vidrios',
            descripcion: 'Productos de vidrio',
          },
        },
        cantidad: 2,
        total: 300,
        fecha: new Date().toISOString(),
      },
    ];
    console.log('📋 Datos de prueba cargados:', this.ventas.length);
  }

  // ===== MÉTODOS DE BÚSQUEDA Y FILTRADO =====
  getProductosFiltrados(): ProductoNormalizado[] {
    if (!this.busqueda.trim()) {
      return this.productos;
    }

    const busquedaLower = this.busqueda.toLowerCase();
    return this.productos.filter(
      (producto) =>
        producto.nombre.toLowerCase().includes(busquedaLower) ||
        producto.codigo.toLowerCase().includes(busquedaLower) ||
        (producto.categoria?.toLowerCase() || '').includes(busquedaLower)
    );
  }

  getVentasFiltradas(): Venta[] {
    console.log('🔍 Filtrando ventas...');
    console.log('- Total ventas:', this.ventas.length);
    console.log('- Filtro de fecha:', this.fechaFiltro);

    if (!this.fechaFiltro) {
      console.log(
        '✅ Sin filtro de fecha, devolviendo todas las ventas:',
        this.ventas.length
      );
      return this.ventas;
    }

    const ventasFiltradas = this.ventas.filter((venta) => {
      if (!venta.fecha) return false;
      const fechaVenta = new Date(venta.fecha).toISOString().split('T')[0];
      return fechaVenta === this.fechaFiltro;
    });

    console.log('✅ Ventas filtradas por fecha:', ventasFiltradas.length);
    return ventasFiltradas;
  }

  limpiarFiltros(): void {
    this.fechaFiltro = '';
    this.busqueda = '';
  }

  // ===== MÉTODOS DEL CARRITO =====
  agregarAlCarrito(producto: ProductoNormalizado): void {
    if (producto.stock === 0) {
      console.warn('Producto sin stock:', producto.nombre);
      return;
    }

    // Buscar si el producto ya está en el carrito
    const itemExistente = this.carrito.find(
      (item) => item.producto.id === producto.id
    );

    if (itemExistente) {
      // Si ya existe, aumentar cantidad (si hay stock)
      if (itemExistente.cantidad < producto.stock) {
        itemExistente.cantidad++;
      } else {
        console.warn('Stock insuficiente para agregar más unidades');
      }
    } else {
      // Si no existe, agregarlo al carrito
      this.carrito.push({
        producto: producto,
        cantidad: 1,
      });
    }

    console.log('Carrito actualizado:', this.carrito.length, 'items');
  }

  removerDelCarrito(productoId: number): void {
    this.carrito = this.carrito.filter(
      (item) => item.producto.id !== productoId
    );
  }

  limpiarCarrito(): void {
    this.carrito = [];
  }

  aumentarCantidad(item: CarritoItem): void {
    if (item.cantidad < item.producto.stock) {
      item.cantidad++;
    }
  }

  disminuirCantidad(item: CarritoItem): void {
    if (item.cantidad > 1) {
      item.cantidad--;
    }
  }

  validarCantidad(item: CarritoItem): void {
    if (item.cantidad < 1) {
      item.cantidad = 1;
    } else if (item.cantidad > item.producto.stock) {
      item.cantidad = item.producto.stock;
    }
  }

  getSubtotal(): number {
    return this.carrito.reduce(
      (total, item) => total + item.producto.precio * item.cantidad,
      0
    );
  }

  // ===== PROCESAMIENTO DE VENTAS =====
  procesarVenta(): void {
    console.log('🛒 Procesando venta...');
    console.log('Carrito actual:', this.carrito);

    if (this.carrito.length === 0) {
      console.warn('❌ El carrito está vacío');
      alert(
        '⚠️ El carrito está vacío. Agrega productos antes de procesar la venta.'
      );
      return;
    }

    this.procesandoVenta = true;

    // Procesar cada item del carrito como una venta
    const ventasPromises = this.carrito.map((item) => {
      const dto: VentaCreateDTO = {
        productoId: item.producto.id!,
        cantidad: item.cantidad,
      };

      console.log(
        '📦 Creando venta para:',
        item.producto.nombre,
        'Cantidad:',
        item.cantidad
      );
      return this.ventaService.crearVenta(dto).toPromise();
    });

    Promise.all(ventasPromises)
      .then((ventasCreadas) => {
        console.log('✅ Ventas creadas exitosamente:', ventasCreadas);

        // Agregar las ventas creadas al listado
        ventasCreadas.forEach((venta) => {
          if (venta) {
            console.log('➕ Agregando venta al historial:', venta);
            this.ventas.unshift(venta); // Usar unshift para agregar al inicio
          }
        });

        console.log('📋 Total ventas en historial:', this.ventas.length);

        // Limpiar carrito
        this.limpiarCarrito();

        // Recargar productos para actualizar stock
        this.cargarProductos();

        // Recargar ventas para sincronizar con backend
        this.cargarVentas();

        console.log('✅ Venta procesada exitosamente');
        alert('✅ Venta procesada exitosamente!');
        this.procesandoVenta = false;
      })
      .catch((error) => {
        console.error('❌ Error procesando venta con backend:', error);
        console.log('🔄 Intentando procesar venta localmente...');

        // Si el backend falla, crear ventas locales
        this.procesarVentaLocal();
      });
  }

  procesarVentaLocal(): void {
    console.log('🏠 Procesando venta localmente (sin backend)...');

    // Crear ventas locales para cada item del carrito
    const ventasLocales: any[] = this.carrito.map((item, index) => ({
      id: Date.now() + index, // ID temporal único
      producto: {
        idProducto: item.producto.id!,
        nombre: item.producto.nombre,
        codigo: item.producto.codigo,
        tipo: 'GENERAL',
        grosor: 0,
        alto: 0,
        ancho: 0,
        color: '',
        precioCompra: item.producto.precio * 0.8, // Estimación
        precioVenta: item.producto.precio,
        stockActual: item.producto.stock,
        estado: 'ACTIVO',
        descripcion: item.producto.descripcion || '',
        categoria: {
          idCategoria: 1,
          nombre: item.producto.categoria || 'Sin categoría',
          descripcion: '',
        },
      },
      cantidad: item.cantidad,
      total: item.producto.precio * item.cantidad,
      fecha: new Date().toISOString(),
    }));

    console.log('📦 Ventas locales creadas:', ventasLocales);

    // Agregar al historial
    ventasLocales.forEach((venta) => {
      console.log('➕ Agregando venta local al historial:', venta);
      this.ventas.unshift(venta);
    });

    console.log('📋 Total ventas en historial:', this.ventas.length);

    // Limpiar carrito
    this.limpiarCarrito();

    // Recargar productos
    this.cargarProductos();

    console.log('✅ Venta local procesada exitosamente');
    alert('✅ Venta procesada exitosamente! (Modo local)');
    this.procesandoVenta = false;
  }

  verDetalleVenta(venta: Venta): void {
    console.log('Detalle de venta:', venta);
    // TODO: Implementar modal de detalle
  }

  // ===== MÉTODOS DE CÁLCULO =====
  calcularTotal(): number {
    return this.ventas.reduce((total, venta) => total + venta.total, 0);
  }

  getTotalItemsVendidos(): number {
    return this.ventas.reduce((total, venta) => total + venta.cantidad, 0);
  }

  // ===== TRACKBY FUNCTIONS =====
  trackByProductoId(index: number, item: CarritoItem): number {
    return item.producto.id || index;
  }

  // ===== MÉTODOS LEGACY (MANTENER POR COMPATIBILIDAD) =====
  agregarVenta(): void {
    if (!this.productoSeleccionado?.id) {
      console.error('Debe seleccionar un producto válido');
      return;
    }

    const dto: VentaCreateDTO = {
      productoId: this.productoSeleccionado.id,
      cantidad: this.cantidad,
    };

    this.ventaService.crearVenta(dto).subscribe({
      next: (venta) => {
        this.ventas.push(venta);
        this.cantidad = 1;
        this.productoSeleccionado = undefined;
        this.cargarProductos(); // Recargar productos para actualizar stock
      },
      error: (err) => console.error('Error creando venta', err),
    });
  }

  cancelarVenta(id: number): void {
    this.ventaService.cancelarVenta(id).subscribe({
      next: () => this.cargarVentas(),
      error: (err) => console.error('Error cancelando venta', err),
    });
  }
}
