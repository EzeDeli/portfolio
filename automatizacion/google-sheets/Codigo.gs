/**
 * Planilla de pedidos y stock: la parte que habla con Google (hojas, mails, triggers).
 * Las reglas están en Validaciones.gs.
 */

var HOJAS = { PEDIDOS: 'Pedidos', PRODUCTOS: 'Productos', CONFIG: 'Configuración', REGISTRO: 'Registro' };
var COLOR_ERROR = '#f4c7c3';

// ---------- Menú ----------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚙️ Automatización')
    .addItem('Procesar pedidos pendientes', 'menuProcesarPedidos')
    .addItem('Revisar stock y avisar', 'menuRevisarStock')
    .addItem('Enviar resumen semanal ahora', 'menuResumenSemanal')
    .addSeparator()
    .addItem('Revisar todos los pedidos (marcar errores)', 'menuRevisarPedidos')
    .addSeparator()
    .addItem('Activar automatizaciones', 'activarAutomatizaciones')
    .addItem('Desactivar automatizaciones', 'menuDesactivar')
    .addToUi();
}

function menuProcesarPedidos() { avisarEnPantalla(procesarYAvisar()); }
function menuRevisarStock() { avisarEnPantalla(ejecutar('Revisar stock', revisarStockYAvisar)); }
function menuResumenSemanal() { avisarEnPantalla(ejecutar('Resumen semanal', enviarResumenSemanal)); }
function menuRevisarPedidos() { avisarEnPantalla(ejecutar('Revisar pedidos', marcarTodosLosPedidos)); }

function avisarEnPantalla(mensaje) {
  SpreadsheetApp.getActive().toast(mensaje, 'Automatización', 8);
}

// ---------- Validación mientras se carga ----------

/** Trigger simple: se ejecuta cada vez que alguien edita la planilla. */
function onEdit(e) {
  var hoja = e.range.getSheet();
  if (hoja.getName() !== HOJAS.PEDIDOS || e.range.getRow() < 2) return;
  var desde = e.range.getRow();
  var cantidad = Math.min(e.range.getNumRows(), 500);
  var mensajes = marcarPedidos(hoja, desde, cantidad);
  if (mensajes.length === 1) e.source.toast(mensajes[0], '⚠️ Revisar fila', 6);
  else if (mensajes.length > 1) e.source.toast(mensajes.length + ' filas con errores. Pasá el mouse por las celdas en rojo.', '⚠️ Revisar', 6);
}

/**
 * Pinta de rojo las celdas con error y les deja una nota con el motivo.
 * Si un pedido "Con error" quedó bien, vuelve a "Pendiente". Devuelve los mensajes.
 */
function marcarPedidos(hoja, filaDesde, cantidad) {
  var todas = hoja.getRange(2, 1, Math.max(hoja.getLastRow() - 1, 1), 7).getValues();
  var catalogo = armarCatalogo(leerFilas(HOJAS.PRODUCTOS, 6));
  var vistos = contarNumeros(todas);
  var hoy = new Date();
  var rango = hoja.getRange(filaDesde, 1, cantidad, 5);
  var fondos = rango.getBackgrounds();
  var notas = rango.getNotes();
  var mensajes = [];

  for (var i = 0; i < cantidad; i++) {
    var fila = todas[filaDesde - 2 + i] || ['', '', '', '', '', '', ''];
    var enBlanco = fila.slice(0, 5).every(function (v) { return v === '' || v === null; });
    var r = enBlanco ? { errores: {} } : validarPedido(fila, catalogo, hoy, vistos);
    for (var c = 0; c < 5; c++) {
      fondos[i][c] = r.errores[c] ? COLOR_ERROR : null;
      notas[i][c] = r.errores[c] || '';
    }
    var texto = textoErrores(r.errores);
    if (texto) mensajes.push('Fila ' + (filaDesde + i) + ': ' + texto);
    else if (fila[COL_PEDIDO.ESTADO] === ESTADOS.ERROR && !enBlanco) {
      hoja.getRange(filaDesde + i, COL_PEDIDO.ESTADO + 1, 1, 2).setValues([[ESTADOS.PENDIENTE, '']]);
    }
  }
  rango.setBackgrounds(fondos).setNotes(notas);
  return mensajes;
}

function marcarTodosLosPedidos() {
  var hoja = hoja_(HOJAS.PEDIDOS);
  var filas = hoja.getLastRow() - 1;
  if (filas < 1) return 'No hay pedidos cargados.';
  var mensajes = marcarPedidos(hoja, 2, filas);
  return mensajes.length ? mensajes.length + ' filas con errores marcadas en rojo.' : 'Todos los pedidos están bien cargados.';
}

// ---------- Procesos ----------

/** Lo que corre cada hora: procesa pedidos y después revisa el stock. */
function procesarYAvisar() {
  var r1 = ejecutar('Procesar pedidos', procesarPedidosPendientes);
  var r2 = ejecutar('Revisar stock', revisarStockYAvisar);
  return r1 + ' ' + r2;
}

function procesarPedidosPendientes() {
  var hojaPedidos = hoja_(HOJAS.PEDIDOS);
  var hojaProductos = hoja_(HOJAS.PRODUCTOS);
  var pedidos = leerFilas(HOJAS.PEDIDOS, 7);
  var productos = leerFilas(HOJAS.PRODUCTOS, 6);
  if (!pedidos.length) return 'No hay pedidos cargados.';

  var r = procesarPedidos(pedidos, productos, new Date());
  if (!r.cambios.length) return 'No había pedidos pendientes.';

  // Se escriben las columnas completas de una vez: es mucho más rápido que celda por celda.
  var estados = pedidos.map(function (f) { return [f[COL_PEDIDO.ESTADO], f[COL_PEDIDO.OBSERVACIONES]]; });
  r.cambios.forEach(function (c) { estados[c.fila] = [c.estado, c.observaciones]; });
  hojaPedidos.getRange(2, COL_PEDIDO.ESTADO + 1, estados.length, 2).setValues(estados);

  var stock = productos.map(function (f) { return [f[COL_PRODUCTO.STOCK]]; });
  r.stock.forEach(function (s) { stock[s.fila] = [s.stock]; });
  hojaProductos.getRange(2, COL_PRODUCTO.STOCK + 1, stock.length, 1).setValues(stock);

  return r.procesados + ' pedidos procesados, ' + r.conError + ' con error.';
}

function revisarStockYAvisar() {
  var hoja = hoja_(HOJAS.PRODUCTOS);
  var productos = leerFilas(HOJAS.PRODUCTOS, 6);
  var r = revisarStock(productos);

  // Si un producto se repuso, se borra la marca para que pueda volver a avisar.
  r.reponer.forEach(function (p) { hoja.getRange(p.fila + 2, COL_PRODUCTO.AVISO + 1).clearContent(); });
  if (!r.avisar.length) return 'Stock revisado: no hay avisos nuevos.';

  var mail = mailAvisoStock(r.avisar, SpreadsheetApp.getActive().getUrl());
  MailApp.sendEmail({ to: destinatarios(), subject: mail.asunto, htmlBody: mail.html });
  var marca = 'Avisado el ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  r.avisar.forEach(function (p) { hoja.getRange(p.fila + 2, COL_PRODUCTO.AVISO + 1).setValue(marca); });
  return 'Aviso de stock bajo enviado: ' + r.avisar.map(function (p) { return p.codigo; }).join(', ') + '.';
}

function enviarResumenSemanal() {
  var resumen = armarResumen(leerFilas(HOJAS.PEDIDOS, 7), leerFilas(HOJAS.PRODUCTOS, 6), new Date());
  var mail = mailResumen(resumen, config('Nombre del negocio') || 'Pedidos y stock', SpreadsheetApp.getActive().getUrl());
  MailApp.sendEmail({ to: destinatarios(), subject: mail.asunto, htmlBody: mail.html });
  return 'Resumen semanal enviado a ' + destinatarios() + '.';
}

// ---------- Triggers ----------

function activarAutomatizaciones() {
  desactivarAutomatizaciones();
  ScriptApp.newTrigger('procesarYAvisar').timeBased().everyHours(1).create();
  ScriptApp.newTrigger('enviarResumenSemanalProgramado').timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(8).create();
  registrar('Activar automatizaciones', 'OK', 'Pedidos y stock cada hora; resumen los lunes a las 8.');
  avisarEnPantalla('Listo: pedidos y stock cada hora, resumen los lunes a las 8.');
}

function desactivarAutomatizaciones() {
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
}

function menuDesactivar() {
  desactivarAutomatizaciones();
  registrar('Desactivar automatizaciones', 'OK', 'Se borraron los triggers de tiempo.');
  avisarEnPantalla('Automatizaciones desactivadas. El menú y la validación al cargar siguen funcionando.');
}

function enviarResumenSemanalProgramado() { ejecutar('Resumen semanal', enviarResumenSemanal); }

// ---------- Registro y utilidades ----------

/**
 * Corre un proceso con un candado (para que dos ejecuciones no pisen el stock)
 * y deja en Registro qué hizo o qué error tuvo.
 */
function ejecutar(accion, proceso) {
  var candado = LockService.getDocumentLock();
  if (!candado.tryLock(30000)) {
    registrar(accion, 'Omitido', 'Había otra ejecución en curso.');
    return accion + ': había otra ejecución en curso, se omitió.';
  }
  try {
    var detalle = proceso();
    registrar(accion, 'OK', detalle);
    return detalle;
  } catch (err) {
    registrar(accion, 'ERROR', err.message);
    return accion + ': falló (' + err.message + '). Quedó en la hoja Registro.';
  } finally {
    SpreadsheetApp.flush();
    candado.releaseLock();
  }
}

function registrar(accion, resultado, detalle) {
  var hoja = SpreadsheetApp.getActive().getSheetByName(HOJAS.REGISTRO);
  if (!hoja) {
    hoja = SpreadsheetApp.getActive().insertSheet(HOJAS.REGISTRO);
    hoja.appendRow(['Fecha y hora', 'Acción', 'Resultado', 'Detalle', 'Usuario']);
    hoja.getRange(1, 1, 1, 5).setFontWeight('bold');
    hoja.setFrozenRows(1);
  }
  hoja.appendRow([new Date(), accion, resultado, detalle, Session.getActiveUser().getEmail() || 'trigger']);
  if (resultado === 'ERROR') hoja.getRange(hoja.getLastRow(), 1, 1, 5).setBackground(COLOR_ERROR);
}

function hoja_(nombre) {
  var hoja = SpreadsheetApp.getActive().getSheetByName(nombre);
  if (!hoja) throw new Error('No encuentro la hoja "' + nombre + '"');
  return hoja;
}

/** Filas de datos de una hoja (sin el encabezado). */
function leerFilas(nombre, columnas) {
  var hoja = hoja_(nombre);
  var filas = hoja.getLastRow() - 1;
  return filas > 0 ? hoja.getRange(2, 1, filas, columnas).getValues() : [];
}

/** Lee un valor de la hoja Configuración (columna A: nombre, columna B: valor). */
function config(nombre) {
  var hoja = SpreadsheetApp.getActive().getSheetByName(HOJAS.CONFIG);
  if (!hoja) return '';
  var filas = hoja.getDataRange().getValues();
  for (var i = 0; i < filas.length; i++) {
    if (String(filas[i][0]).trim() === nombre) return String(filas[i][1]).trim();
  }
  return '';
}

function destinatarios() {
  var mails = config('Mails de aviso');
  if (mails) return mails;
  var propio = Session.getEffectiveUser().getEmail();
  if (!propio) throw new Error('Completá "Mails de aviso" en la hoja Configuración');
  return propio;
}
