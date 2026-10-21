"""Demo de punta a punta, sin configurar nada.

1. Levanta la mesa de ayuda simulada, que falla en 1 de cada 3 pedidos (como un servicio inestable).
2. Simula un día de trabajo en la base: los triggers generan los eventos.
3. Corre el worker: crea los tickets, reintenta lo que falla y manda los mails.
4. Lo vuelve a correr: no duplica nada.
5. Corta la API, entra un reclamo nuevo y el worker lo deja para después. Vuelve la API y se envía.

Uso:  python demo.py
"""

import logging
import sqlite3
import sys
import threading

import mesa_de_ayuda
import simular
import worker

worker.ESPERA_BASE = 0.2
logging.basicConfig(level=logging.INFO, format="  %(levelname)-7s %(message)s", stream=sys.stdout)


def mostrar_eventos(base):
    print(f"\n  {'#':>2}  {'tipo':<16}{'estado':<10}{'intentos':>8}  ticket")
    for e in base.execute("SELECT id, tipo, estado, intentos, ticket_id FROM eventos ORDER BY id"):
        print(f"  {e[0]:>2}  {e[1]:<16}{e[2]:<10}{e[3]:>8}  {'#' + str(e[4]) if e[4] else '-'}")
    print()


def main():
    print("\n== 1. La mesa de ayuda arranca (falla 1 de cada 3 pedidos)")
    mesa, servidor = mesa_de_ayuda.iniciar_en_segundo_plano(fallas=0.33)

    print("== 2. Un día de trabajo en el sistema existente")
    simular.main()
    base = sqlite3.connect(simular.BASE)

    print("\n== 3. Corre el worker")
    worker.procesar_pendientes(base, simular.BASE.parent)
    mostrar_eventos(base)

    print("== 4. Corre otra vez: no hay nada nuevo, no se duplica nada")
    resumen = worker.procesar_pendientes(base, simular.BASE.parent)
    print(f"  Tickets creados en esta pasada: {resumen['enviados']}. Tickets en la mesa de ayuda: {len(mesa.tickets)}\n")

    print("== 5. Se corta la API y entra un reclamo nuevo")
    servidor.shutdown()
    servidor.server_close()
    with base:
        base.execute("INSERT INTO reclamos (pedido_id, motivo) VALUES (5001, 'Faltó un bulto en la entrega')")
    worker.procesar_pendientes(base, simular.BASE.parent)
    mostrar_eventos(base)

    print("== 6. Vuelve la API: el evento pendiente se envía en la siguiente pasada")
    servidor = mesa_de_ayuda.crear_servidor(mesa)
    mesa.fallas = 0
    threading.Thread(target=servidor.serve_forever, daemon=True).start()
    worker.procesar_pendientes(base, simular.BASE.parent)
    mostrar_eventos(base)

    print(f"Listo: {len(mesa.tickets)} tickets creados, uno por evento, y un mail por cada uno en salida/mails/.")
    servidor.shutdown()
    base.close()


if __name__ == "__main__":
    main()
