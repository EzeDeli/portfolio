# Optimización de consultas SQL: antes y después

> "El sistema anda lento" casi nunca se arregla con un servidor más grande. Casi siempre son unas pocas consultas que no estaban pensadas para la cantidad de datos que hay hoy.

Armé una base de una distribuidora con **1.000.000 de pedidos**, 2.000.000 de ítems y 100.000 clientes. Le cargué seis consultas que aparecen todo el tiempo en sistemas reales, medí cuánto tardan y las optimicé una por una. Todo se puede reproducir con un comando.

<p align="center"><img src="grafico.svg" width="820" alt="Tiempo de cada consulta antes y después de optimizar"></p>

## Resultados

| # | Consulta | Original, sin índices | Original, con índices | Optimizada | Mejora |
|---|---|---:|---:|---:|---:|
| 1 | Historial de un cliente | 436 ms | 0,3 ms | **0,3 ms** | ~1.500 veces |
| 2 | Ventas de un mes | 344 ms | 216 ms | **21 ms** | 16 veces |
| 3 | Clientes que no compran hace 3 meses | más de 2 min ⛔ | 162 ms | **142 ms** | más de 800 veces |
| 4 | Buscar un cliente por CUIT | 33 ms | 34 ms | **0,2 ms** | ~140 veces |
| 5 | Página 25.001 del listado de pedidos | 310 ms | 315 ms | **0,4 ms** | ~750 veces |
| 6 | Los 10 productos más vendidos del mes | 3,3 s | 477 ms | **263 ms** | 12 veces |

⛔ La consulta 3 original se canceló a los 2 minutos: con 4.166 clientes, recorría el millón de pedidos una vez por cada uno.

En todos los casos, **la consulta optimizada devuelve exactamente el mismo resultado** que la original (el script lo comprueba comparando las filas).

La columna del medio es la más interesante: muestra que **agregar índices no siempre alcanza**. En los casos 2, 4 y 5 el índice existe, pero la consulta está escrita de una forma que no lo deja usar. Hay que corregir las dos cosas.

## Qué tenía cada consulta y cómo se resolvió

**1. Historial de un cliente: faltaba un índice.**
La consulta filtraba por cliente y fecha, pero la tabla solo tenía índice en el `id`, así que leía el millón de pedidos para devolver 3. Un índice compuesto `(cliente_id, fecha)` resuelve el filtro y el orden a la vez. El orden de las columnas importa: primero la que se compara por igualdad, después la del rango.

**2. Ventas de un mes: una función sobre la columna.**
`WHERE YEAR(fecha) = 2024 AND MONTH(fecha) = 3` obliga a calcular el año y el mes de cada fila, y así la base no puede usar el índice de `fecha`. Escrita como rango (`fecha >= '2024-03-01' AND fecha < '2024-04-01'`), va directo a las filas del mes.

**3. Clientes sin compras recientes: una subconsulta por cada fila.**
La subconsulta `(SELECT MAX(fecha) FROM pedidos WHERE cliente_id = c.id)` se ejecutaba una vez por cliente, y cada vez recorría toda la tabla. El índice `(cliente_id, fecha)` hace que cada búsqueda sea instantánea. Además, la reescribí como `JOIN` con `GROUP BY`, que se entiende mejor y escala mejor.

**4. Buscar por CUIT: un tipo de dato distinto.**
El CUIT se guarda como texto, pero se buscaba como número (`cuit = 30005444397`). Para compararlos, la base convierte **cada** CUIT de la tabla a número, y el índice deja de servir. Por eso el índice solo no cambió nada (33 ms contra 34 ms). Con comillas (`cuit = '30005444397'`) se usa el índice y tarda 0,2 ms. Es uno de los problemas más comunes y más difíciles de ver, porque la consulta "funciona".

**5. Paginación: un OFFSET grande.**
`LIMIT 20 OFFSET 500000` tiene que ordenar y descartar 500.000 filas para mostrar 20, y es más lento cuanto más avanzás en el listado. Con paginación por cursor (seguir desde la última fila vista: `WHERE fecha < ... OR (fecha = ... AND id < ...)`), cada página tarda lo mismo.

**6. Productos más vendidos: una clave foránea sin índice.**
`pedido_items.pedido_id` no tenía índice, así que unir pedidos con sus ítems recorría los 2 millones de ítems. Con el índice bajó de 3,3 s a 477 ms. Cambiando `DATE_FORMAT(fecha, ...)` por un rango de fechas, bajó a 263 ms.

Los planes de ejecución (`EXPLAIN`) de cada consulta, antes y después, están en [planes.md](planes.md). Ahí se ve el cambio: de `ALL` (leer toda la tabla) a `ref` o `range` (ir directo a las filas que hacen falta).

## Cómo se trabaja un caso así en un sistema real

1. **Medir antes de tocar.** Encontrar las consultas que más tardan (el log de consultas lentas, o lo que dicen los usuarios: "la pantalla tal se traba").
2. **Leer el plan de ejecución** con `EXPLAIN`, para ver si recorre toda la tabla, qué índice usa y cuántas filas lee.
3. **Corregir lo que corresponda:** a veces es un índice, a veces reescribir la consulta, casi siempre las dos cosas.
4. **Comprobar que el resultado sea el mismo** y medir de nuevo, con datos reales.
5. **No llenar la base de índices:** cada uno hace más lentas las escrituras. Se crean pensando en cómo se consulta, no uno por columna.

## Archivos

| Archivo | Qué hace |
|---|---|
| [01_esquema.sql](01_esquema.sql) | Crea las tablas, solo con claves primarias (como un sistema heredado). |
| [02_datos.sql](02_datos.sql) | Genera los datos de prueba con SQL puro, siempre iguales. Tarda menos de un minuto. |
| [03_consultas_antes.sql](03_consultas_antes.sql) | Las seis consultas originales. |
| [04_indices.sql](04_indices.sql) | Los índices, con el motivo de cada uno. |
| [05_consultas_despues.sql](05_consultas_despues.sql) | Las consultas optimizadas. |
| [medir.py](medir.py) | Mide todo en tres etapas y comprueba que los resultados coincidan. Solo usa Python y el cliente de MySQL. |
| [grafico.py](grafico.py) | Genera el gráfico a partir de `resultados.csv`. |

## Cómo reproducirlo

Requisitos: MySQL o MariaDB (por ejemplo el de XAMPP) y Python 3, sin librerías extra.

```bash
python medir.py
python grafico.py
```

`medir.py` crea la base `optimizacion_sql`, carga los datos, mide y deja los resultados en `resultados.csv` y `planes.md`. Si el cliente `mysql` no está en el PATH, indicá la ruta con la variable `MYSQL` (por ejemplo, `C:\xampp\mysql\bin\mysql.exe`).

Medido en MariaDB 10.4 en una PC con Windows 10. Cada tiempo es la mediana de 3 corridas, después de una corrida para calentar la memoria. En otra máquina los números cambian, pero las proporciones se mantienen.

---

¿Tu sistema se pone lento a medida que crecen los datos? Es justo lo que hago. Escribime: **e.delipetro@gmail.com** · [LinkedIn](https://www.linkedin.com/in/ezedelipetro/) · [Web](https://ezedeli.github.io/Proyectos/)
