import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buscarComentarios, buscarEmojis, EXTENSIONES_REVISADAS, extensionDe } from './lib/reglas.mjs';

const RAIZ = process.cwd();
const CARPETAS_OMITIDAS = new Set(['node_modules', '.next', '.git', '.vercel', 'coverage', 'out', 'build', 'legado']);
const ARCHIVOS_OMITIDOS = new Set(['next-env.d.ts', 'package-lock.json']);

function recorrer(carpeta, archivos = []) {
  for (const entrada of readdirSync(carpeta, { withFileTypes: true })) {
    const ruta = join(carpeta, entrada.name);
    if (entrada.isDirectory()) {
      if (!CARPETAS_OMITIDAS.has(entrada.name)) recorrer(ruta, archivos);
    } else if (!ARCHIVOS_OMITIDOS.has(entrada.name) && EXTENSIONES_REVISADAS.has(extensionDe(entrada.name))) {
      archivos.push(ruta);
    }
  }
  return archivos;
}

const problemas = [];
for (const ruta of recorrer(RAIZ)) {
  const texto = readFileSync(ruta, 'utf8');
  const nombre = relative(RAIZ, ruta).replaceAll('\\', '/');
  for (const h of buscarComentarios(texto, nombre)) problemas.push(`${nombre}:${h.linea}  comentario: ${h.texto}`);
  for (const h of buscarEmojis(texto)) problemas.push(`${nombre}:${h.linea}  emoji: ${h.texto}`);
}

if (problemas.length > 0) {
  console.error(`Reglas del proyecto: ${problemas.length} problema(s). El código no lleva comentarios ni emojis.`);
  for (const p of problemas) console.error(`  ${p}`);
  process.exit(1);
}

console.log('Reglas del proyecto: sin comentarios ni emojis.');
