# Planes de ejecución (EXPLAIN)

Generado por `medir.py`.

### Caso 1: original, sin índices

```
id	select_type	table	type	possible_keys	key	key_len	ref	rows	Extra
1	SIMPLE	pedidos	ALL	NULL	NULL	NULL	NULL	997152	Using where; Using filesort
```

### Caso 2: original, sin índices

```
id	select_type	table	type	possible_keys	key	key_len	ref	rows	Extra
1	SIMPLE	pedidos	ALL	NULL	NULL	NULL	NULL	997152	Using where
```

### Caso 3: original, sin índices

```
id	select_type	table	type	possible_keys	key	key_len	ref	rows	Extra
1	PRIMARY	c	index	NULL	PRIMARY	4	NULL	99689	Using where
2	DEPENDENT SUBQUERY	p	ALL	NULL	NULL	NULL	NULL	997152	Using where
```

### Caso 4: original, sin índices

```
id	select_type	table	type	possible_keys	key	key_len	ref	rows	Extra
1	SIMPLE	clientes	ALL	NULL	NULL	NULL	NULL	99689	Using where
```

### Caso 5: original, sin índices

```
id	select_type	table	type	possible_keys	key	key_len	ref	rows	Extra
1	SIMPLE	pedidos	ALL	NULL	NULL	NULL	NULL	997152	Using filesort
```

### Caso 6: original, sin índices

```
id	select_type	table	type	possible_keys	key	key_len	ref	rows	Extra
1	SIMPLE	i	ALL	NULL	NULL	NULL	NULL	1995261	Using temporary; Using filesort
1	SIMPLE	p	eq_ref	PRIMARY	PRIMARY	4	optimizacion_sql.i.pedido_id	1	Using where
1	SIMPLE	pr	eq_ref	PRIMARY	PRIMARY	4	optimizacion_sql.i.producto_id	1
```

### Caso 1: reescrita, con índices

```
id	select_type	table	type	possible_keys	key	key_len	ref	rows	Extra
1	SIMPLE	pedidos	range	idx_pedidos_cliente_fecha,idx_pedidos_fecha	idx_pedidos_cliente_fecha	9	NULL	3	Using where
```

### Caso 2: reescrita, con índices

```
id	select_type	table	type	possible_keys	key	key_len	ref	rows	Extra
1	SIMPLE	pedidos	range	idx_pedidos_fecha	idx_pedidos_fecha	5	NULL	63308	Using index condition; Using where
```

### Caso 3: reescrita, con índices

```
id	select_type	table	type	possible_keys	key	key_len	ref	rows	Extra
1	SIMPLE	c	ref	PRIMARY,idx_clientes_provincia	idx_clientes_provincia	162	const	4166	Using index condition; Using where; Using temporary; Using filesort
1	SIMPLE	p	ref	idx_pedidos_cliente_fecha	idx_pedidos_cliente_fecha	4	optimizacion_sql.c.id	4	Using index
```

### Caso 4: reescrita, con índices

```
id	select_type	table	type	possible_keys	key	key_len	ref	rows	Extra
1	SIMPLE	clientes	const	uq_clientes_cuit	uq_clientes_cuit	46	const	1
```

### Caso 5: reescrita, con índices

```
id	select_type	table	type	possible_keys	key	key_len	ref	rows	Extra
1	SIMPLE	pedidos	range	PRIMARY,idx_pedidos_fecha	idx_pedidos_fecha	9	NULL	498577	Using where
```

### Caso 6: reescrita, con índices

```
id	select_type	table	type	possible_keys	key	key_len	ref	rows	Extra
1	SIMPLE	p	range	PRIMARY,idx_pedidos_fecha	idx_pedidos_fecha	5	NULL	63308	Using where; Using index; Using temporary; Using filesort
1	SIMPLE	i	ref	idx_items_pedido	idx_items_pedido	4	optimizacion_sql.p.id	1	
1	SIMPLE	pr	eq_ref	PRIMARY	PRIMARY	4	optimizacion_sql.i.producto_id	1
```
