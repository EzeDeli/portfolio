"""API REST de una mesa de ayuda, simulada para el ejemplo.

Se comporta como los sistemas de tickets reales: pide un token, recibe el ticket en JSON,
devuelve su número y, a veces, falla (503) como cualquier servicio externo.
También respeta el encabezado Idempotency-Key: si el mismo pedido llega dos veces, no duplica el ticket.

Uso:  python mesa_de_ayuda.py            (escucha en http://127.0.0.1:8765)
Variables: API_TOKEN (por defecto "demo-token"), FALLAS (0 a 1, proporción de pedidos que fallan).
"""

import json
import os
import random
import threading
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

TOKEN = os.environ.get("API_TOKEN", "demo-token")
PRIORIDADES = {"baja", "media", "alta", "urgente"}


class MesaDeAyuda:
    """Guarda los tickets en memoria. Es el 'sistema externo' al que se conecta el worker."""

    def __init__(self, fallas=0.0, semilla=7):
        self.tickets = {}
        self.por_clave = {}
        self.fallas = fallas
        self.azar = random.Random(semilla)
        self.lock = threading.Lock()
        self.siguiente = 1001

    def crear(self, datos, clave):
        with self.lock:
            if clave and clave in self.por_clave:
                return self.tickets[self.por_clave[clave]], False
            ticket = {
                "id": self.siguiente,
                "titulo": datos["titulo"],
                "descripcion": datos.get("descripcion", ""),
                "prioridad": datos.get("prioridad", "media"),
                "categoria": datos.get("categoria", "general"),
                "estado": "abierto",
                "creado": datetime.now().isoformat(timespec="seconds"),
            }
            self.tickets[ticket["id"]] = ticket
            if clave:
                self.por_clave[clave] = ticket["id"]
            self.siguiente += 1
            return ticket, True


def crear_servidor(mesa, puerto=8765):
    class Manejador(BaseHTTPRequestHandler):
        def log_message(self, *args):          # sin ruido en la consola
            pass

        def responder(self, codigo, cuerpo):
            datos = json.dumps(cuerpo, ensure_ascii=False).encode("utf-8")
            self.send_response(codigo)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(datos)))
            self.end_headers()
            self.wfile.write(datos)

        def autorizado(self):
            if self.headers.get("Authorization") != f"Bearer {TOKEN}":
                self.responder(401, {"error": "Token inválido"})
                return False
            return True

        def do_GET(self):
            if not self.autorizado():
                return
            if self.path == "/api/v1/tickets":
                self.responder(200, list(mesa.tickets.values()))
            elif self.path.startswith("/api/v1/tickets/"):
                ticket = mesa.tickets.get(int(self.path.rsplit("/", 1)[1]))
                self.responder(200, ticket) if ticket else self.responder(404, {"error": "No existe"})
            else:
                self.responder(404, {"error": "Ruta inexistente"})

        def do_POST(self):
            if not self.autorizado():
                return
            if self.path != "/api/v1/tickets":
                return self.responder(404, {"error": "Ruta inexistente"})
            if mesa.azar.random() < mesa.fallas:
                return self.responder(503, {"error": "Servicio no disponible, reintente"})
            try:
                datos = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
            except (ValueError, TypeError):
                return self.responder(400, {"error": "JSON inválido"})
            if not str(datos.get("titulo", "")).strip():
                return self.responder(422, {"error": "Falta el título"})
            if datos.get("prioridad", "media") not in PRIORIDADES:
                return self.responder(422, {"error": "Prioridad inválida"})
            ticket, nuevo = mesa.crear(datos, self.headers.get("Idempotency-Key"))
            self.responder(201 if nuevo else 200, ticket)

    return ThreadingHTTPServer(("127.0.0.1", puerto), Manejador)


def iniciar_en_segundo_plano(fallas=0.0, puerto=8765):
    """Para la demo y las pruebas: levanta la API en un hilo y la devuelve."""
    mesa = MesaDeAyuda(fallas=fallas)
    servidor = crear_servidor(mesa, puerto)
    threading.Thread(target=servidor.serve_forever, daemon=True).start()
    return mesa, servidor


if __name__ == "__main__":
    servidor = crear_servidor(MesaDeAyuda(fallas=float(os.environ.get("FALLAS", 0))))
    print("Mesa de ayuda escuchando en http://127.0.0.1:8765/api/v1/tickets")
    servidor.serve_forever()
