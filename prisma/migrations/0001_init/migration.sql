-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('SISTEMA', 'CLIENTE');

-- CreateTable
CREATE TABLE "alertasingresostock" (
    "idalerta" SERIAL NOT NULL,
    "idingreso" INTEGER NOT NULL,
    "mensaje" VARCHAR(255) NOT NULL,
    "fechaalerta" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertasingresostock_pkey" PRIMARY KEY ("idalerta")
);

-- CreateTable
CREATE TABLE "carritovirtual" (
    "idcarrito" SERIAL NOT NULL,
    "idcliente" INTEGER NOT NULL,
    "idproducto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "carritovirtual_pkey" PRIMARY KEY ("idcarrito")
);

-- CreateTable
CREATE TABLE "choferes" (
    "idchofer" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "dni" VARCHAR(20) NOT NULL,
    "telefono" VARCHAR(50),
    "email" VARCHAR(100),
    "licenciaconducir" VARCHAR(50) NOT NULL,
    "fechavenclicencia" TIMESTAMP(6) NOT NULL,
    "estado" VARCHAR(50) DEFAULT 'Activo',
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "choferes_pkey" PRIMARY KEY ("idchofer")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "idusuario" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordhash" TEXT NOT NULL,
    "tipousuario" "TipoUsuario" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaalta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("idusuario")
);

-- CreateTable
CREATE TABLE "clientes" (
    "idcliente" SERIAL NOT NULL,
    "idusuario" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "telefono" VARCHAR(20),
    "direccion" VARCHAR(255),
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("idcliente")
);

-- CreateTable
CREATE TABLE "cupones" (
    "idcupon" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "descuentoporcentaje" INTEGER NOT NULL,
    "activo" BOOLEAN DEFAULT true,
    "idpromocion" INTEGER,
    "idcliente" INTEGER,
    "fechavencimiento" TIMESTAMP(6),

    CONSTRAINT "cupones_pkey" PRIMARY KEY ("idcupon")
);

-- CreateTable
CREATE TABLE "detalleingresostock" (
    "iddetalleingreso" SERIAL NOT NULL,
    "idingreso" INTEGER NOT NULL,
    "idproducto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "detalleingresostock_pkey" PRIMARY KEY ("iddetalleingreso")
);

-- CreateTable
CREATE TABLE "detalleordencompra" (
    "iddetalleoc" SERIAL NOT NULL,
    "idorden" INTEGER NOT NULL,
    "idproducto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "preciounitario" DECIMAL(18,2) NOT NULL,
    "subtotal" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "detalleordencompra_pkey" PRIMARY KEY ("iddetalleoc")
);

-- CreateTable
CREATE TABLE "detallepromocion" (
    "iddetalle" SERIAL NOT NULL,
    "idpromocion" INTEGER NOT NULL,
    "idproducto" INTEGER NOT NULL,
    "descuentoporcentaje" INTEGER NOT NULL,

    CONSTRAINT "detallepromocion_pkey" PRIMARY KEY ("iddetalle")
);

-- CreateTable
CREATE TABLE "detalleventas" (
    "iddetalle" SERIAL NOT NULL,
    "idventa" INTEGER NOT NULL,
    "idproducto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "preciounitario" DECIMAL(18,2) NOT NULL,
    "direccionentrega" VARCHAR(200) NOT NULL,
    "indicacionesentrega" VARCHAR(200),

    CONSTRAINT "detalleventas_pkey" PRIMARY KEY ("iddetalle")
);

-- CreateTable
CREATE TABLE "envios" (
    "idenvio" SERIAL NOT NULL,
    "idventa" INTEGER NOT NULL,
    "idruta" INTEGER,
    "direccionentrega" VARCHAR(200) NOT NULL,
    "fechaenvio" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "estado" VARCHAR(50) DEFAULT 'Pendiente',
    "observaciones" VARCHAR(255),
    "comprobanteentrega" VARCHAR(255),
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "envios_pkey" PRIMARY KEY ("idenvio")
);

-- CreateTable
CREATE TABLE "ingresosstock" (
    "idingreso" SERIAL NOT NULL,
    "idorden" INTEGER,
    "fechaingreso" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "observaciones" VARCHAR(255),

    CONSTRAINT "ingresosstock_pkey" PRIMARY KEY ("idingreso")
);

-- CreateTable
CREATE TABLE "notificacioneslogistica" (
    "idnotificacion" SERIAL NOT NULL,
    "idventa" INTEGER NOT NULL,
    "fechaenvio" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "estadonotificacion" VARCHAR(20) DEFAULT 'Pendiente',

    CONSTRAINT "notificacioneslogistica_pkey" PRIMARY KEY ("idnotificacion")
);

-- CreateTable
CREATE TABLE "ordenescompra" (
    "idorden" SERIAL NOT NULL,
    "idproveedor" INTEGER NOT NULL,
    "fechapedido" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "estado" VARCHAR(50) DEFAULT 'Generada',
    "observaciones" VARCHAR(255),
    "total" DECIMAL(18,2) DEFAULT 0,

    CONSTRAINT "ordenescompra_pkey" PRIMARY KEY ("idorden")
);

-- CreateTable
CREATE TABLE "productos" (
    "idproducto" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "precio" DECIMAL(18,2) NOT NULL,
    "stockactual" INTEGER DEFAULT 0,
    "puntoreposicion" INTEGER DEFAULT 5,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("idproducto")
);

-- CreateTable
CREATE TABLE "promociones" (
    "idpromocion" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(255),
    "fechadesde" TIMESTAMP(6) NOT NULL,
    "fechahasta" TIMESTAMP(6) NOT NULL,
    "activa" BOOLEAN DEFAULT true,

    CONSTRAINT "promociones_pkey" PRIMARY KEY ("idpromocion")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "idproveedor" SERIAL NOT NULL,
    "razonsocial" VARCHAR(150) NOT NULL,
    "cuit" VARCHAR(20) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "telefono" VARCHAR(50),
    "direccion" VARCHAR(150),
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("idproveedor")
);

-- CreateTable
CREATE TABLE "puntoscliente" (
    "idpunto" SERIAL NOT NULL,
    "idcliente" INTEGER NOT NULL,
    "idventa" INTEGER,
    "puntosotorgados" INTEGER NOT NULL,
    "fecha" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "concepto" VARCHAR(100) NOT NULL,

    CONSTRAINT "puntoscliente_pkey" PRIMARY KEY ("idpunto")
);

-- CreateTable
CREATE TABLE "rutas" (
    "idruta" SERIAL NOT NULL,
    "nombreruta" VARCHAR(100) NOT NULL,
    "zona" VARCHAR(100) NOT NULL,
    "fecharuta" TIMESTAMP(6) NOT NULL,
    "estado" VARCHAR(50) DEFAULT 'Pendiente',
    "idvehiculo" INTEGER,
    "observaciones" VARCHAR(255),
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "rutas_pkey" PRIMARY KEY ("idruta")
);

-- CreateTable
CREATE TABLE "usocupones" (
    "iduso" SERIAL NOT NULL,
    "idcupon" INTEGER NOT NULL,
    "idventa" INTEGER NOT NULL,

    CONSTRAINT "usocupones_pkey" PRIMARY KEY ("iduso")
);

-- CreateTable
CREATE TABLE "vehiculos" (
    "idvehiculo" SERIAL NOT NULL,
    "patente" VARCHAR(20) NOT NULL,
    "marca" VARCHAR(100) NOT NULL,
    "modelo" VARCHAR(100) NOT NULL,
    "anio" INTEGER NOT NULL,
    "capacidadcarga" DECIMAL(10,2),
    "estado" VARCHAR(50) DEFAULT 'Disponible',
    "idchofer" INTEGER,
    "activo" BOOLEAN DEFAULT true,

    CONSTRAINT "vehiculos_pkey" PRIMARY KEY ("idvehiculo")
);

-- CreateTable
CREATE TABLE "ventas" (
    "idventa" SERIAL NOT NULL,
    "idcliente" INTEGER NOT NULL,
    "fechaventa" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DECIMAL(18,2) NOT NULL,
    "descuento" DECIMAL(18,2) DEFAULT 0,
    "total" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("idventa")
);

-- CreateIndex
CREATE UNIQUE INDEX "choferes_dni_key" ON "choferes"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_idusuario_key" ON "clientes"("idusuario");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cupones_codigo_key" ON "cupones"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "uq_detallepromocion" ON "detallepromocion"("idpromocion", "idproducto");

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_cuit_key" ON "proveedores"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculos_patente_key" ON "vehiculos"("patente");

-- AddForeignKey
ALTER TABLE "alertasingresostock" ADD CONSTRAINT "alertasingresostock_idingreso_fkey" FOREIGN KEY ("idingreso") REFERENCES "ingresosstock"("idingreso") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "carritovirtual" ADD CONSTRAINT "carritovirtual_idcliente_fkey" FOREIGN KEY ("idcliente") REFERENCES "clientes"("idcliente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "carritovirtual" ADD CONSTRAINT "carritovirtual_idproducto_fkey" FOREIGN KEY ("idproducto") REFERENCES "productos"("idproducto") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_idusuario_fkey" FOREIGN KEY ("idusuario") REFERENCES "usuarios"("idusuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cupones" ADD CONSTRAINT "cupones_idcliente_fkey" FOREIGN KEY ("idcliente") REFERENCES "clientes"("idcliente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cupones" ADD CONSTRAINT "cupones_idpromocion_fkey" FOREIGN KEY ("idpromocion") REFERENCES "promociones"("idpromocion") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalleingresostock" ADD CONSTRAINT "detalleingresostock_idingreso_fkey" FOREIGN KEY ("idingreso") REFERENCES "ingresosstock"("idingreso") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalleingresostock" ADD CONSTRAINT "detalleingresostock_idproducto_fkey" FOREIGN KEY ("idproducto") REFERENCES "productos"("idproducto") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalleordencompra" ADD CONSTRAINT "detalleordencompra_idorden_fkey" FOREIGN KEY ("idorden") REFERENCES "ordenescompra"("idorden") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalleordencompra" ADD CONSTRAINT "detalleordencompra_idproducto_fkey" FOREIGN KEY ("idproducto") REFERENCES "productos"("idproducto") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detallepromocion" ADD CONSTRAINT "detallepromocion_idproducto_fkey" FOREIGN KEY ("idproducto") REFERENCES "productos"("idproducto") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detallepromocion" ADD CONSTRAINT "detallepromocion_idpromocion_fkey" FOREIGN KEY ("idpromocion") REFERENCES "promociones"("idpromocion") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalleventas" ADD CONSTRAINT "detalleventas_idproducto_fkey" FOREIGN KEY ("idproducto") REFERENCES "productos"("idproducto") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalleventas" ADD CONSTRAINT "detalleventas_idventa_fkey" FOREIGN KEY ("idventa") REFERENCES "ventas"("idventa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_idruta_fkey" FOREIGN KEY ("idruta") REFERENCES "rutas"("idruta") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_idventa_fkey" FOREIGN KEY ("idventa") REFERENCES "ventas"("idventa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ingresosstock" ADD CONSTRAINT "ingresosstock_idorden_fkey" FOREIGN KEY ("idorden") REFERENCES "ordenescompra"("idorden") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notificacioneslogistica" ADD CONSTRAINT "notificacioneslogistica_idventa_fkey" FOREIGN KEY ("idventa") REFERENCES "ventas"("idventa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ordenescompra" ADD CONSTRAINT "ordenescompra_idproveedor_fkey" FOREIGN KEY ("idproveedor") REFERENCES "proveedores"("idproveedor") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "puntoscliente" ADD CONSTRAINT "puntoscliente_idcliente_fkey" FOREIGN KEY ("idcliente") REFERENCES "clientes"("idcliente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "puntoscliente" ADD CONSTRAINT "puntoscliente_idventa_fkey" FOREIGN KEY ("idventa") REFERENCES "ventas"("idventa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_idvehiculo_fkey" FOREIGN KEY ("idvehiculo") REFERENCES "vehiculos"("idvehiculo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usocupones" ADD CONSTRAINT "usocupones_idcupon_fkey" FOREIGN KEY ("idcupon") REFERENCES "cupones"("idcupon") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usocupones" ADD CONSTRAINT "usocupones_idventa_fkey" FOREIGN KEY ("idventa") REFERENCES "ventas"("idventa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_idchofer_fkey" FOREIGN KEY ("idchofer") REFERENCES "choferes"("idchofer") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_idcliente_fkey" FOREIGN KEY ("idcliente") REFERENCES "clientes"("idcliente") ON DELETE NO ACTION ON UPDATE NO ACTION;
