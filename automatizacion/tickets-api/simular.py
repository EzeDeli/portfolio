"""Crea la base de operaciones y simula un día de trabajo: ventas, pedidos demorados y reclamos.

El sistema "de siempre" solo actualiza sus tablas. Los triggers se encargan de anotar los eventos.
Uso:  python simular.py
"""

import sqlite3
from pathlib import Path

CARPETA = Path(__file__).resolve().parent
BASE = CARPETA / "salida" / "operaciones.db"

PRODUCTOS = [(1, "Yerba 1 kg", 120, 40), (2, "Aceite girasol 1,5 l", 60, 25), (3, "Azúcar 1 kg", 200, 50),
             (4, "Lavandina 2 l", 45, 20), (5, "Detergente 750 ml", 80, 30)]
PEDIDOS = [(5001, "Almacén Don José", "2026-10-20"), (5002, "Supermercado El Sol", "2026-10-21"),
           (5003, "Kiosco La Esquina", "2026-10-21"), (5004, "Autoservicio Norte", "2026-10-22")]
RESPONSABLES = [("stock_bajo", "Compras", "compras@empresa.com", "alta"),
                ("pedido_demorado", "Logística", "logistica@empresa.com", "media"),
                ("reclamo", "Atención al cliente", "clientes@empresa.com", "alta")]


def conectar():
    BASE.parent.mkdir(exist_ok=True)
    base = sqlite3.connect(BASE)
    base.executescript((CARPETA / "esquema.sql").read_text(encoding="utf-8"))
    return base


def preparar(base):
    with base:
        base.executemany("INSERT OR REPLACE INTO productos VALUES (?, ?, ?, ?)", PRODUCTOS)
        base.executemany("INSERT OR REPLACE INTO pedidos (id, cliente, fecha_compromiso) VALUES (?, ?, ?)", PEDIDOS)
        base.executemany("INSERT OR REPLACE INTO responsables VALUES (?, ?, ?, ?)", RESPONSABLES)


def un_dia_de_trabajo(base):
    """Lo que haría el sistema existente. Nada de esto sabe que existe una mesa de ayuda."""
    with base:
        for producto, vendidas in [(1, 50), (1, 35), (2, 40), (3, 30), (4, 30), (4, 5)]:
            base.execute("UPDATE productos SET stock = stock - ? WHERE id = ?", (vendidas, producto))
        base.execute("UPDATE pedidos SET estado = 'en_camino' WHERE id IN (5001, 5003)")
        base.execute("UPDATE pedidos SET estado = 'demorado' WHERE id = 5002")
        base.execute("UPDATE pedidos SET estado = 'demorado' WHERE id = 5002")   # repetido: no genera otro evento
        base.execute("INSERT INTO reclamos (pedido_id, motivo) VALUES (5003, 'Llegaron 2 cajas golpeadas')")


def main():
    if BASE.exists():
        BASE.unlink()                      # cada simulación arranca de cero
    base = conectar()
    preparar(base)
    un_dia_de_trabajo(base)
    for fila in base.execute("SELECT id, tipo, detalle FROM eventos ORDER BY id"):
        print(f"Evento {fila[0]} [{fila[1]}] {fila[2]}")
    base.close()


if __name__ == "__main__":
    main()
