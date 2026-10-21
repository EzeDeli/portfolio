-- Base donde terminan las ventas de todas las sucursales.
-- Es SQLite para que el ejemplo corra sin instalar nada; en producción se usa la base del cliente
-- (MySQL, SQL Server, PostgreSQL) cambiando solo la conexión.

CREATE TABLE IF NOT EXISTS productos (
    codigo        TEXT PRIMARY KEY,
    nombre        TEXT NOT NULL,
    precio_lista  REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS ventas (
    id_venta   TEXT PRIMARY KEY,          -- evita cargar dos veces la misma venta
    sucursal   TEXT NOT NULL,
    fecha      TEXT NOT NULL,
    producto   TEXT NOT NULL REFERENCES productos (codigo),
    cantidad   INTEGER NOT NULL CHECK (cantidad > 0),
    precio     REAL NOT NULL CHECK (precio > 0),
    total      REAL NOT NULL,
    archivo    TEXT NOT NULL,
    cargado_en TEXT NOT NULL
);

-- Registro de archivos procesados: si el mismo Excel vuelve a llegar, no se carga de nuevo
CREATE TABLE IF NOT EXISTS archivos (
    huella           TEXT PRIMARY KEY,    -- SHA-256 del contenido
    nombre           TEXT NOT NULL,
    procesado_en     TEXT NOT NULL,
    filas_cargadas   INTEGER NOT NULL,
    filas_rechazadas INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas (fecha, sucursal);
