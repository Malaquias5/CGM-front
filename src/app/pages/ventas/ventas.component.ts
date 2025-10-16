import { Component, OnInit } from '@angular/core';
import { Producto, ProductoService } from '../../services/producto.service';
import { VentaService, Venta } from '../../services/venta.service';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit {
  productos: Producto[] = [];
  ventas: Venta[] = [];
  productoSeleccionado!: Producto;
  cantidad: number = 1;

  constructor(private productoService: ProductoService, private ventaService: VentaService) { }

  ngOnInit(): void {
    this.productos = this.productoService.getProductos();
    this.ventas = this.ventaService.getVentas();
    if(this.productos.length > 0) this.productoSeleccionado = this.productos[0];
  }

  agregarVenta() {
    if(this.productoSeleccionado && this.cantidad > 0) {
      this.ventaService.agregarVenta(this.productoSeleccionado, this.cantidad);
      this.ventas = this.ventaService.getVentas();
      this.cantidad = 1;
    }
  }
}
