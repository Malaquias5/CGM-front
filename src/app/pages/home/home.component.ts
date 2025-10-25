import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(private router: Router) {}

  // Métodos de navegación para cada sección
  navigateTo(route: string) {
    console.log('🧭 Navegando a:', route);
    this.router.navigate([route]);
  }

  // Navegación específica para cada módulo
  irAClientes() {
    this.navigateTo('/clientes');
  }

  irAProductos() {
    this.navigateTo('/productos');
  }

  irAVentas() {
    this.navigateTo('/ventas');
  }

  irAEmpleados() {
    this.navigateTo('/empleados');
  }
}