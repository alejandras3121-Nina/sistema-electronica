-- Eliminar y crear base de datos
DROP DATABASE IF EXISTS bd_sistema_ventas;
CREATE DATABASE IF NOT EXISTS bd_sistema_ventas;
USE bd_sistema_ventas;

-- ================================
-- CREACIÓN DE TABLAS
-- ================================

-- Tabla: tb_cliente
CREATE TABLE tb_cliente (
  idCliente INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(30) NOT NULL,
  apellido VARCHAR(30) NOT NULL,
  cedula VARCHAR(15) NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  direccion VARCHAR(100) NOT NULL,
  estado INT NOT NULL,
  PRIMARY KEY (idCliente)
);

-- Tabla: tb_categoria
CREATE TABLE tb_categoria (
  idCategoria INT NOT NULL AUTO_INCREMENT,
  descripcion VARCHAR(200) NOT NULL,
  estado INT NOT NULL,
  PRIMARY KEY (idCategoria)
);

-- Tabla: tb_proveedor
CREATE TABLE tb_proveedor (
  idProveedor INT NOT NULL AUTO_INCREMENT,
  nombreEmpresa VARCHAR(100) NOT NULL,
  nombreContacto VARCHAR(50) NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  direccion VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL,
  estado INT NOT NULL,
  PRIMARY KEY (idProveedor)
);

-- Tabla: tb_producto
CREATE TABLE tb_producto (
  idProducto INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  cantidad INT NOT NULL,
  precio DOUBLE(10,2) NOT NULL,
  descripcion VARCHAR(200) NOT NULL,
  porcentajeIva INT NOT NULL,
  idCategoria INT NOT NULL,
  idProveedor INT NOT NULL,
  estado INT NOT NULL,
  PRIMARY KEY (idProducto),
  FOREIGN KEY (idCategoria) REFERENCES tb_categoria(idCategoria),
  FOREIGN KEY (idProveedor) REFERENCES tb_proveedor(idProveedor)
);

-- Tabla: tb_cabecera_venta
CREATE TABLE tb_cabecera_venta (
  idCabeceraVenta INT NOT NULL AUTO_INCREMENT,
  idCliente INT NOT NULL,
  valorPagar DOUBLE(10,2) NOT NULL,
  fechaVenta DATE NOT NULL,
  estado INT NOT NULL,
  PRIMARY KEY (idCabeceraVenta),
  FOREIGN KEY (idCliente) REFERENCES tb_cliente(idCliente)
);

-- Tabla: tb_detalle_venta
CREATE TABLE tb_detalle_venta (
  idDetalleVenta INT NOT NULL AUTO_INCREMENT,
  idCabeceraVenta INT NOT NULL,
  idProducto INT NOT NULL,
  cantidad INT NOT NULL,
  precioUnitario DOUBLE(10,2) NOT NULL,
  subtotal DOUBLE(10,2) NOT NULL,
  descuento DOUBLE(10,2) NOT NULL,
  iva DOUBLE(10,2) NOT NULL,
  totalPagar DOUBLE(10,2) NOT NULL,
  estado INT NOT NULL,
  PRIMARY KEY (idDetalleVenta),
  FOREIGN KEY (idCabeceraVenta) REFERENCES tb_cabecera_venta(idCabeceraVenta),
  FOREIGN KEY (idProducto) REFERENCES tb_producto(idProducto)
);

-- Tabla: tb_tipo_usuario
CREATE TABLE tb_tipo_usuario (
  idTipoUsuario INT NOT NULL AUTO_INCREMENT,
  descripcion VARCHAR(50) NOT NULL, -- Ejemplo: 'Administrador', 'Empleado'
  PRIMARY KEY (idTipoUsuario)
);

-- Tabla: tb_usuario
CREATE TABLE tb_usuario (
  idUsuario INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(30) NOT NULL,
  apellido VARCHAR(30) NOT NULL,
  usuario VARCHAR(15) NOT NULL,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  idTipoUsuario INT NOT NULL,
  estado INT NOT NULL,
  PRIMARY KEY (idUsuario),
  FOREIGN KEY (idTipoUsuario) REFERENCES tb_tipo_usuario(idTipoUsuario)
);
-- ================================
-- INSERCIÓN DE DATOS
-- ================================

-- Datos: tb_cliente
INSERT INTO tb_cliente VALUES 
(1, 'Rosario', 'Silva', '12345678', '9631464747', '1 calle sur poniente', 1),
(2, 'María', 'González', '23456789', '9631234567', '2 avenida norte', 1),
(3, 'Carlos', 'Rodríguez', '34567890', '9632345678', '3 calle oriente', 1),
(4, 'Ana', 'Martínez', '45678901', '9633456789', '4 avenida sur', 1),
(5, 'Pedro', 'López', '56789012', '9634567890', '5 calle poniente', 1),
(6, 'Laura', 'Hernández', '67890123', '9635678901', '6 avenida central', 1),
(7, 'José', 'García', '78901234', '9636789012', '7 calle norte', 1),
(8, 'Carmen', 'Jiménez', '89012345', '9637890123', '8 avenida este', 1);

-- Datos: tb_categoria
INSERT INTO tb_categoria VALUES 
(1, 'Redes', 1),
(2, 'Hardware', 1),
(3, 'Software', 1),
(4, 'Periféricos', 1),
(5, 'Cables', 1),
(6, 'Accesorios', 1),
(7, 'Servidores', 1);

-- Datos: tb_proveedor
INSERT INTO tb_proveedor VALUES 
(1, 'CompuRed S.A.', 'Luis Herrera', '999111222', 'Zona Industrial 123', 'ventas@compured.com', 1),
(2, 'Electronet', 'Sandra Ruiz', '888333444', 'Av. Central #456', 'info@electronet.com', 1),
(3, 'TechDistribuidora', 'Carlos Mena', '777666555', 'Bodega Norte, sector 4', 'contacto@techdist.com', 1);

-- Datos: tb_producto (ahora con idProveedor al final)
INSERT INTO tb_producto VALUES 
(1, 'rj45', 30, 20.00, 'clavija rj45 para cable de redes', 14, 1, 1, 1),
(2, 'Cable UTP Cat5e', 100, 25.50, 'Cable de red categoría 5e', 14, 5, 1, 1),
(3, 'Mouse óptico', 50, 45.00, 'Mouse óptico USB', 14, 4, 2, 1),
(4, 'Teclado mecánico', 20, 95.00, 'Teclado mecánico retroiluminado', 14, 4, 2, 1),
(5, 'Licencia Antivirus', 40, 35.00, 'Antivirus por 1 año', 14, 3, 3, 1);

-- Datos: tb_cabecera_venta
INSERT INTO tb_cabecera_venta VALUES 
(1, 1, 456.00, '2025-02-24', 1),
(2, 6, 342.00, '2025-03-03', 1);

-- Datos: tb_detalle_venta
INSERT INTO tb_detalle_venta VALUES 
(1, 1, 1, 20, 20.00, 400.00, 0.00, 56.00, 456.00, 1),
(2, 2, 4, 1, 95.00, 95.00, 0.00, 13.30, 108.30, 1),
(3, 2, 3, 4, 45.00, 180.00, 0.00, 25.20, 205.20, 1),
(4, 2, 5, 3, 35.00, 105.00, 0.00, 14.70, 119.70, 1);

-- Datos: tb_tipo_usuario
INSERT INTO tb_tipo_usuario VALUES 
(1, 'Administrador'),
(2, 'Empleado');

-- Datos: tb_usuario (añadiendo el campo idTipoUsuario antes de estado)
INSERT INTO tb_usuario VALUES 
(1, 'Luis', 'Silva', 'pinto', '1234abc', '9635699595', 1, 1),
(2, 'María', 'Pérez', 'mperez', 'admin123', '9631234567', 1, 1),
(3, 'Carlos', 'Ruiz', 'cruiz', 'pass456', '9632345678', 2, 1),
(4, 'Ana', 'Torres', 'atorres', 'user789', '9633456789', 2, 1),
(5, 'Roberto', 'Vega', 'rvega', 'sistema2024', '9634567890', 2, 1),
(6, 'Elena', 'Castro', 'ecastro', 'ventas123', '9635678901', 2, 1);
