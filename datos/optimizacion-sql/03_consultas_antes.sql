-- Consultas como suelen aparecer en un sistema que creció sin revisar la base.
-- Cada una devuelve el resultado correcto, pero se vuelve lenta a medida que crecen los datos.
-- Las líneas "-- caso:N" las usa medir.py para separar las consultas.

USE optimizacion_sql;

-- caso:1  Historial de un cliente (pantalla "ver pedidos del cliente")
SELECT id, fecha, estado, total
FROM pedidos
WHERE cliente_id = 4242
  AND fecha >= '2025-01-01'
ORDER BY fecha DESC;

-- caso:2  Ventas de un mes (función sobre la columna de fecha)
SELECT COUNT(*) AS pedidos, SUM(total) AS facturado
FROM pedidos
WHERE YEAR(fecha) = 2024 AND MONTH(fecha) = 3
  AND estado <> 'cancelado';

-- caso:3  Clientes de una provincia que no compran hace 3 meses (subconsulta por cada fila)
SELECT c.id, c.nombre,
       (SELECT MAX(p.fecha) FROM pedidos p WHERE p.cliente_id = c.id) AS ultima_compra
FROM clientes c
WHERE c.provincia = 'Tierra del Fuego'
HAVING ultima_compra < '2025-10-01'
ORDER BY c.id;

-- caso:4  Buscar un cliente por CUIT (el CUIT se guarda como texto y se busca como número)
SELECT id, nombre, email, provincia
FROM clientes
WHERE cuit = 30005444397;

-- caso:5  Página 25.001 del listado de pedidos (OFFSET grande)
SELECT id, cliente_id, fecha, total
FROM pedidos
ORDER BY fecha DESC, id DESC
LIMIT 20 OFFSET 500000;

-- caso:6  Los 10 productos más vendidos de un mes
SELECT pr.id, pr.nombre, SUM(i.cantidad) AS unidades, SUM(i.cantidad * i.precio_unitario) AS importe
FROM pedidos p
JOIN pedido_items i ON i.pedido_id = p.id
JOIN productos pr ON pr.id = i.producto_id
WHERE DATE_FORMAT(p.fecha, '%Y-%m') = '2024-03'
GROUP BY pr.id, pr.nombre
ORDER BY unidades DESC, pr.id
LIMIT 10;
