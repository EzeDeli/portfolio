-- Base de operaciones de una distribuidora (SQLite para que el ejemplo corra sin instalar nada).
-- Los TRIGGERS detectan los eventos importantes y los dejan en la tabla "eventos" (patrón outbox):
-- el sistema que ya existe no se toca, y el worker se encarga de avisar al sistema de tickets.

CREATE TABLE IF NOT EXISTS productos (
    id            INTEGER PRIMARY KEY,
    nombre        TEXT NOT NULL,
    stock         INTEGER NOT NULL,
    stock_minimo  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS pedidos (
    id                INTEGER PRIMARY KEY,
    cliente           TEXT NOT NULL,
    estado            TEXT NOT NULL DEFAULT 'pendiente',
    fecha_compromiso  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reclamos (
    id          INTEGER PRIMARY KEY,
    pedido_id   INTEGER NOT NULL REFERENCES pedidos (id),
    motivo      TEXT NOT NULL,
    creado_en   TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- Quién se entera de cada tipo de evento
CREATE TABLE IF NOT EXISTS responsables (
    tipo       TEXT PRIMARY KEY,
    area       TEXT NOT NULL,
    email      TEXT NOT NULL,
    prioridad  TEXT NOT NULL
);

-- Bandeja de salida: cada fila es algo que hay que informar a la mesa de ayuda
CREATE TABLE IF NOT EXISTS eventos (
    id            INTEGER PRIMARY KEY,
    tipo          TEXT NOT NULL,
    referencia    INTEGER NOT NULL,
    detalle       TEXT NOT NULL,
    creado_en     TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    estado        TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'enviado', 'error')),
    intentos      INTEGER NOT NULL DEFAULT 0,
    ticket_id     INTEGER,
    ultimo_error  TEXT
);
CREATE INDEX IF NOT EXISTS idx_eventos_estado ON eventos (estado, id);

-- El stock cruza el mínimo hacia abajo (no avisa en cada venta, solo cuando cruza)
CREATE TRIGGER IF NOT EXISTS trg_stock_bajo
AFTER UPDATE OF stock ON productos
WHEN NEW.stock < NEW.stock_minimo AND OLD.stock >= OLD.stock_minimo
BEGIN
    INSERT INTO eventos (tipo, referencia, detalle)
    VALUES ('stock_bajo', NEW.id,
            'Stock bajo de ' || NEW.nombre || ': quedan ' || NEW.stock || ' unidades (mínimo ' || NEW.stock_minimo || ').');
END;

-- Un pedido pasa a demorado
CREATE TRIGGER IF NOT EXISTS trg_pedido_demorado
AFTER UPDATE OF estado ON pedidos
WHEN NEW.estado = 'demorado' AND OLD.estado <> 'demorado'
BEGIN
    INSERT INTO eventos (tipo, referencia, detalle)
    VALUES ('pedido_demorado', NEW.id,
            'El pedido ' || NEW.id || ' de ' || NEW.cliente || ' está demorado (compromiso: ' || NEW.fecha_compromiso || ').');
END;

-- Entra un reclamo de un cliente
CREATE TRIGGER IF NOT EXISTS trg_reclamo_nuevo
AFTER INSERT ON reclamos
BEGIN
    INSERT INTO eventos (tipo, referencia, detalle)
    SELECT 'reclamo', NEW.id,
           'Reclamo de ' || p.cliente || ' por el pedido ' || p.id || ': ' || NEW.motivo
    FROM pedidos p WHERE p.id = NEW.pedido_id;
END;
