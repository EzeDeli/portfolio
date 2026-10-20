-- Índices pensados a partir de cómo se consulta la base, no "uno por columna".

USE optimizacion_sql;

-- Casos 1 y 3: se filtra por cliente y se ordena o agrupa por fecha.
-- El orden importa: primero la columna que se compara por igualdad, después la del rango.
CREATE INDEX idx_pedidos_cliente_fecha ON pedidos (cliente_id, fecha);

-- Casos 2, 5 y 6: rangos de fechas y listados ordenados por fecha.
-- InnoDB agrega la clave primaria (id) al final del índice, así que también sirve para ORDER BY fecha, id.
CREATE INDEX idx_pedidos_fecha ON pedidos (fecha);

-- Caso 3: filtro por provincia.
CREATE INDEX idx_clientes_provincia ON clientes (provincia);

-- Caso 4: búsqueda por CUIT. Además es único, así que se declara como tal.
CREATE UNIQUE INDEX uq_clientes_cuit ON clientes (cuit);

-- Caso 6: unir pedidos con sus ítems. Es la clave foránea que nunca se indexó.
CREATE INDEX idx_items_pedido ON pedido_items (pedido_id);

ANALYZE TABLE clientes, pedidos, pedido_items;
