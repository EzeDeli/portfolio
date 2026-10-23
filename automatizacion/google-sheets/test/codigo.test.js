// Prueba Codigo.gs con una planilla simulada en memoria (sin Google).  Uso:  node --test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { cargarDatos } = require('../demo');

/** Hoja falsa con lo mínimo que usa el código: rangos, valores, fondos y notas. */
class Hoja {
  constructor(nombre, filas) {
    this.nombre = nombre;
    this.valores = filas.map((f) => f.slice());
    this.fondos = {};
    this.notas = {};
  }
  getName() { return this.nombre; }
  getLastRow() { return this.valores.length; }
  appendRow(fila) { this.valores.push(fila.slice()); }
  setFrozenRows() {}
  getDataRange() { return this.getRange(1, 1, this.valores.length, 2); }
  getRange(fila, col, filas = 1, cols = 1) {
    const hoja = this;
    const recorrer = (fn) => Array.from({ length: filas }, (_, i) => Array.from({ length: cols }, (_, j) => fn(fila + i, col + j, i, j)));
    const celda = (f, c) => `${f},${c}`;
    const rango = {
      getSheet: () => hoja, getRow: () => fila, getNumRows: () => filas,
      getValues: () => recorrer((f, c) => (hoja.valores[f - 1] || [])[c - 1] ?? ''),
      setValues: (vals) => { recorrer((f, c, i, j) => { hoja.valores[f - 1] = hoja.valores[f - 1] || []; hoja.valores[f - 1][c - 1] = vals[i][j]; }); return rango; },
      setValue: (v) => rango.setValues([[v]]),
      clearContent: () => rango.setValue(''),
      getBackgrounds: () => recorrer((f, c) => hoja.fondos[celda(f, c)] || null),
      setBackgrounds: (vals) => { recorrer((f, c, i, j) => { hoja.fondos[celda(f, c)] = vals[i][j]; }); return rango; },
      setBackground: (v) => { recorrer((f, c) => { hoja.fondos[celda(f, c)] = v; }); return rango; },
      getNotes: () => recorrer((f, c) => hoja.notas[celda(f, c)] || ''),
      setNotes: (vals) => { recorrer((f, c, i, j) => { hoja.notas[celda(f, c)] = vals[i][j]; }); return rango; },
      setFontWeight: () => rango,
    };
    return rango;
  }
}

function armarEntorno() {
  const { pedidos, productos } = cargarDatos();
  // La fecha de los datos de ejemplo es el 23/10/2026: se fija el "hoy" del código.
  const DateReal = Date;
  class DateFija extends DateReal {
    constructor(...args) { if (args.length) super(...args); else super(2026, 9, 23, 10, 0); }
  }
  const hojas = {
    Pedidos: new Hoja('Pedidos', [['N° pedido', 'Fecha', 'Cliente', 'Código', 'Cantidad', 'Estado', 'Observaciones'], ...pedidos]),
    Productos: new Hoja('Productos', [['Código', 'Producto', 'Stock', 'Stock mínimo', 'Precio unitario', 'Aviso de stock'], ...productos]),
    'Configuración': new Hoja('Configuración', [['Configuración', 'Valor'], ['Mails de aviso', 'compras@ejemplo.com'], ['Nombre del negocio', 'Demo']]),
  };
  const mails = [], toasts = [], triggers = [];
  const planilla = {
    getSheetByName: (n) => hojas[n] || null,
    insertSheet: (n) => (hojas[n] = new Hoja(n, [])),
    getUrl: () => 'https://docs.google.com/spreadsheets/d/EJEMPLO',
    toast: (m) => toasts.push(m),
  };
  const contexto = {
    Date: DateFija,
    SpreadsheetApp: { getActive: () => planilla, flush() {} },
    MailApp: { sendEmail: (m) => mails.push(m) },
    LockService: { getDocumentLock: () => ({ tryLock: () => true, releaseLock() {} }) },
    Session: { getActiveUser: () => ({ getEmail: () => '' }), getEffectiveUser: () => ({ getEmail: () => 'yo@ejemplo.com' }), getScriptTimeZone: () => 'America/Argentina/Buenos_Aires' },
    Utilities: { formatDate: () => '23/10/2026 10:00' },
    ScriptApp: {
      WeekDay: { MONDAY: 'MONDAY' },
      getProjectTriggers: () => triggers.slice(),
      deleteTrigger: (t) => triggers.splice(triggers.indexOf(t), 1),
      newTrigger: (fn) => {
        const b = { timeBased: () => b, everyHours: () => b, onWeekDay: () => b, atHour: () => b, create: () => triggers.push(fn) };
        return b;
      },
    },
  };
  vm.createContext(contexto);
  for (const archivo of ['Validaciones.gs', 'Codigo.gs']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', archivo), 'utf8'), contexto, { filename: archivo });
  }
  return { contexto, hojas, mails, toasts, triggers, planilla };
}

test('procesar y avisar: actualiza estados y stock, manda un aviso y lo registra', () => {
  const { contexto, hojas, mails } = armarEntorno();
  const mensaje = contexto.procesarYAvisar();
  assert.match(mensaje, /5 pedidos procesados, 9 con error/);

  const pedido1021 = hojas.Pedidos.valores.find((f) => f[0] === 1021);
  assert.deepStrictEqual(pedido1021.slice(5), ['Con error', 'Stock insuficiente: pide 40 y hay 26']);
  const suavizante = hojas.Productos.valores.find((f) => f[0] === 'LIM-004');
  assert.strictEqual(suavizante[2], 10);
  assert.strictEqual(suavizante[5], 'Avisado el 23/10/2026 10:00');
  assert.strictEqual(hojas.Productos.valores.find((f) => f[0] === 'LIM-012')[5], '', 'se borra la marca del repuesto');

  assert.strictEqual(mails.length, 1);
  assert.strictEqual(mails[0].to, 'compras@ejemplo.com');
  assert.strictEqual(mails[0].subject, 'Stock bajo: 2 productos');

  const registro = hojas.Registro.valores;
  assert.deepStrictEqual(registro.slice(1).map((f) => [f[1], f[2]]), [['Procesar pedidos', 'OK'], ['Revisar stock', 'OK']]);

  // Una segunda corrida no repite avisos ni vuelve a descontar stock.
  contexto.procesarYAvisar();
  assert.strictEqual(mails.length, 1);
  assert.strictEqual(hojas.Productos.valores.find((f) => f[0] === 'LIM-004')[2], 10);
});

test('onEdit: marca en rojo la celda con error y la limpia cuando se corrige', () => {
  const { contexto, hojas, planilla, toasts } = armarEntorno();
  const fila = hojas.Pedidos.valores.findIndex((f) => f[0] === 1016) + 1;   // cantidad "dos"
  const evento = () => ({ range: hojas.Pedidos.getRange(fila, 5), source: planilla });

  contexto.onEdit(evento());
  assert.strictEqual(hojas.Pedidos.fondos[`${fila},5`], '#f4c7c3');
  assert.match(hojas.Pedidos.notas[`${fila},5`], /tiene que ser un número/);
  assert.match(toasts[0], new RegExp(`Fila ${fila}`));

  hojas.Pedidos.valores[fila - 1][5] = 'Con error';
  hojas.Pedidos.valores[fila - 1][4] = 2;
  contexto.onEdit(evento());
  assert.strictEqual(hojas.Pedidos.fondos[`${fila},5`], null);
  assert.strictEqual(hojas.Pedidos.notas[`${fila},5`], '');
  assert.strictEqual(hojas.Pedidos.valores[fila - 1][5], 'Pendiente', 'vuelve a quedar para procesar');
});

test('un error queda en Registro sin cortar el resto', () => {
  const { contexto, hojas } = armarEntorno();
  contexto.MailApp.sendEmail = () => { throw new Error('Se superó la cuota de mails'); };
  const mensaje = contexto.procesarYAvisar();
  assert.match(mensaje, /falló \(Se superó la cuota de mails\)/);
  const ultima = hojas.Registro.valores.at(-1);
  assert.deepStrictEqual([ultima[1], ultima[2]], ['Revisar stock', 'ERROR']);
  assert.strictEqual(hojas.Productos.valores.find((f) => f[0] === 'LIM-004')[5], '', 'si el mail falla, no se marca como avisado');
});

test('resumen semanal y triggers', () => {
  const { contexto, mails, triggers } = armarEntorno();
  contexto.menuResumenSemanal();
  assert.match(mails[0].subject, /^Resumen semanal 17\/10\/2026 al 23\/10\/2026/);
  contexto.activarAutomatizaciones();
  contexto.activarAutomatizaciones();
  assert.deepStrictEqual(triggers, ['procesarYAvisar', 'enviarResumenSemanalProgramado'], 'no se duplican');
});
