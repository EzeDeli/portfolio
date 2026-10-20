-- Datos de prueba: 100.000 clientes, 5.000 productos, 1.000.000 de pedidos y 2.000.000 de ítems.
-- Se generan con SQL puro y salen siempre iguales (no usan RAND), así los tiempos se pueden repetir.

USE optimizacion_sql;

-- Tabla auxiliar con los números del 1 al 1.000.000
CREATE TEMPORARY TABLE digitos (d TINYINT UNSIGNED NOT NULL);
INSERT INTO digitos VALUES (0),(1),(2),(3),(4),(5),(6),(7),(8),(9);

CREATE TABLE numeros (n INT UNSIGNED NOT NULL PRIMARY KEY) ENGINE=InnoDB;
INSERT INTO numeros
SELECT 1 + a.d + 10*b.d + 100*c.d + 1000*e.d + 10000*f.d + 100000*g.d
FROM digitos a, digitos b, digitos c, digitos e, digitos f, digitos g;

INSERT INTO clientes
SELECT n,
       CONCAT('Cliente ', n),
       CONCAT('cliente', n, '@correo.com'),
       CONCAT(ELT(1 + n % 3, '20', '27', '30'), LPAD(n * 7 % 100000000, 8, '0'), n % 10),
       ELT(1 + n % 24, 'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
           'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza',
           'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
           'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'),
       '2018-01-01' + INTERVAL (n % 2500) DAY
FROM numeros WHERE n <= 100000;

INSERT INTO productos
SELECT n,
       CONCAT('Producto ', n),
       ELT(1 + n % 8, 'Almacén', 'Bebidas', 'Limpieza', 'Perfumería', 'Ferretería',
           'Electricidad', 'Librería', 'Bazar'),
       500 + (n * 137 % 99500)
FROM numeros WHERE n <= 5000;

INSERT INTO pedidos
SELECT n,
       1 + (n * 7919) % 100000,
       '2023-01-01' + INTERVAL ((n * 7) % (3 * 365 * 24 * 60)) MINUTE,
       ELT(1 + n % 10, 'entregado', 'entregado', 'entregado', 'entregado', 'entregado',
           'entregado', 'entregado', 'pendiente', 'en_camino', 'cancelado'),
       1000 + (n * 7907 % 500000)
FROM numeros;

INSERT INTO pedido_items
SELECT 2 * n - k,
       n,
       1 + ((2 * n - k) * 263) % 5000,
       1 + (2 * n - k) % 5,
       500 + ((2 * n - k) * 137 % 99500)
FROM numeros, (SELECT 0 AS k UNION ALL SELECT 1) dos;

DROP TABLE numeros;
ANALYZE TABLE clientes, productos, pedidos, pedido_items;
