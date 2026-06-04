import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { CuponesModule } from './cupones/cupones.module';
import { ConfigModule } from '@nestjs/config';
import { PromocionesModule } from './promociones/promociones.module';
import { ClientesModule } from './clientes/clientes.module';
import { VentasModule } from './ventas/ventas.module';
import { ProductosModule } from './productos/productos.module';
import { UsuariosModule } from './usuarios/Usuarios.module';
import { AuthModule } from './auth/auth.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { PuntosModule } from './puntos/punto.module';
import { OrdenesCompraModule } from './ordenes-compra/ordenes-compra.module';
import { AlertasStockModule } from './alertas-stock/alertas-stock.module';
import { IngresosStockModule } from './ingresos-stock/ingresos-stock.module';
import { EnviosModule } from './envios/envios.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { ChoferesModule } from './choferes/choferes.module';
import { RutasModule } from './rutas/rutas.module';
import { CarritoModule } from './carrito/carrito.module';


@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, CuponesModule, PromocionesModule, ClientesModule, VentasModule, ProductosModule, UsuariosModule, ProveedoresModule, PuntosModule, OrdenesCompraModule, AlertasStockModule, IngresosStockModule, EnviosModule, VehiculosModule, ChoferesModule, RutasModule, CarritoModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
