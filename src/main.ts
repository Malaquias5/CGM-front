import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ProductosComponent } from './app/pages/productos/productos.component';
import { VentasComponent } from './app/pages/ventas/ventas.component';
import { EmpleadosComponent } from './app/pages/empleados/empleados.component';
import { HomeComponent } from './app/pages/home/home.component';
import { ClientesComponent } from './app/pages/clientes/clientes.component';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      HttpClientModule,
      RouterModule.forRoot([
        { path: '', component: HomeComponent },
        { path: 'productos', component: ProductosComponent },
        { path: 'ventas', component: VentasComponent },
        { path: 'empleados', component: EmpleadosComponent },
        { path: 'clientes', component: ClientesComponent },
      ])
    ),
  ],
}).catch((err) => console.error(err));
