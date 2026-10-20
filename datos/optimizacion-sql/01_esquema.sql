-- Base de una distribuidora: clientes, productos, pedidos y el detalle de cada pedido.
-- Arranca como suelen estar los sistemas heredados: solo con las claves primarias.

DROP DATABASE IF EXISTS optimizacion_sql;
CREATE DATABASE optimizacion_sql CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE optimizacion_sql;

CREATE TABLE clientes (
    id          INT UNSIGNED  NOT NULL PRIMARY KEY,
    nombre      VARCHAR(100)  NOT NULL,
    email       VARCHAR(120)  NOT NULL,
    cuit        VARCHAR(11)   NOT NULL,   -- se guarda como texto, sin guiones
    provincia   VARCHAR(40)   NOT NULL,
    fecha_alta  DATE          NOT NULL
) ENGINE=InnoDB;

CREATE TABLE productos (
    id          INT UNSIGNED  NOT NULL PRIMARY KEY,
    nombre      VARCHAR(100)  NOT NULL,
    categoria   VARCHAR(40)   NOT NULL,
    precio      DECIMAL(12,2) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE pedidos (
    id          INT UNSIGNED  NOT NULL PRIMARY KEY,
    cliente_id  INT UNSIGNED  NOT NULL,
    fecha       DATETIME      NOT NULL,
    estado      VARCHAR(20)   NOT NULL,
    total       DECIMAL(14,2) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE pedido_items (
    id               INT UNSIGNED  NOT NULL PRIMARY KEY,
    pedido_id        INT UNSIGNED  NOT NULL,
    producto_id      INT UNSIGNED  NOT NULL,
    cantidad         SMALLINT      NOT NULL,
    precio_unitario  DECIMAL(12,2) NOT NULL
) ENGINE=InnoDB;
