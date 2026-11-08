import ts from 'typescript';

const SIMBOLOS_PERMITIDOS = new Set([0xa9, 0xae, 0x2122]);
const PATRON_EMOJI = /\p{Extended_Pictographic}|\u{FE0F}|\u{20E3}/gu;

const EXTENSIONES_SCRIPT = {
  '.ts': ts.ScriptKind.TS,
  '.mts': ts.ScriptKind.TS,
  '.cts': ts.ScriptKind.TS,
  '.tsx': ts.ScriptKind.TSX,
  '.js': ts.ScriptKind.JS,
  '.mjs': ts.ScriptKind.JS,
  '.cjs': ts.ScriptKind.JS,
  '.jsx': ts.ScriptKind.JSX,
};

const ARCHIVOS_DE_LINEAS = ['.gitignore', '.env.example', '.npmrc', '.nvmrc', '.editorconfig', '.vercelignore'];

export function extensionDe(nombre) {
  const base = nombre.split(/[\\/]/).pop() ?? nombre;
  if (ARCHIVOS_DE_LINEAS.includes(base)) return base;
  const punto = base.lastIndexOf('.');
  return punto > 0 ? base.slice(punto).toLowerCase() : '';
}

function lineaDe(texto, posicion) {
  let linea = 1;
  for (let i = 0; i < posicion; i++) if (texto.charCodeAt(i) === 10) linea++;
  return linea;
}

function fragmento(texto, posicion) {
  return texto.slice(posicion, posicion + 60).split('\n')[0].trim();
}

function comentariosEnScript(texto, nombre) {
  const fuente = ts.createSourceFile(nombre, texto, ts.ScriptTarget.Latest, true, EXTENSIONES_SCRIPT[extensionDe(nombre)]);
  const posiciones = new Set();
  const visitar = (nodo) => {
    if (nodo.kind !== ts.SyntaxKind.JsxText) {
      for (const rango of ts.getLeadingCommentRanges(texto, nodo.pos) ?? []) posiciones.add(rango.pos);
      for (const rango of ts.getTrailingCommentRanges(texto, nodo.end) ?? []) posiciones.add(rango.pos);
    }
    for (const hijo of nodo.getChildren(fuente)) visitar(hijo);
  };
  visitar(fuente);
  return [...posiciones].sort((a, b) => a - b);
}

function borrarCadenas(texto, patron) {
  return texto.replace(patron, (cadena) => cadena.replace(/[^\n]/g, ' '));
}

function comentariosEnCss(texto) {
  const limpio = borrarCadenas(texto, /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g);
  return [...limpio.matchAll(/\/\*/g)].map((m) => m.index);
}

function comentariosEnSql(texto) {
  const limpio = borrarCadenas(texto, /'(?:[^']|'')*'|"(?:[^"]|"")*"/g);
  return [...limpio.matchAll(/--|\/\*/g)].map((m) => m.index);
}

function comentariosEnLineas(texto) {
  return [...texto.matchAll(/^[ \t]*[#;]/gm)].map((m) => m.index);
}

function comentariosEnJson(texto) {
  try {
    JSON.parse(texto);
    return [];
  } catch {
    const limpio = borrarCadenas(texto, /"(?:[^"\\\n]|\\.)*"/g);
    const posiciones = [...limpio.matchAll(/\/\/|\/\*/g)].map((m) => m.index);
    return posiciones.length > 0 ? posiciones : [0];
  }
}

export function buscarComentarios(texto, nombre) {
  const extension = extensionDe(nombre);
  let posiciones = [];
  if (extension in EXTENSIONES_SCRIPT) posiciones = comentariosEnScript(texto, nombre);
  else if (extension === '.css') posiciones = comentariosEnCss(texto);
  else if (extension === '.sql') posiciones = comentariosEnSql(texto);
  else if (extension === '.json') posiciones = comentariosEnJson(texto);
  else if (ARCHIVOS_DE_LINEAS.includes(extension)) posiciones = comentariosEnLineas(texto);
  return posiciones.map((posicion) => ({ linea: lineaDe(texto, posicion), texto: fragmento(texto, posicion) }));
}

export function buscarEmojis(texto) {
  const hallazgos = [];
  for (const m of texto.matchAll(PATRON_EMOJI)) {
    if (SIMBOLOS_PERMITIDOS.has(m[0].codePointAt(0))) continue;
    hallazgos.push({ linea: lineaDe(texto, m.index), texto: `U+${m[0].codePointAt(0).toString(16).toUpperCase()}` });
  }
  return hallazgos;
}

export const EXTENSIONES_REVISADAS = new Set([
  ...Object.keys(EXTENSIONES_SCRIPT),
  '.css',
  '.sql',
  '.json',
  '.md',
  '.svg',
  '.html',
  ...ARCHIVOS_DE_LINEAS,
]);
