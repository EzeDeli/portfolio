"""Worker que convierte los eventos de la base en tickets de la mesa de ayuda y avisa por mail.

Lee la tabla "eventos" (la llenan los triggers), crea un ticket por cada evento pendiente
llamando a la API REST, guarda el número de ticket y le manda un mail al área responsable.

- Reintenta con espera creciente si la API falla o no responde (errores 5xx, 429, red caída).
- No reintenta si el error es del pedido (4xx): lo marca para revisar, con el motivo.
- Usa Idempotency-Key: si se corta justo después de crear el ticket, al reintentar no lo duplica.
- Si un evento falla en esta pasada, queda para la próxima (hasta MAX_INTENTOS).

Uso:  python worker.py            (una pasada, ideal para el Programador de tareas o cron)
      python worker.py --cada 60  (queda corriendo y revisa cada 60 segundos)
"""

import json
import logging
import os
import sqlite3
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

import aviso

CARPETA = Path(__file__).resolve().parent
BASE = CARPETA / "salida" / "operaciones.db"
API_URL = os.environ.get("API_URL", "http://127.0.0.1:8765/api/v1")
API_TOKEN = os.environ.get("API_TOKEN", "demo-token")
REINTENTOS_POR_PASADA = 3
ESPERA_BASE = float(os.environ.get("ESPERA_BASE", 0.5))   # segundos: 0,5 -> 1 -> 2
MAX_INTENTOS = 5

log = logging.getLogger("worker")


class ErrorDefinitivo(Exception):
    """La API rechazó el pedido (4xx): reintentar no lo va a arreglar."""


class ErrorTemporal(Exception):
    """La API falló o no respondió: vale la pena reintentar."""


def crear_ticket(datos, clave):
    pedido = urllib.request.Request(
        f"{API_URL}/tickets", data=json.dumps(datos).encode("utf-8"), method="POST",
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {API_TOKEN}",
                 "Idempotency-Key": clave})
    try:
        with urllib.request.urlopen(pedido, timeout=10) as respuesta:
            return json.loads(respuesta.read())
    except urllib.error.HTTPError as e:
        detalle = e.read().decode("utf-8", "replace")
        if e.code >= 500 or e.code == 429:
            raise ErrorTemporal(f"HTTP {e.code}: {detalle}") from None
        raise ErrorDefinitivo(f"HTTP {e.code}: {detalle}") from None
    except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
        raise ErrorTemporal(f"Sin conexión con la API: {e}") from None


def crear_con_reintentos(datos, clave):
    for intento in range(1, REINTENTOS_POR_PASADA + 1):
        try:
            return crear_ticket(datos, clave)
        except ErrorTemporal as e:
            if intento == REINTENTOS_POR_PASADA:
                raise
            espera = ESPERA_BASE * 2 ** (intento - 1)
            log.warning("%s (intento %s). Reintento en %.1f s", e, intento, espera)
            time.sleep(espera)


def armar_ticket(evento, responsable):
    titulos = {"stock_bajo": "Reponer stock", "pedido_demorado": "Pedido demorado", "reclamo": "Reclamo de cliente"}
    return {
        "titulo": f"{titulos.get(evento['tipo'], evento['tipo'])} · ref. {evento['referencia']}",
        "descripcion": f"{evento['detalle']}\n\nGenerado automáticamente el {evento['creado_en']} (evento {evento['id']}).",
        "prioridad": responsable["prioridad"],
        "categoria": responsable["area"],
    }


def procesar_pendientes(base, carpeta_salida):
    base.row_factory = sqlite3.Row
    eventos = base.execute(
        "SELECT * FROM eventos WHERE estado = 'pendiente' OR (estado = 'error' AND intentos < ?) ORDER BY id",
        (MAX_INTENTOS,)).fetchall()
    resumen = {"enviados": 0, "con_error": 0}

    for evento in eventos:
        responsable = base.execute("SELECT * FROM responsables WHERE tipo = ?", (evento["tipo"],)).fetchone()
        try:
            if responsable is None:
                raise ErrorDefinitivo(f"No hay responsable configurado para '{evento['tipo']}'")
            ticket = crear_con_reintentos(armar_ticket(evento, responsable), clave=f"evento-{evento['id']}")
        except (ErrorTemporal, ErrorDefinitivo) as e:
            intentos = MAX_INTENTOS if isinstance(e, ErrorDefinitivo) else evento["intentos"] + 1
            with base:
                base.execute("UPDATE eventos SET estado = 'error', intentos = ?, ultimo_error = ? WHERE id = ?",
                             (intentos, str(e), evento["id"]))
            resumen["con_error"] += 1
            log.error("Evento %s sin ticket: %s", evento["id"], e)
            continue

        with base:
            base.execute("UPDATE eventos SET estado = 'enviado', intentos = intentos + 1, ticket_id = ?, "
                         "ultimo_error = NULL WHERE id = ?", (ticket["id"], evento["id"]))
        aviso.avisar_ticket(dict(evento), ticket, dict(responsable), carpeta_salida)
        resumen["enviados"] += 1
        log.info("Evento %s -> ticket #%s (%s)", evento["id"], ticket["id"], responsable["area"])
    return resumen


def main():
    (CARPETA / "salida").mkdir(exist_ok=True)
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s",
                        handlers=[logging.StreamHandler(),
                                  logging.FileHandler(CARPETA / "salida" / "worker.log", encoding="utf-8")])
    cada = int(sys.argv[sys.argv.index("--cada") + 1]) if "--cada" in sys.argv else None
    while True:
        base = sqlite3.connect(BASE)
        resumen = procesar_pendientes(base, CARPETA / "salida")
        base.close()
        log.info("Pasada terminada: %s tickets creados, %s con error", resumen["enviados"], resumen["con_error"])
        if not cada:
            break
        time.sleep(cada)


if __name__ == "__main__":
    main()
