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


@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, CuponesModule, PromocionesModule, ClientesModule, VentasModule, ProductosModule, UsuariosModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
