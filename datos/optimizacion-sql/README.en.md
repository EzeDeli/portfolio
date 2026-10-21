# SQL query optimization: before and after

🌐 **English** · [Español](README.md)

> "The system is slow" is almost never fixed with a bigger server. It is almost always a handful of queries that were not designed for the amount of data the business has today.

I built a distributor's database with **1,000,000 orders**, 2,000,000 order items and 100,000 customers. I loaded six queries that show up all the time in real systems, measured how long they take, and optimized them one by one. Everything can be reproduced with one command.

<p align="center"><img src="grafico.svg" width="820" alt="Time of each query before and after optimizing"></p>

*(Chart labels are in Spanish: orange is the original query without indexes, blue is the optimized one. Log scale: each grid line is 10× more.)*

## Results

| # | Query | Original, no indexes | Original, with indexes | Optimized | Improvement |
|---|---|---:|---:|---:|---:|
| 1 | A customer's order history | 436 ms | 0.3 ms | **0.3 ms** | ~1,500× |
| 2 | Sales for one month | 344 ms | 216 ms | **21 ms** | 16× |
| 3 | Customers with no purchases in 3 months | over 2 min ⛔ | 162 ms | **142 ms** | over 800× |
| 4 | Find a customer by tax ID (CUIT) | 33 ms | 34 ms | **0.2 ms** | ~140× |
| 5 | Page 25,001 of the order list | 310 ms | 315 ms | **0.4 ms** | ~750× |
| 6 | Top 10 products of the month | 3.3 s | 477 ms | **263 ms** | 12× |

⛔ The original query 3 was cancelled after 2 minutes: for 4,166 customers, it scanned the million orders once per customer.

In every case, **the optimized query returns exactly the same result** as the original (the script checks it by comparing the rows).

The middle column is the most interesting one: it shows that **adding indexes is not always enough**. In cases 2, 4 and 5 the index exists, but the query is written in a way that prevents the database from using it. Both things need fixing.

## What was wrong with each query, and the fix

**1. Customer history: a missing index.**
The query filtered by customer and date, but the table only had an index on `id`, so it read a million orders to return 3. A composite index on `(cliente_id, fecha)` solves both the filter and the sort. Column order matters: the equality column first, then the range column.

**2. Monthly sales: a function on the column.**
`WHERE YEAR(fecha) = 2024 AND MONTH(fecha) = 3` forces the database to compute the year and month of every row, so it cannot use the index on `fecha`. Written as a range (`fecha >= '2024-03-01' AND fecha < '2024-04-01'`), it goes straight to that month's rows.

**3. Customers with no recent purchases: one subquery per row.**
The subquery `(SELECT MAX(fecha) FROM pedidos WHERE cliente_id = c.id)` ran once per customer, and each run scanned the whole table. The `(cliente_id, fecha)` index makes each lookup instant. I also rewrote it as a `JOIN` with `GROUP BY`, which is easier to read and scales better.

**4. Search by tax ID: a data type mismatch.**
The tax ID is stored as text but was searched as a number (`cuit = 30005444397`). To compare them, the database converts **every** tax ID in the table to a number, and the index becomes useless. That is why the index alone changed nothing (33 ms vs. 34 ms). With quotes (`cuit = '30005444397'`) the index is used and it takes 0.2 ms. It is one of the most common problems and one of the hardest to spot, because the query "works".

**5. Pagination: a large OFFSET.**
`LIMIT 20 OFFSET 500000` has to sort and discard 500,000 rows to show 20, and it gets slower the deeper you go. With cursor (keyset) pagination, continuing from the last row seen (`WHERE fecha < ... OR (fecha = ... AND id < ...)`), every page takes the same time.

**6. Top products: an unindexed foreign key.**
`pedido_items.pedido_id` had no index, so joining orders with their items scanned all 2 million items. With the index it dropped from 3.3 s to 477 ms. Replacing `DATE_FORMAT(fecha, ...)` with a date range brought it down to 263 ms.

The execution plans (`EXPLAIN`) of every query, before and after, are in [planes.md](planes.md). They show the change from `ALL` (read the whole table) to `ref` or `range` (go straight to the rows needed).

## How I approach this in a real system

1. **Measure before touching anything.** Find the slowest queries (the slow query log, or what users say: "that screen freezes").
2. **Read the execution plan** with `EXPLAIN`: does it scan the whole table, which index does it use, how many rows does it read.
3. **Fix what is needed:** sometimes an index, sometimes rewriting the query, usually both.
4. **Check that the result is the same** and measure again, with real data.
5. **Don't flood the database with indexes:** each one slows down writes. They are designed around how the data is queried, not one per column.

## Files

Table and column names are in Spanish (`pedidos` = orders, `clientes` = customers, `fecha` = date).

| File | What it does |
|---|---|
| [01_esquema.sql](01_esquema.sql) | Creates the tables, with primary keys only (like a legacy system). |
| [02_datos.sql](02_datos.sql) | Generates the test data with plain SQL, identical on every run. Takes less than a minute. |
| [03_consultas_antes.sql](03_consultas_antes.sql) | The six original queries. |
| [04_indices.sql](04_indices.sql) | The indexes, with the reason for each one. |
| [05_consultas_despues.sql](05_consultas_despues.sql) | The optimized queries. |
| [medir.py](medir.py) | Measures everything in three stages and checks that the results match. Uses only Python and the MySQL client. |
| [grafico.py](grafico.py) | Builds the chart from `resultados.csv`. |

## How to reproduce it

Requirements: MySQL or MariaDB (for example the one in XAMPP) and Python 3, no extra libraries.

```bash
python medir.py
python grafico.py
```

`medir.py` creates the `optimizacion_sql` database, loads the data, measures, and writes the results to `resultados.csv` and `planes.md`. If the `mysql` client is not on your PATH, set the `MYSQL` variable (for example, `C:\xampp\mysql\bin\mysql.exe`).

Measured on MariaDB 10.4 on a Windows 10 PC. Each time is the median of 3 runs, after a warm-up run. On another machine the numbers change, but the proportions hold.

---

Is your system getting slower as your data grows? That is exactly what I do. **e.delipetro@gmail.com** · [LinkedIn](https://www.linkedin.com/in/ezedelipetro/) · [Website](https://ezedeli.github.io/Proyectos/en.html)
