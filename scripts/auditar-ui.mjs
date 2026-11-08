import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { get } from 'node:http';
import { get as getSeguro } from 'node:https';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = process.env.AUDITORIA_URL ?? 'http://localhost:3000';
const ANCHOS = [320, 390, 768, 1366];
const TEMAS = ['light', 'dark'];
const NOMBRE_TEMA = { light: 'claro', dark: 'oscuro' };
const PESO_MAXIMO_PORTADA = 500 * 1024;
const ETIQUETAS_WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const NAVEGADORES = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

const PAGINAS = [
  '/',
  '/calendario',
  '/jornadas/10',
  '/jornadas/11',
  '/posiciones',
  '/equipos',
  '/equipos/astros',
  '/estadisticas',
  '/noticias',
  '/noticias/juego-de-estrellas-2026',
  '/galeria',
  '/galeria/juego-de-estrellas-2026',
  '/en-vivo',
  '/redes',
  '/altas-y-bajas',
  '/documentos',
  '/contacto',
  '/no-existe',
];

const CREDENCIALES =
  process.env.AUDITORIA_USUARIO && process.env.AUDITORIA_CLAVE
    ? { username: process.env.AUDITORIA_USUARIO, password: process.env.AUDITORIA_CLAVE }
    : null;

const PAGINAS_PANEL = [
  '/panel',
  '/panel/resultados',
  { desde: '/panel/resultados', enlace: '/panel/resultados/' },
  '/panel/calendario',
  { desde: '/panel/calendario', enlace: '/panel/calendario/' },
  '/panel/calendario/temporadas',
  '/panel/reglas',
  '/panel/equipos',
  { desde: '/panel/equipos', enlace: '/panel/equipos/' },
  '/panel/estadisticas',
  '/panel/noticias',
  '/panel/noticias/nueva',
  { desde: '/panel/noticias', enlace: '/panel/noticias/' },
  '/panel/eventos',
  '/panel/eventos/nuevo',
  { desde: '/panel/eventos', enlace: '/panel/eventos/' },
  '/panel/galeria',
  { desde: '/panel/galeria', enlace: '/panel/galeria/' },
  '/panel/transmisiones',
  '/panel/redes',
  '/panel/patrocinadores',
  '/panel/documentos',
  '/panel/contacto',
  '/panel/usuarios',
  '/panel/bitacora',
  '/panel/contrasena',
];

const TEMA_CONTRARIO = "(matchMedia('(prefers-color-scheme: dark)').matches ? 'claro' : 'oscuro')";
const TEMA_MARCADO = `document.querySelector('input[name="tema"]:checked')?.value === ${TEMA_CONTRARIO}`;

const ESTADOS = [
  {
    nombre: 'menu-abierto',
    pagina: '/',
    anchos: [320, 390],
    accion: `document.querySelector('button[aria-controls="menu-principal"]').click()`,
    listo: `document.querySelector('button[aria-controls="menu-principal"]').getAttribute('aria-expanded') === 'true'`,
  },
  {
    nombre: 'tema-elegido',
    pagina: '/',
    anchos: [390, 1366],
    accion: `(() => { const boton = document.querySelector('button[aria-controls="menu-principal"]'); if (boton.offsetParent) boton.click(); document.querySelector('input[name="tema"][value="' + ${TEMA_CONTRARIO} + '"]').click(); })()`,
    listo: `document.documentElement.dataset.tema === ${TEMA_CONTRARIO} && localStorage.getItem('tema') === ${TEMA_CONTRARIO} && ${TEMA_MARCADO}`,
    limpiar: `localStorage.removeItem('tema')`,
  },
  {
    nombre: 'tema-guardado',
    pagina: '/posiciones',
    anchos: [390],
    accion: `localStorage.setItem('tema', ${TEMA_CONTRARIO}); location.reload()`,
    listo: `document.readyState === 'complete' && document.documentElement.dataset.tema === ${TEMA_CONTRARIO} && ${TEMA_MARCADO}`,
    limpiar: `localStorage.removeItem('tema')`,
  },
  {
    nombre: 'foto-ampliada',
    pagina: '/galeria/juego-de-estrellas-2026',
    anchos: [390, 1366],
    accion: `document.querySelector('button[aria-label^="Ampliar"]').click()`,
    listo: `(() => { const i = document.querySelector('dialog[open] figure img'); return Boolean(i && i.complete && i.naturalWidth); })()`,
  },
];

const navegador = NAVEGADORES.find((ruta) => existsSync(ruta));
if (!navegador) {
  console.error('No encontré Edge ni Chrome instalados.');
  process.exit(1);
}

try {
  const respuesta = await fetch(BASE);
  if (!respuesta.ok) throw new Error(String(respuesta.status));
} catch {
  console.error(`La aplicación no responde en ${BASE}. Arráncala con npm run build y npm start.`);
  process.exit(1);
}

const ahora = new Date();
const dos = (n) => String(n).padStart(2, '0');
const marca = `${ahora.getFullYear()}-${dos(ahora.getMonth() + 1)}-${dos(ahora.getDate())}-${dos(ahora.getHours())}${dos(ahora.getMinutes())}`;
const carpeta = join('reportes', `auditoria-ui-${marca}`);
mkdirSync(join(carpeta, 'capturas'), { recursive: true });

const perfil = mkdtempSync(join(tmpdir(), 'auditoria-liga-'));
const puerto = 9400 + Math.floor(Math.random() * 400);
const proceso = spawn(
  navegador,
  ['--headless=new', `--remote-debugging-port=${puerto}`, `--user-data-dir=${perfil}`, '--no-first-run', '--disable-gpu', '--hide-scrollbars', 'about:blank'],
  { stdio: 'ignore' },
);

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
let destinos = [];
for (let i = 0; i < 80 && !destinos.some((d) => d.type === 'page'); i++) {
  try {
    destinos = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
  } catch {
    await esperar(250);
  }
}
const destino = destinos.find((d) => d.type === 'page');
const ws = new WebSocket(destino.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));

let siguienteId = 0;
const pendientes = new Map();
const oyentes = new Map();
ws.addEventListener('message', (evento) => {
  const mensaje = JSON.parse(evento.data);
  if (mensaje.id && pendientes.has(mensaje.id)) {
    pendientes.get(mensaje.id)(mensaje);
    pendientes.delete(mensaje.id);
  }
  for (const oyente of oyentes.get(mensaje.method) ?? []) oyente(mensaje.params);
});
const cdp = (method, params = {}) =>
  new Promise((resolver) => {
    const id = ++siguienteId;
    pendientes.set(id, resolver);
    ws.send(JSON.stringify({ id, method, params }));
  });
const escuchar = (metodo, oyente) => oyentes.set(metodo, [...(oyentes.get(metodo) ?? []), oyente]);
const evaluar = async (expresion) => {
  const r = await cdp('Runtime.evaluate', { expression: expresion, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? 'Error al evaluar');
  return r.result?.result?.value;
};

let errores = [];
let enVuelo = new Set();
let ultimoMovimiento = Date.now();
let respuestasConError = [];
let alCargar = null;
escuchar('Page.loadEventFired', () => alCargar?.());
escuchar('Runtime.exceptionThrown', (p) => errores.push(p.exceptionDetails.exception?.description ?? p.exceptionDetails.text));
escuchar('Runtime.consoleAPICalled', (p) => {
  if (p.type === 'error') errores.push(p.args.map((a) => a.value ?? a.description).join(' '));
});
const esPropia = (url) => url.startsWith(BASE) || /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//.test(url);
const terminar = (p) => {
  if (enVuelo.delete(p.requestId)) ultimoMovimiento = Date.now();
};
escuchar('Network.requestWillBeSent', (p) => {
  if (!esPropia(p.request.url)) return;
  enVuelo.add(p.requestId);
  ultimoMovimiento = Date.now();
});
escuchar('Network.responseReceived', (p) => {
  if (p.response.status >= 400 && p.type !== 'Document' && esPropia(p.response.url)) respuestasConError.push(`${p.response.status} ${p.response.url}`);
});
escuchar('Network.loadingFinished', terminar);
escuchar('Network.loadingFailed', terminar);

await cdp('Page.enable');
await cdp('Runtime.enable');
await cdp('Network.enable');
await cdp('Network.setCacheDisabled', { cacheDisabled: true });

async function esperarRedQuieta() {
  const limite = Date.now() + 20000;
  while (Date.now() < limite) {
    if (enVuelo.size === 0 && Date.now() - ultimoMovimiento > 600) return;
    await esperar(100);
  }
}

async function esperarQue(expresion, ms = 10000) {
  const limite = Date.now() + ms;
  while (Date.now() < limite) {
    if (await evaluar(expresion).catch(() => false)) return true;
    await esperar(100);
  }
  return false;
}

async function configurar(ancho, tema, densidad = 1) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: ancho < 768 ? 800 : 900, deviceScaleFactor: densidad, mobile: ancho < 768 });
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: tema }] });
}

async function navegar(ruta) {
  errores = [];
  respuestasConError = [];
  enVuelo = new Set();
  const cargada = new Promise((r) => {
    alCargar = r;
  });
  await cdp('Page.navigate', { url: `${BASE}${ruta}` });
  await Promise.race([cargada, esperar(20000)]);
  await evaluar('document.fonts.ready.then(() => true)');
  await esperarRedQuieta();
}

async function auditar() {
  await evaluar(AXE);
  return evaluar(`axe.run(document, { runOnly: { type: 'tag', values: ${JSON.stringify(ETIQUETAS_WCAG)} }, resultTypes: ['violations'], iframes: false })
    .then((r) => r.violations.map((v) => ({ id: v.id, impacto: v.impact, ayuda: v.help, nodos: v.nodes.slice(0, 6).map((n) => n.target.join(' ')) })))`);
}

async function cargarImagenesDiferidas() {
  await evaluar("document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; })");
  await esperarRedQuieta();
  await esperarQue('[...document.images].every((i) => i.complete)', 15000);
}

async function capturar(nombre, ancho) {
  await cargarImagenesDiferidas();
  const alto = await evaluar('Math.min(16000, document.documentElement.scrollHeight)');
  const { result } = await cdp('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: ancho, height: alto, scale: 1 },
  });
  writeFileSync(join(carpeta, 'capturas', `${nombre}.png`), Buffer.from(result.data, 'base64'));
}

function bytesComprimidos(url) {
  return new Promise((resolver) => {
    const encabezados = { 'accept-encoding': 'gzip', ...(url.includes('_rsc=') ? { rsc: '1' } : {}) };
    const pedir = url.startsWith('https:') ? getSeguro : get;
    pedir(url, { headers: encabezados }, (respuesta) => {
      let total = 0;
      respuesta.on('data', (trozo) => (total += trozo.length));
      respuesta.on('end', () => resolver(total));
    }).on('error', () => resolver(0));
  });
}

async function pesoDePagina() {
  const propia = "((u) => u.startsWith(location.origin) || new URL(u).hostname.endsWith('.public.blob.vercel-storage.com'))";
  const urls = await evaluar(
    `[...performance.getEntriesByType('navigation'), ...performance.getEntriesByType('resource')].map((e) => e.name).filter(${propia})`,
  );
  const externas = await evaluar(`performance.getEntriesByType('resource').filter((e) => !${propia}(e.name)).length`);
  const tamanos = await Promise.all(urls.map(bytesComprimidos));
  return { bytes: tamanos.reduce((a, b) => a + b, 0), peticiones: urls.length, externas };
}

const nombreDe = (ruta) => (ruta === '/' ? 'portada' : ruta.slice(1).replaceAll('/', '-'));
const resultados = [];
const pesos = [];

for (const ruta of PAGINAS) {
  for (const ancho of ANCHOS) {
    for (const tema of TEMAS) {
      await configurar(ancho, tema);
      await navegar(ruta);
      const desborde = await evaluar('document.documentElement.scrollWidth - document.documentElement.clientWidth');
      const violaciones = await auditar();
      const nombre = `${nombreDe(ruta)}-${ancho}-${NOMBRE_TEMA[tema]}`;
      await capturar(nombre, ancho);
      resultados.push({ nombre, ruta, ancho, tema, violaciones, desborde, errores: [...errores, ...respuestasConError] });
      process.stdout.write(violaciones.length || desborde > 0 || errores.length ? 'x' : '.');
    }
  }
}

for (const ruta of PAGINAS) {
  await configurar(390, 'light', 2);
  await navegar(ruta);
  pesos.push({ ruta, ...(await pesoDePagina()) });
  process.stdout.write('.');
}

const paginasPanel = [];
if (CREDENCIALES) {
  await configurar(1366, 'light');
  await navegar('/panel/entrar');
  const entro = await evaluar(`fetch('/api/auth/sign-in/username', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(${JSON.stringify(CREDENCIALES)}) }).then((r) => r.ok)`);
  if (!entro) {
    console.error('No se pudo entrar al panel con AUDITORIA_USUARIO y AUDITORIA_CLAVE.');
    process.exit(1);
  }
  for (const pagina of PAGINAS_PANEL) {
    if (typeof pagina === 'string') {
      paginasPanel.push(pagina);
      continue;
    }
    await navegar(pagina.desde);
    const enlace = await evaluar(
      `[...document.querySelectorAll('main a')].map((a) => a.getAttribute('href')).find((h) => h && h.startsWith(${JSON.stringify(pagina.enlace)}) && !h.endsWith('/nueva') && !h.endsWith('/nuevo') && !h.endsWith('/temporadas'))`,
    );
    if (enlace) paginasPanel.push(enlace);
  }
  const jugador = paginasPanel.find((p) => /^\/panel\/equipos\/\d+$/.test(p));
  if (jugador) {
    await navegar(jugador);
    const enlaceJugador = await evaluar(`[...document.querySelectorAll('main a')].map((a) => a.getAttribute('href')).find((h) => h && h.includes('/jugadores/'))`);
    if (enlaceJugador) paginasPanel.push(enlaceJugador);
  }
  for (const ruta of paginasPanel) {
    for (const ancho of ANCHOS) {
      for (const tema of TEMAS) {
        await configurar(ancho, tema);
        await navegar(ruta);
        if (new URL(await evaluar('location.href')).pathname !== ruta) {
          resultados.push({ nombre: ruta, ruta, ancho, tema, violaciones: [], desborde: 0, errores: ['La página mandó a otra dirección'] });
          continue;
        }
        const desborde = await evaluar('document.documentElement.scrollWidth - document.documentElement.clientWidth');
        const violaciones = await auditar();
        const nombre = `${nombreDe(ruta)}-${ancho}-${NOMBRE_TEMA[tema]}`;
        await capturar(nombre, ancho);
        resultados.push({ nombre, ruta, ancho, tema, violaciones, desborde, errores: [...errores, ...respuestasConError] });
        process.stdout.write(violaciones.length || desborde > 0 || errores.length ? 'x' : '.');
      }
    }
  }
  ESTADOS.push({
    nombre: 'panel-menu-abierto',
    pagina: '/panel',
    anchos: [390],
    accion: `document.querySelector('button[aria-controls="secciones-panel"]').click()`,
    listo: `document.querySelector('button[aria-controls="secciones-panel"]').getAttribute('aria-expanded') === 'true'`,
  });
}

for (const estado of ESTADOS) {
  for (const ancho of estado.anchos) {
    for (const tema of TEMAS) {
      await configurar(ancho, tema);
      await navegar(estado.pagina);
      await evaluar(estado.accion);
      const listo = await esperarQue(estado.listo);
      await esperar(300);
      const violaciones = await auditar();
      const desborde = await evaluar('document.documentElement.scrollWidth - document.documentElement.clientWidth');
      const nombre = `${estado.nombre}-${ancho}-${NOMBRE_TEMA[tema]}`;
      const { result } = await cdp('Page.captureScreenshot', { format: 'png' });
      writeFileSync(join(carpeta, 'capturas', `${nombre}.png`), Buffer.from(result.data, 'base64'));
      if (estado.limpiar) await evaluar(estado.limpiar);
      resultados.push({
        nombre,
        ruta: `${estado.pagina} (${estado.nombre})`,
        ancho,
        tema,
        violaciones,
        desborde,
        errores: [...(listo ? [] : ['El estado no terminó de abrir']), ...errores, ...respuestasConError],
      });
      process.stdout.write(violaciones.length || desborde > 0 || !listo ? 'x' : '.');
    }
  }
}

ws.close();
proceso.kill();
await esperar(500);
rmSync(perfil, { recursive: true, force: true });

const conProblemas = resultados.filter((r) => r.violaciones.length || r.desborde > 0 || r.errores.length);
const pesoPortada = pesos.find((p) => p.ruta === '/')?.bytes ?? 0;
const kb = (b) => `${(b / 1024).toFixed(0)} KB`;
const lineas = [
  `# Auditoría de la interfaz, ${marca}`,
  '',
  `${resultados.length} revisiones (${PAGINAS.length} páginas públicas${paginasPanel.length ? ` y ${paginasPanel.length} del panel` : ''} en ${ANCHOS.join(', ')} px, claro y oscuro, más ${ESTADOS.length} estados). axe-core con ${ETIQUETAS_WCAG.join(', ')}.`,
  '',
  `- Con problemas: ${conProblemas.length}`,
  `- Portada en celular (390 px, pantalla de densidad 2, primera carga, con gzip): ${kb(pesoPortada)} de ${kb(PESO_MAXIMO_PORTADA)} permitidos`,
  '',
  '## Peso de cada página en la primera carga',
  '',
  'Celular de 390 px con densidad 2, sin caché. Cada archivo se vuelve a pedir con gzip para contar lo que viaja comprimido, como en Vercel (que usa brotli y pesa algo menos).',
  '',
  '| Página | Peso | Archivos | De otros sitios |',
  '| --- | --- | --- | --- |',
  ...pesos.map((p) => `| ${p.ruta} | ${kb(p.bytes)} | ${p.peticiones} | ${p.externas} |`),
  '',
  '## Problemas',
  '',
  ...(conProblemas.length === 0
    ? ['Ninguno.']
    : conProblemas.flatMap((r) => [
        `### ${r.ruta}, ${r.ancho} px, ${NOMBRE_TEMA[r.tema]}`,
        '',
        ...(r.desborde > 0 ? [`- Desbordamiento horizontal de ${r.desborde} px`] : []),
        ...r.violaciones.map((v) => `- ${v.id} (${v.impacto}): ${v.ayuda}. ${v.nodos.map((n) => `\`${n}\``).join(', ')}`),
        ...r.errores.map((e) => `- Error: ${e}`),
        '',
      ])),
];
writeFileSync(join(carpeta, 'resumen.md'), lineas.join('\n'));
console.log(`\n${resultados.length} revisiones, ${conProblemas.length} con problemas. Portada: ${kb(pesoPortada)}.`);
console.log(`Resumen y capturas en ${carpeta}`);
process.exit(conProblemas.length || pesoPortada > PESO_MAXIMO_PORTADA ? 1 : 0);
