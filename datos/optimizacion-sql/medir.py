"""Mide cada consulta en tres etapas y comprueba que el resultado no cambie.

  A. Base original (solo claves primarias), consulta original.
  B. Con los índices de 04_indices.sql, consulta original.
  C. Con los índices, consulta reescrita (05_consultas_despues.sql).

Solo usa la biblioteca estándar de Python y el cliente de línea de comandos de MySQL/MariaDB.
Uso:  python medir.py            (crea la base, carga los datos y mide)
      python medir.py --sin-cargar  (usa la base que ya está creada, sin índices)
Variables opcionales: MYSQL (ruta al cliente), MYSQL_USER, MYSQL_PASSWORD.
"""

import csv
import hashlib
import os
import re
import statistics
import subprocess
import sys
from pathlib import Path

CARPETA = Path(__file__).resolve().parent
MYSQL = os.environ.get("MYSQL", "mysql")
USUARIO = os.environ.get("MYSQL_USER", "root")
CLAVE = os.environ.get("MYSQL_PASSWORD", "")
LIMITE_SEGUNDOS = 120
TITULOS = {}


def mysql(script, base="optimizacion_sql"):
    args = [MYSQL, "-u", USUARIO, "-N", "-B", "--force", "--default-character-set=utf8mb4"]
    if CLAVE:
        args.append(f"-p{CLAVE}")
    if base:
        args.append(base)
    r = subprocess.run(args, input=script, capture_output=True, text=True, encoding="utf-8")
    return r.stdout, r.stderr


def ejecutar_archivo(nombre):
    salida, error = mysql((CARPETA / nombre).read_text(encoding="utf-8"), base=None)
    if "ERROR" in error:
        sys.exit(f"Falló {nombre}:\n{error}")


def leer_consultas(nombre):
    texto = (CARPETA / nombre).read_text(encoding="utf-8")
    consultas = {}
    for bloque in re.split(r"^-- caso:", texto, flags=re.M)[1:]:
        encabezado, _, cuerpo = bloque.partition("\n")
        numero, _, titulo = encabezado.strip().partition(" ")
        TITULOS.setdefault(int(numero), titulo.strip())
        sql = "\n".join(l for l in cuerpo.splitlines() if not l.strip().startswith("--")).strip()
        consultas[int(numero)] = sql
    return consultas


def medir_una_vez(sql):
    """Devuelve (segundos o None si superó el límite, huella del resultado)."""
    script = (
        f"SET SESSION max_statement_time = {LIMITE_SEGUNDOS};\n"
        "SET profiling = 1;\n"
        f"{sql}\n"
        "SELECT '@@@';\n"
        "SHOW PROFILES;\n"
    )
    salida, error = mysql(script)
    if "max_statement_time" in error:
        return None, None
    if "ERROR" in error:
        sys.exit(f"Error en la consulta:\n{sql}\n{error}")
    filas, _, perfiles = salida.partition("@@@\n")
    duraciones = [float(l.split("\t")[1]) for l in perfiles.splitlines()
                  if "\t" in l and "SELECT '@@@'" not in l and not l.split("\t")[2].startswith("SET")]
    huella = hashlib.md5(filas.encode("utf-8")).hexdigest()
    return max(duraciones), huella


def medir(sql):
    """Primera corrida para calentar la memoria; si es rápida, mediana de 3 corridas más."""
    segundos, huella = medir_una_vez(sql)
    if segundos is None or segundos > 10:
        return segundos, huella
    tiempos = [medir_una_vez(sql)[0] for _ in range(3)]
    return statistics.median(tiempos), huella


def explicar(sql):
    salida, _ = mysql("EXPLAIN " + sql)
    return "id	select_type	table	type	possible_keys	key	key_len	ref	rows	Extra
" + salida.strip()


def formato(segundos):
    if segundos is None:
        return f"más de {LIMITE_SEGUNDOS} s"
    if segundos >= 1:
        return f"{segundos:,.1f} s".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"{segundos * 1000:,.1f} ms".replace(",", "X").replace(".", ",").replace("X", ".")


def main():
    if "--sin-cargar" not in sys.argv:
        print("Creando la base y cargando los datos (tarda menos de un minuto)...")
        ejecutar_archivo("01_esquema.sql")
        ejecutar_archivo("02_datos.sql")

    antes = leer_consultas("03_consultas_antes.sql")
    despues = leer_consultas("05_consultas_despues.sql")
    resultados = {n: {} for n in antes}
    planes = []

    for n, sql in antes.items():
        print(f"Caso {n}, sin índices...", flush=True)
        resultados[n]["A"], resultados[n]["huella_A"] = medir(sql)
        planes.append(f"### Caso {n}: original, sin índices\n{explicar(sql)}\n")

    print("Creando índices...")
    ejecutar_archivo("04_indices.sql")

    for n in antes:
        print(f"Caso {n}, con índices...", flush=True)
        resultados[n]["B"], resultados[n]["huella_B"] = medir(antes[n])
        resultados[n]["C"], resultados[n]["huella_C"] = medir(despues[n])
        planes.append(f"### Caso {n}: reescrita, con índices\n{explicar(despues[n])}\n")

    with open(CARPETA / "resultados.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["caso", "consulta", "original_sin_indices_s", "original_con_indices_s",
                    "reescrita_con_indices_s", "mismo_resultado"])
        for n, r in resultados.items():
            # Si la original sin índices superó el límite, se compara con la original ya indexada.
            referencia = r["huella_A"] or r["huella_B"]
            mismo = "sí" if referencia == r["huella_C"] else "NO"
            w.writerow([n, TITULOS[n], r["A"], r["B"], r["C"], mismo])
            print(f"{n}. {TITULOS[n]}: {formato(r['A'])} -> {formato(r['B'])} -> {formato(r['C'])}  (mismo resultado: {mismo})")

    (CARPETA / "planes.md").write_text(
        "# Planes de ejecución (EXPLAIN)\n\nGenerado por `medir.py`.\n\n"
        + "\n".join(f"{p.splitlines()[0]}\n\n```\n" + "\n".join(p.splitlines()[1:]) + "\n```\n" for p in planes),
        encoding="utf-8")


if __name__ == "__main__":
    main()
