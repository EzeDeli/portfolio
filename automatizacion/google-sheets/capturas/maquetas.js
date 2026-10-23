/**
 * Genera las imágenes de capturas/ a partir de los datos de ejemplo y del HTML real
 * que arma Validaciones.gs. Son MAQUETAS: no son capturas de Google Sheets ni de Gmail.
 *
 * Uso:  node capturas/maquetas.js      (usa Microsoft Edge o Chrome sin ventana para sacar la imagen)
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const v = require('../Validaciones.gs');
const { simular, HOY } = require('../demo');

const CARPETA = __dirname;
const TEMP = path.join(__dirname, '..', 'salida', 'maquetas');
const NAVEGADOR = process.env.NAVEGADOR || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const AVISO_MAQUETA = 'Maqueta generada con los datos de ejemplo y el código del proyecto · no es una captura de Google Sheets';

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mostrar = (valor) => (valor instanceof Date ? v.formatearFecha(valor) : valor);

function planilla(pedidos, productos) {
  const catalogo = v.armarCatalogo(productos);
  const vistos = v.contarNumeros(pedidos);
  const anchos = [84, 92, 170, 84, 76, 100, 330];
  const letras = 'ABCDEFG';
  const encabezado = ['N° pedido', 'Fecha', 'Cliente', 'Código', 'Cantidad', 'Estado', 'Observaciones'];

  const filas = pedidos.map((f, i) => {
    const errores = v.validarPedido(f, catalogo, HOY, vistos).errores;
    const celdas = f.map((valor, c) => {
      const clases = [];
      if (typeof valor === 'number' || valor instanceof Date) clases.push('num');
      if (errores[c]) clases.push('error');
      let contenido = esc(mostrar(valor));
      if (c === 5) contenido = `<span class="chip ${valor === 'Procesado' ? 'ok' : valor === 'Con error' ? 'mal' : ''}">${contenido}</span>`;
      if (errores[c] && String(valor) === 'dos') { clases.push('con-nota'); contenido += `<div class="nota">${esc(errores[c])}</div>`; }
      return `<td class="${clases.join(' ')}">${contenido}</td>`;
    }).join('');
    return `<tr><th>${i + 2}</th>${celdas}</tr>`;
  }).join('');

  const menu = ['Procesar pedidos pendientes', 'Revisar stock y avisar', 'Enviar resumen semanal ahora', '-',
    'Revisar todos los pedidos (marcar errores)', '-', 'Activar automatizaciones', 'Desactivar automatizaciones']
    .map((m) => (m === '-' ? '<hr>' : `<div>${esc(m)}</div>`)).join('');

  return `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;font-family:Roboto,Arial,sans-serif;font-size:13px;color:#202124;background:#fff;width:1100px}
    .barra{padding:10px 14px 4px;display:flex;align-items:center;gap:10px}
    .logo{width:24px;height:30px;background:#188038;border-radius:3px;position:relative}
    .logo:after{content:"";position:absolute;inset:9px 5px;border:2px solid #fff;border-radius:1px}
    .titulo{font-size:18px}
    .menus{padding:0 46px 8px;display:flex;gap:14px;color:#3c4043;position:relative}
    .menus .activo{background:#e8f0fe;border-radius:4px;padding:0 6px;margin:0 -6px;color:#1a73e8;font-weight:500}
    .desplegable{position:absolute;left:530px;top:20px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.25);border-radius:4px;padding:6px 0;z-index:3;width:300px}
    .desplegable div{padding:6px 18px}.desplegable div:first-child{background:#f1f3f4}
    .desplegable hr{border:0;border-top:1px solid #e0e0e0;margin:5px 0}
    table{border-collapse:collapse;table-layout:fixed}
    td,th{border:1px solid #e2e3e3;height:22px;padding:0 5px;white-space:nowrap;overflow:visible;position:relative}
    th{background:#f8f9fa;color:#5f6368;font-weight:normal;text-align:center;width:40px}
    thead th{height:20px}
    tr.enc td{font-weight:bold;background:#188038;color:#fff}
    td.num{text-align:right}
    td.error{background:#f4c7c3}
    td.con-nota:after{content:"";position:absolute;right:0;top:0;border:5px solid transparent;border-top-color:#202124;border-right-color:#202124}
    .nota{position:absolute;left:100%;top:4px;margin-left:8px;background:#fff;border:1px solid #c6c6c6;box-shadow:0 1px 4px rgba(0,0,0,.2);padding:6px 9px;white-space:normal;width:230px;z-index:2;text-align:left;color:#202124}
    .chip{border-radius:10px;padding:1px 8px;background:#e8eaed}
    .chip.ok{background:#ceead6;color:#0d652d}.chip.mal{background:#fad2cf;color:#a50e0e}
    .tostada{position:fixed;right:18px;bottom:78px;background:#323232;color:#fff;padding:12px 16px;border-radius:4px;width:330px;line-height:1.4;box-shadow:0 2px 6px rgba(0,0,0,.3)}
    .tostada b{display:block;margin-bottom:2px}
    .pestanas{display:flex;gap:2px;background:#f1f3f4;padding:4px 50px;margin-top:6px}
    .pestanas span{padding:5px 14px;color:#5f6368}.pestanas .sel{background:#fff;color:#188038;font-weight:500;border-bottom:3px solid #188038}
    .aviso{font-size:11px;color:#80868b;text-align:center;padding:6px}
  </style>
  <div class="barra"><div class="logo"></div><div class="titulo">Pedidos y stock · Distribuidora de limpieza (ficticia)</div></div>
  <div class="menus"><span>Archivo</span><span>Editar</span><span>Ver</span><span>Insertar</span><span>Formato</span><span>Datos</span><span>Herramientas</span><span>Extensiones</span><span>Ayuda</span><span class="activo">⚙️ Automatización</span>
    <div class="desplegable">${menu}</div></div>
  <table><colgroup><col style="width:40px">${anchos.map((a) => `<col style="width:${a}px">`).join('')}</colgroup>
    <thead><tr><th></th>${[...letras].map((l) => `<th>${l}</th>`).join('')}</tr></thead>
    <tr class="enc"><th>1</th>${encabezado.map((e) => `<td>${esc(e)}</td>`).join('')}</tr>
    ${filas}
  </table>
  <div class="pestanas"><span class="sel">Pedidos</span><span>Productos</span><span>Configuración</span><span>Registro</span></div>
  <div class="tostada"><b>Automatización</b>5 pedidos procesados, 9 con error. Aviso de stock bajo enviado: LIM-004, LIM-009.</div>
  <div class="aviso">${AVISO_MAQUETA}</div>`;
}

function mail(asunto, html) {
  return `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:#f6f8fc;font-family:Arial,sans-serif;width:760px}
    .caja{background:#fff;margin:16px;border-radius:12px;padding:20px 26px 10px;box-shadow:0 1px 3px rgba(0,0,0,.12)}
    .asunto{font-size:21px;color:#1f1f1f;margin-bottom:14px}
    .de{display:flex;gap:10px;align-items:center;margin-bottom:18px;font-size:13px;color:#5e5e5e}
    .avatar{width:36px;height:36px;border-radius:50%;background:#188038;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold}
    .de b{color:#1f1f1f}
    .aviso{font-size:11px;color:#80868b;text-align:center;padding:0 0 12px}
  </style>
  <div class="caja"><div class="asunto">${esc(asunto)}</div>
    <div class="de"><div class="avatar">P</div><div><b>Planilla de pedidos</b> &lt;tu-cuenta@gmail.com&gt;<br>para compras@ejemplo.com</div></div>
    ${html}</div>
  <div class="aviso">Maqueta con el HTML real que arma el código y los datos de ejemplo · no es una captura de Gmail</div>`;
}

const TEXTOS_TARJETA = {
  es: ['Tu planilla de Google,', 'controlada sola', ['Valida al cargar', 'Marca en rojo códigos, cantidades y fechas mal cargadas'],
    ['Avisa stock bajo', 'Un solo aviso por producto, sin spam'], ['Resumen semanal', 'Llega solo los lunes, con lo que hay que revisar'],
    'Google Sheets + Apps Script, sin instalar nada'],
  en: ['Your Google spreadsheet,', 'checking itself', ['Validates on entry', 'Flags wrong codes, quantities and dates in red'],
    ['Low stock alerts', 'One alert per product, no spam'], ['Weekly summary', 'Arrives every Monday with what needs attention'],
    'Google Sheets + Apps Script, nothing to install'],
};

function tarjeta(idioma) {
  const [t1, t2, p1, p2, p3, pie] = TEXTOS_TARJETA[idioma];
  const paso = (icono, titulo, texto) => `<div class="paso"><div class="icono">${icono}</div><h3>${titulo}</h3><p>${texto}</p></div>`;
  return `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;width:1200px;height:627px;background:#eef0e8;font-family:'Segoe UI',Arial,sans-serif;color:#1d2a12;display:flex;flex-direction:column;align-items:center;justify-content:center}
    h1{font-size:46px;margin:0 0 46px;text-align:center;line-height:1.2}
    h1 span{color:#5a8a1f}
    .pasos{display:flex;gap:40px}
    .paso{background:#fff;border-radius:22px;border-top:9px solid #6b8e23;width:300px;padding:26px 18px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.07)}
    .icono{font-size:46px}
    h3{font-size:25px;margin:10px 0 8px}
    p{font-size:18px;color:#4a4a4a;margin:0}
    .pie{margin-top:44px;font-size:21px;color:#4a4a4a}
  </style>
  <h1>${t1}<br><span>${t2}</span></h1>
  <div class="pasos">${paso('✅', ...p1)}${paso('📦', ...p2)}${paso('📊', ...p3)}</div>
  <div class="pie">${pie}</div>`;
}

function sacarImagen(html, nombre, ancho, alto) {
  const archivo = path.join(TEMP, nombre.replace('.png', '.html'));
  fs.writeFileSync(archivo, html);
  const destino = path.join(CARPETA, nombre);
  fs.rmSync(destino, { force: true });
  execFileSync(NAVEGADOR, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${path.join(os.tmpdir(), 'maquetas-navegador')}`,
    `--window-size=${ancho},${alto}`,
    `--screenshot=${destino}`, 'file:///' + archivo.replace(/\\/g, '/')], { stdio: 'ignore' });
  // Edge a veces devuelve el control antes de terminar de escribir la imagen: se espera hasta 20 s.
  for (let i = 0; i < 40 && !fs.existsSync(destino); i++) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
  if (!fs.existsSync(destino)) throw new Error('No se pudo generar ' + nombre);
  console.log('capturas/' + nombre);
}

function main() {
  fs.mkdirSync(TEMP, { recursive: true });
  const r = simular(false);
  sacarImagen(planilla(r.pedidos, r.productos), 'planilla-pedidos.png', 1100, 820);
  sacarImagen(mail(r.aviso.asunto, r.aviso.html), 'mail-aviso-stock.png', 760, 470);
  sacarImagen(mail(r.resumen.asunto, r.resumen.html), 'mail-resumen-semanal.png', 760, 1100);
  sacarImagen(tarjeta('es'), 'tarjeta-web.png', 1200, 627);
  sacarImagen(tarjeta('en'), 'tarjeta-web-en.png', 1200, 627);
}

main();
