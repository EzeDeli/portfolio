/**
 * Corre las mismas reglas de Validaciones.gs sobre los datos de ejemplo, sin Google.
 * Muestra qué haría la planilla y guarda los mails en salida/.
 *
 * Uso:  node demo.js
 */
const fs = require('fs');
const path = require('path');
const v = require('./Validaciones.gs');

// Fecha fija para que el resultado sea siempre el mismo.
const HOY = new Date(2026, 9, 23);

/** Lee un CSV simple (con comillas opcionales) y devuelve las filas sin el encabezado. */
function leerCsv(archivo) {
  const texto = fs.readFileSync(path.join(__dirname, 'datos', archivo), 'utf8').replace(/^﻿/, '');
  return texto.trim().split(/\r?\n/).slice(1).map((linea) => {
    const celdas = [];
    let actual = '', comillas = false;
    for (const ch of linea) {
      if (ch === '"') comillas = !comillas;
      else if (ch === ',' && !comillas) { celdas.push(actual); actual = ''; }
      else actual += ch;
    }
    celdas.push(actual);
    return celdas;
  });
}

/** Convierte el texto como lo haría Google Sheets: números a número y fechas válidas a Date. */
function comoEnSheets(celda) {
  if (/^-?\d+(\.\d+)?$/.test(celda)) return Number(celda);
  const f = celda.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (f) {
    const fecha = new Date(+f[3], +f[2] - 1, +f[1]);
    if (fecha.getDate() === +f[1] && fecha.getMonth() === +f[2] - 1) return fecha;
  }
  return celda;
}

function cargarDatos() {
  return {
    pedidos: leerCsv('pedidos.csv').map((f) => f.map(comoEnSheets)),
    productos: leerCsv('productos.csv').map((f) => f.map(comoEnSheets)),
  };
}

/** Corre todo el circuito sobre los datos de ejemplo. Con `log` en false no imprime nada. */
function simular(log = true) {
  const console = log ? global.console : { log() {} };
  const { pedidos, productos } = cargarDatos();
  const salida = path.join(__dirname, 'salida');
  fs.mkdirSync(salida, { recursive: true });

  console.log(`Demo con fecha ${v.formatearFecha(HOY)}: ${pedidos.length} pedidos, ${productos.length} productos.\n`);

  // 1. Procesar pedidos pendientes.
  const r = v.procesarPedidos(pedidos, productos, HOY);
  r.cambios.forEach((c) => {
    pedidos[c.fila][v.COL_PEDIDO.ESTADO] = c.estado;
    pedidos[c.fila][v.COL_PEDIDO.OBSERVACIONES] = c.observaciones;
    const n = pedidos[c.fila][v.COL_PEDIDO.NUMERO];
    console.log(`  Pedido ${String(n).padEnd(5)} ${c.estado.padEnd(10)} ${c.observaciones}`);
  });
  r.stock.forEach((s) => { productos[s.fila][v.COL_PRODUCTO.STOCK] = s.stock; });
  console.log(`\nProcesar pedidos: ${r.procesados} procesados, ${r.conError} con error.`);

  // 2. Revisar stock: avisa una sola vez por producto.
  const stock = v.revisarStock(productos);
  stock.reponer.forEach((p) => { productos[p.fila][v.COL_PRODUCTO.AVISO] = ''; });
  stock.avisar.forEach((p) => { productos[p.fila][v.COL_PRODUCTO.AVISO] = 'Avisado el ' + v.formatearFecha(HOY); });
  console.log(`Revisar stock: aviso para ${stock.avisar.map((p) => `${p.codigo} (${p.stock}/${p.minimo})`).join(', ') || 'ninguno'}.`);
  console.log(`  Ya avisados antes, no se repiten: ${productos.filter((p) => p[v.COL_PRODUCTO.STOCK] <= p[v.COL_PRODUCTO.MINIMO] && !stock.avisar.some((a) => a.codigo === p[0])).map((p) => p[0]).join(', ') || 'ninguno'}.`);
  console.log(`  Repuestos, se borra la marca: ${stock.reponer.map((p) => p.codigo).join(', ') || 'ninguno'}.`);
  const segunda = v.revisarStock(productos);
  console.log(`  Segunda revisión enseguida: ${segunda.avisar.length} avisos nuevos (no spamea).`);

  // 3. Mails.
  const url = 'https://docs.google.com/spreadsheets/d/EJEMPLO';
  const aviso = v.mailAvisoStock(stock.avisar, url);
  const resumen = v.mailResumen(v.armarResumen(pedidos, productos, HOY), 'Distribuidora de limpieza (ficticia)', url);
  fs.writeFileSync(path.join(salida, 'mail-aviso-stock.html'), aviso.html);
  fs.writeFileSync(path.join(salida, 'mail-resumen-semanal.html'), resumen.html);
  console.log(`\nMail 1: "${aviso.asunto}"`);
  console.log(`Mail 2: "${resumen.asunto}"`);
  console.log('\nMails guardados en salida/.');
  return { pedidos, productos, aviso, resumen };
}

if (require.main === module) simular();
module.exports = { cargarDatos, comoEnSheets, simular, HOY };
