/**
 * Reglas del negocio, sin nada de Google: reciben valores y devuelven resultados.
 * Por eso se pueden probar con Node (ver test/) y usar igual desde Apps Script.
 */

var ESTADOS = { PENDIENTE: 'Pendiente', PROCESADO: 'Procesado', ERROR: 'Con error' };

// Orden de las columnas en la hoja Pedidos (base 0).
var COL_PEDIDO = { NUMERO: 0, FECHA: 1, CLIENTE: 2, CODIGO: 3, CANTIDAD: 4, ESTADO: 5, OBSERVACIONES: 6 };
// Orden de las columnas en la hoja Productos (base 0).
var COL_PRODUCTO = { CODIGO: 0, NOMBRE: 1, STOCK: 2, MINIMO: 3, PRECIO: 4, AVISO: 5 };

function vacio(valor) {
  return valor === null || valor === undefined || String(valor).trim() === '';
}

function normalizarCodigo(valor) {
  return vacio(valor) ? '' : String(valor).trim().toUpperCase();
}

/** Fecha sin hora, para comparar días sin problemas de husos horarios. */
function soloDia(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

function formatearFecha(fecha) {
  var dd = ('0' + fecha.getDate()).slice(-2);
  var mm = ('0' + (fecha.getMonth() + 1)).slice(-2);
  return dd + '/' + mm + '/' + fecha.getFullYear();
}

function formatearPesos(numero) {
  var entero = Math.round(numero).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return '$ ' + entero;
}

/**
 * Cantidad: entero mayor que cero. Acepta 5 o "5"; rechaza "dos", -3, 2,5.
 * Devuelve { valor } o { error }.
 */
function validarCantidad(valor) {
  if (vacio(valor)) return { error: 'Falta la cantidad' };
  var texto = String(valor).trim().replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(texto)) return { error: 'La cantidad tiene que ser un número (se cargó "' + valor + '")' };
  var numero = Number(texto);
  if (numero <= 0) return { error: 'La cantidad tiene que ser mayor que cero' };
  if (Math.floor(numero) !== numero) return { error: 'La cantidad tiene que ser un número entero' };
  return { valor: numero };
}

/**
 * Fecha del pedido. Google Sheets entrega un Date cuando la celda es una fecha;
 * si quedó como texto, se acepta dd/mm/aaaa. No puede ser futura.
 */
function validarFecha(valor, hoy) {
  if (vacio(valor)) return { error: 'Falta la fecha' };
  var fecha;
  if (Object.prototype.toString.call(valor) === '[object Date]') {
    if (isNaN(valor.getTime())) return { error: 'La fecha no es válida' };
    fecha = soloDia(valor);
  } else {
    var partes = String(valor).trim().match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
    if (!partes) return { error: 'La fecha tiene que ser dd/mm/aaaa (se cargó "' + valor + '")' };
    var d = Number(partes[1]), m = Number(partes[2]), a = Number(partes[3]);
    fecha = new Date(a, m - 1, d);
    if (fecha.getDate() !== d || fecha.getMonth() !== m - 1) return { error: 'La fecha ' + valor + ' no existe' };
  }
  if (fecha > soloDia(hoy)) return { error: 'La fecha ' + formatearFecha(fecha) + ' es futura' };
  return { valor: fecha };
}

/** Arma el catálogo { CODIGO: {nombre, stock, minimo, precio, aviso, fila} } desde las filas de Productos. */
function armarCatalogo(filasProductos) {
  var catalogo = {};
  filasProductos.forEach(function (f, i) {
    var codigo = normalizarCodigo(f[COL_PRODUCTO.CODIGO]);
    if (!codigo) return;
    catalogo[codigo] = {
      codigo: codigo,
      nombre: String(f[COL_PRODUCTO.NOMBRE]),
      stock: Number(f[COL_PRODUCTO.STOCK]) || 0,
      minimo: Number(f[COL_PRODUCTO.MINIMO]) || 0,
      precio: Number(f[COL_PRODUCTO.PRECIO]) || 0,
      aviso: f[COL_PRODUCTO.AVISO] || '',
      fila: i
    };
  });
  return catalogo;
}

/**
 * Valida una fila de Pedidos. Devuelve { errores: {columna: mensaje}, datos }.
 * `numerosVistos` cuenta cuántas veces aparece cada n° de pedido en la hoja.
 */
function validarPedido(fila, catalogo, hoy, numerosVistos) {
  var errores = {};
  var numero = vacio(fila[COL_PEDIDO.NUMERO]) ? '' : String(fila[COL_PEDIDO.NUMERO]).trim();
  if (!numero) errores[COL_PEDIDO.NUMERO] = 'Falta el número de pedido';
  else if (numerosVistos && numerosVistos[numero] > 1) errores[COL_PEDIDO.NUMERO] = 'El pedido ' + numero + ' está repetido';

  var fecha = validarFecha(fila[COL_PEDIDO.FECHA], hoy);
  if (fecha.error) errores[COL_PEDIDO.FECHA] = fecha.error;

  if (vacio(fila[COL_PEDIDO.CLIENTE])) errores[COL_PEDIDO.CLIENTE] = 'Falta el cliente';

  var codigo = normalizarCodigo(fila[COL_PEDIDO.CODIGO]);
  if (!codigo) errores[COL_PEDIDO.CODIGO] = 'Falta el código de producto';
  else if (!catalogo[codigo]) errores[COL_PEDIDO.CODIGO] = 'El código ' + codigo + ' no existe en Productos';

  var cantidad = validarCantidad(fila[COL_PEDIDO.CANTIDAD]);
  if (cantidad.error) errores[COL_PEDIDO.CANTIDAD] = cantidad.error;

  return {
    errores: errores,
    datos: { numero: numero, fecha: fecha.valor, cliente: String(fila[COL_PEDIDO.CLIENTE]).trim(), codigo: codigo, cantidad: cantidad.valor }
  };
}

function contarNumeros(filasPedidos) {
  var vistos = {};
  filasPedidos.forEach(function (f) {
    var n = String(f[COL_PEDIDO.NUMERO]).trim();
    if (n) vistos[n] = (vistos[n] || 0) + 1;
  });
  return vistos;
}

function textoErrores(errores) {
  return Object.keys(errores).map(function (k) { return errores[k]; }).join('. ');
}

/**
 * Procesa los pedidos pendientes en orden: si están bien y hay stock, lo descuenta.
 * No modifica las entradas: devuelve qué cambiar en cada hoja.
 */
function procesarPedidos(filasPedidos, filasProductos, hoy) {
  var catalogo = armarCatalogo(filasProductos);
  var vistos = contarNumeros(filasPedidos);
  var cambios = [];
  var procesados = 0, conError = 0;

  filasPedidos.forEach(function (fila, i) {
    var estado = String(fila[COL_PEDIDO.ESTADO] || '').trim();
    if (estado && estado !== ESTADOS.PENDIENTE) return;
    if (vacio(fila[COL_PEDIDO.NUMERO]) && vacio(fila[COL_PEDIDO.CODIGO]) && vacio(fila[COL_PEDIDO.CANTIDAD])) return;

    var r = validarPedido(fila, catalogo, hoy, vistos);
    var mensaje = textoErrores(r.errores);
    if (!mensaje) {
      var producto = catalogo[r.datos.codigo];
      if (r.datos.cantidad > producto.stock) {
        mensaje = 'Stock insuficiente: pide ' + r.datos.cantidad + ' y hay ' + producto.stock;
      } else {
        producto.stock -= r.datos.cantidad;
        procesados++;
        cambios.push({ fila: i, estado: ESTADOS.PROCESADO, observaciones: 'Stock descontado el ' + formatearFecha(hoy) });
        return;
      }
    }
    conError++;
    cambios.push({ fila: i, estado: ESTADOS.ERROR, observaciones: mensaje });
  });

  var stock = Object.keys(catalogo).map(function (c) {
    return { fila: catalogo[c].fila, codigo: c, stock: catalogo[c].stock };
  });
  return { cambios: cambios, stock: stock, procesados: procesados, conError: conError };
}

/**
 * Decide a qué productos avisar: los que están en su mínimo o debajo y todavía no
 * tienen aviso. Si un producto se repuso, se borra la marca para que pueda volver a avisar.
 */
function revisarStock(filasProductos) {
  var catalogo = armarCatalogo(filasProductos);
  var avisar = [], reponer = [];
  Object.keys(catalogo).forEach(function (c) {
    var p = catalogo[c];
    var bajo = p.stock <= p.minimo;
    if (bajo && vacio(p.aviso)) avisar.push(p);
    if (!bajo && !vacio(p.aviso)) reponer.push(p);
  });
  return { avisar: avisar, reponer: reponer };
}

/** Datos del resumen de los últimos 7 días (incluye hoy), según la fecha del pedido. */
function armarResumen(filasPedidos, filasProductos, hoy) {
  var catalogo = armarCatalogo(filasProductos);
  var hasta = soloDia(hoy);
  var desde = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate() - 6);
  var porProducto = {};
  var resumen = { desde: desde, hasta: hasta, procesados: 0, unidades: 0, importe: 0, conError: [], pendientes: 0, top: [], bajoMinimo: [] };

  filasPedidos.forEach(function (f) {
    var estado = String(f[COL_PEDIDO.ESTADO] || '').trim();
    if (estado === ESTADOS.ERROR) {
      resumen.conError.push({ numero: String(f[COL_PEDIDO.NUMERO]), cliente: String(f[COL_PEDIDO.CLIENTE]), motivo: String(f[COL_PEDIDO.OBSERVACIONES]) });
      return;
    }
    if (estado !== ESTADOS.PROCESADO) {
      if (!vacio(f[COL_PEDIDO.NUMERO])) resumen.pendientes++;
      return;
    }
    var fecha = validarFecha(f[COL_PEDIDO.FECHA], hoy).valor;
    if (!fecha || fecha < desde) return;
    var codigo = normalizarCodigo(f[COL_PEDIDO.CODIGO]);
    var cantidad = Number(f[COL_PEDIDO.CANTIDAD]) || 0;
    var producto = catalogo[codigo];
    resumen.procesados++;
    resumen.unidades += cantidad;
    resumen.importe += cantidad * (producto ? producto.precio : 0);
    porProducto[codigo] = (porProducto[codigo] || 0) + cantidad;
  });

  resumen.top = Object.keys(porProducto)
    .map(function (c) { return { codigo: c, nombre: catalogo[c] ? catalogo[c].nombre : c, unidades: porProducto[c] }; })
    .sort(function (a, b) { return b.unidades - a.unidades; })
    .slice(0, 5);
  resumen.bajoMinimo = Object.keys(catalogo)
    .map(function (c) { return catalogo[c]; })
    .filter(function (p) { return p.stock <= p.minimo; });
  return resumen;
}

// ---------- Mails (HTML) ----------

function escaparHtml(texto) {
  return String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var ESTILO_TABLA = 'border-collapse:collapse;width:100%;font-size:14px';
var ESTILO_TH = 'text-align:left;padding:6px 8px;background:#f1f3f4;border-bottom:1px solid #dadce0';
var ESTILO_TD = 'padding:6px 8px;border-bottom:1px solid #eee';

function tabla(encabezados, filas) {
  var html = '<table style="' + ESTILO_TABLA + '"><tr>';
  encabezados.forEach(function (e) { html += '<th style="' + ESTILO_TH + '">' + escaparHtml(e) + '</th>'; });
  html += '</tr>';
  filas.forEach(function (f) {
    html += '<tr>';
    f.forEach(function (v) { html += '<td style="' + ESTILO_TD + '">' + escaparHtml(v) + '</td>'; });
    html += '</tr>';
  });
  return html + '</table>';
}

function marco(titulo, cuerpo, urlPlanilla) {
  var boton = urlPlanilla
    ? '<p style="margin-top:20px"><a href="' + escaparHtml(urlPlanilla) + '" style="background:#188038;color:#fff;padding:10px 16px;border-radius:4px;text-decoration:none">Abrir la planilla</a></p>'
    : '';
  return '<div style="font-family:Arial,sans-serif;color:#202124;max-width:620px">' +
    '<h2 style="margin:0 0 12px;font-size:20px">' + escaparHtml(titulo) + '</h2>' + cuerpo + boton +
    '<p style="color:#80868b;font-size:12px;margin-top:24px">Mail automático de la planilla de pedidos y stock.</p></div>';
}

function mailAvisoStock(productos, urlPlanilla) {
  var asunto = productos.length === 1
    ? 'Stock bajo: ' + productos[0].nombre
    : 'Stock bajo: ' + productos.length + ' productos';
  var cuerpo = '<p>Estos productos llegaron a su stock mínimo o están debajo. Vas a recibir este aviso una sola vez por producto, hasta que se reponga.</p>' +
    tabla(['Código', 'Producto', 'Stock', 'Mínimo'], productos.map(function (p) { return [p.codigo, p.nombre, p.stock, p.minimo]; }));
  return { asunto: asunto, html: marco('Productos para reponer', cuerpo, urlPlanilla) };
}

function mailResumen(r, nombreNegocio, urlPlanilla) {
  var periodo = formatearFecha(r.desde) + ' al ' + formatearFecha(r.hasta);
  var aRevisar = [];
  if (r.conError.length) aRevisar.push(r.conError.length + (r.conError.length === 1 ? ' pedido con error' : ' pedidos con error'));
  if (r.bajoMinimo.length) aRevisar.push(r.bajoMinimo.length + ' con stock bajo');
  var asunto = 'Resumen semanal ' + periodo + ' · ' + (aRevisar.length ? aRevisar.join(' · ') : 'todo en orden');
  var cifra = function (valor, texto) {
    return '<td style="width:33%;padding:10px;text-align:center;background:#f8f9fa;border-radius:6px"><div style="font-size:22px;font-weight:bold">' +
      escaparHtml(valor) + '</div><div style="font-size:12px;color:#5f6368">' + texto + '</div></td>';
  };
  var cuerpo = '<p>' + escaparHtml(nombreNegocio) + ' · pedidos del ' + periodo + '.</p>' +
    '<table style="width:100%;border-spacing:8px 0;margin:0 -8px 16px"><tr>' +
    cifra(r.procesados, 'pedidos procesados') + cifra(r.unidades, 'unidades') + cifra(formatearPesos(r.importe), 'facturado') +
    '</tr></table>';
  if (r.top.length) {
    cuerpo += '<h3 style="font-size:16px;margin:16px 0 6px">Más pedidos</h3>' +
      tabla(['Producto', 'Unidades'], r.top.map(function (t) { return [t.nombre, t.unidades]; }));
  }
  if (r.conError.length) {
    cuerpo += '<h3 style="font-size:16px;margin:16px 0 6px;color:#c5221f">Pedidos con error para corregir (' + r.conError.length + ')</h3>' +
      tabla(['N°', 'Cliente', 'Motivo'], r.conError.slice(0, 10).map(function (e) { return [e.numero, e.cliente, e.motivo]; }));
  }
  if (r.bajoMinimo.length) {
    cuerpo += '<h3 style="font-size:16px;margin:16px 0 6px;color:#b06000">Debajo del stock mínimo (' + r.bajoMinimo.length + ')</h3>' +
      tabla(['Producto', 'Stock', 'Mínimo'], r.bajoMinimo.map(function (p) { return [p.nombre, p.stock, p.minimo]; }));
  }
  if (r.pendientes) cuerpo += '<p>Quedan ' + r.pendientes + ' pedidos pendientes de procesar.</p>';
  return { asunto: asunto, html: marco('Resumen semanal', cuerpo, urlPlanilla) };
}

// Apps Script ignora esto; en Node permite importar las funciones para los tests.
if (typeof module !== 'undefined') {
  module.exports = {
    ESTADOS: ESTADOS, COL_PEDIDO: COL_PEDIDO, COL_PRODUCTO: COL_PRODUCTO,
    normalizarCodigo: normalizarCodigo, validarCantidad: validarCantidad, validarFecha: validarFecha,
    armarCatalogo: armarCatalogo, validarPedido: validarPedido, contarNumeros: contarNumeros, textoErrores: textoErrores,
    procesarPedidos: procesarPedidos, revisarStock: revisarStock, armarResumen: armarResumen,
    mailAvisoStock: mailAvisoStock, mailResumen: mailResumen, formatearFecha: formatearFecha, formatearPesos: formatearPesos
  };
}
