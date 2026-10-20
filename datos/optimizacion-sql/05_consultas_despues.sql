-- Las mismas consultas, reescritas para que puedan usar los índices.
-- Devuelven exactamente el mismo resultado (medir.py lo comprueba).

USE optimizacion_sql;

-- caso:1  Sin cambios: alcanza con el índice (cliente_id, fecha).
SELECT id, fecha, estado, total
FROM pedidos
WHERE cliente_id = 4242
  AND fecha >= '2025-01-01'
ORDER BY fecha DESC;

-- caso:2  Rango de fechas en lugar de YEAR() y MONTH(): así la base puede usar el índice.
SELECT COUNT(*) AS pedidos, SUM(total) AS facturado
FROM pedidos
WHERE fecha >= '2024-03-01' AND fecha < '2024-04-01'
  AND estado <> 'cancelado';

-- caso:3  Un JOIN con GROUP BY recorre los pedidos una sola vez, en vez de una subconsulta por cliente.
SELECT c.id, c.nombre, MAX(p.fecha) AS ultima_compra
FROM clientes c
JOIN pedidos p ON p.cliente_id = c.id
WHERE c.provincia = 'Tierra del Fuego'
GROUP BY c.id, c.nombre
HAVING ultima_compra < '2025-10-01'
ORDER BY c.id;

-- caso:4  El CUIT entre comillas: se compara texto con texto y se usa el índice.
SELECT id, nombre, email, provincia
FROM clientes
WHERE cuit = '30005444397';

-- caso:5  Paginación por cursor: se sigue desde la última fila de la página anterior
--         (fecha 2024-05-02 08:43:00, id 776029) en lugar de saltear 500.000 filas.
SELECT id, cliente_id, fecha, total
FROM pedidos
WHERE fecha < '2024-05-02 08:43:00'
   OR (fecha = '2024-05-02 08:43:00' AND id < 776029)
ORDER BY fecha DESC, id DESC
LIMIT 20;

-- caso:6  Rango de fechas y JOIN por la clave foránea indexada.
SELECT pr.id, pr.nombre, SUM(i.cantidad) AS unidades, SUM(i.cantidad * i.precio_unitario) AS importe
FROM pedidos p
JOIN pedido_items i ON i.pedido_id = p.id
JOIN productos pr ON pr.id = i.producto_id
WHERE p.fecha >= '2024-03-01' AND p.fecha < '2024-04-01'
GROUP BY pr.id, pr.nombre
ORDER BY unidades DESC, pr.id
LIMIT 10;
