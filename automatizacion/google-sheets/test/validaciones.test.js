// Pruebas de las reglas de Validaciones.gs.  Uso:  node --test
const test = require('node:test');
const assert = require('node:assert');
const v = require('../Validaciones.gs');
const { cargarDatos, HOY } = require('../demo');

const PRODUCTOS = [
  ['A1', 'Lavandina', 20, 10, 900, ''],
  ['A2', 'Detergente', 5, 10, 1400, 'Avisado el 20/10/2026'],
  ['A3', 'Esponjas', 50, 10, 750, 'Avisado el 14/10/2026'],
];
const CATALOGO = v.armarCatalogo(PRODUCTOS);
const pedido = (numero, fecha, cliente, codigo, cantidad, estado = 'Pendiente') =>
  [numero, fecha, cliente, codigo, cantidad, estado, ''];

test('cantidades', () => {
  assert.strictEqual(v.validarCantidad(3).valor, 3);
  assert.strictEqual(v.validarCantidad(' 4 ').valor, 4);
  for (const malo of ['', null, 'dos', -3, 0, 2.5, '2,5']) {
    assert.ok(v.validarCantidad(malo).error, `debería rechazar ${malo}`);
  }
});

test('fechas', () => {
  assert.deepStrictEqual(v.validarFecha(new Date(2026, 9, 20, 15, 30), HOY).valor, new Date(2026, 9, 20));
  assert.deepStrictEqual(v.validarFecha('20/10/2026', HOY).valor, new Date(2026, 9, 20));
  assert.ok(v.validarFecha(HOY, HOY).valor, 'hoy es válido');
  assert.match(v.validarFecha('31/09/2026', HOY).error, /no existe/);
  assert.match(v.validarFecha('25/10/2026', HOY).error, /futura/);
  assert.match(v.validarFecha('ayer', HOY).error, /dd\/mm\/aaaa/);
  assert.ok(v.validarFecha(new Date('x'), HOY).error);
  assert.ok(v.validarFecha('', HOY).error);
});

test('códigos: ignora mayúsculas y espacios, rechaza los que no existen', () => {
  const ok = v.validarPedido(pedido(1, HOY, 'Cliente', ' a1 ', 2), CATALOGO, HOY, {});
  assert.deepStrictEqual(ok.errores, {});
  assert.strictEqual(ok.datos.codigo, 'A1');
  const malo = v.validarPedido(pedido(2, HOY, 'Cliente', 'Z9', 2), CATALOGO, HOY, {});
  assert.match(malo.errores[v.COL_PEDIDO.CODIGO], /no existe/);
});

test('un pedido con varios errores los informa todos, cada uno en su columna', () => {
  const r = v.validarPedido(pedido('', 'ayer', '', 'Z9', 'dos'), CATALOGO, HOY, {});
  assert.deepStrictEqual(Object.keys(r.errores).map(Number).sort(), [0, 1, 2, 3, 4]);
});

test('procesar: descuenta stock en orden y frena si no alcanza', () => {
  const pedidos = [
    pedido(1, HOY, 'C', 'A1', 15),
    pedido(2, HOY, 'C', 'A1', 10),               // quedan 5: no alcanza
    pedido(3, HOY, 'C', 'A1', 5),
    pedido(4, HOY, 'C', 'A1', 1, 'Procesado'),   // ya procesado: no se toca
    pedido(5, HOY, 'C', 'Z9', 1),
  ];
  const r = v.procesarPedidos(pedidos, PRODUCTOS, HOY);
  assert.deepStrictEqual(r.cambios.map((c) => c.estado), ['Procesado', 'Con error', 'Procesado', 'Con error']);
  assert.match(r.cambios[1].observaciones, /pide 10 y hay 5/);
  assert.strictEqual(r.stock.find((s) => s.codigo === 'A1').stock, 0);
  assert.strictEqual(PRODUCTOS[0][2], 20, 'no modifica los datos de entrada');
});

test('procesar: un número de pedido repetido no se procesa', () => {
  const r = v.procesarPedidos([pedido(7, HOY, 'C', 'A1', 1, 'Procesado'), pedido(7, HOY, 'C', 'A1', 1)], PRODUCTOS, HOY);
  assert.strictEqual(r.cambios.length, 1);
  assert.match(r.cambios[0].observaciones, /repetido/);
});

test('stock: avisa una sola vez y vuelve a habilitar el aviso al reponer', () => {
  const productos = PRODUCTOS.map((f) => f.slice());
  productos[0][2] = 10;                          // A1 llega justo al mínimo
  const r = v.revisarStock(productos);
  assert.deepStrictEqual(r.avisar.map((p) => p.codigo), ['A1']);   // A2 ya estaba avisado
  assert.deepStrictEqual(r.reponer.map((p) => p.codigo), ['A3']);  // A3 se repuso
  productos[0][5] = 'Avisado';
  assert.strictEqual(v.revisarStock(productos).avisar.length, 0);
});

test('resumen semanal: solo los últimos 7 días y los pedidos con error', () => {
  const pedidos = [
    pedido(1, new Date(2026, 9, 17), 'C', 'A1', 2, 'Procesado'),
    pedido(2, new Date(2026, 9, 16), 'C', 'A1', 50, 'Procesado'),  // 8 días antes: fuera
    pedido(3, HOY, 'C', 'A3', 4, 'Procesado'),
    ['4', HOY, 'C', 'Z9', 1, 'Con error', 'El código Z9 no existe'],
    pedido(5, HOY, 'C', 'A1', 1),
  ];
  const r = v.armarResumen(pedidos, PRODUCTOS, HOY);
  assert.strictEqual(r.procesados, 2);
  assert.strictEqual(r.unidades, 6);
  assert.strictEqual(r.importe, 2 * 900 + 4 * 750);
  assert.strictEqual(r.conError.length, 1);
  assert.strictEqual(r.pendientes, 1);
  assert.deepStrictEqual(r.bajoMinimo.map((p) => p.codigo), ['A2']);
  assert.strictEqual(r.top[0].codigo, 'A3');
});

test('mails: escapan el texto cargado en la planilla', () => {
  const mail = v.mailAvisoStock([{ codigo: 'A1', nombre: '<b>Lavandina</b>', stock: 1, minimo: 5 }]);
  assert.ok(mail.html.includes('&lt;b&gt;Lavandina'));
  assert.strictEqual(mail.asunto, 'Stock bajo: <b>Lavandina</b>');
});

test('datos de ejemplo: 5 pedidos se procesan y 9 quedan con error', () => {
  const { pedidos, productos } = cargarDatos();
  const r = v.procesarPedidos(pedidos, productos, HOY);
  assert.strictEqual(r.procesados, 5);
  assert.strictEqual(r.conError, 9);
});

test('formatos', () => {
  assert.strictEqual(v.formatearPesos(1234567), '$ 1.234.567');
  assert.strictEqual(v.formatearFecha(new Date(2026, 0, 5)), '05/01/2026');
});
