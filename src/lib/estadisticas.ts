import { crearSlug, normalizarNombre } from './nombres';

export const COLUMNAS_BATEO = [
  'juegos',
  'apariciones',
  'vecesAlBat',
  'hits',
  'sencillos',
  'dobles',
  'triples',
  'jonrones',
  'ponches',
  'basesPorBolas',
  'intencionales',
  'golpeados',
] as const;

export const COLUMNAS_PITCHEO = ['juegos', 'ganados', 'perdidos', 'salvados'] as const;

export const ENCABEZADOS_BATEO = ['JJ', 'AB', 'VB', 'HC', 'H1', 'H2', 'H3', 'HR', 'K', 'BB', 'BI', 'BG'] as const;
export const ENCABEZADOS_PITCHEO = ['JJ', 'G', 'P', 'SV'] as const;

export type ConteosBateo = Record<(typeof COLUMNAS_BATEO)[number], number>;
export type ConteosPitcheo = Record<(typeof COLUMNAS_PITCHEO)[number], number>;
export type FilaBateo = ConteosBateo & { nombre: string; acumulado: boolean };
export type FilaPitcheo = ConteosPitcheo & { nombre: string };
export type Interpretacion<T> = { filas: T[]; errores: string[] };

const MAXIMO_POR_CELDA = 999;
const MAXIMO_FILAS = 80;
const ACUMULADO = /\(\s*total\s*\)\s*$/i;
const ENTERO = /^\d+$/;
const NUMERO = /^-?\d+([.,]\d+)?$|^#/;

function esEncabezadoOTotales(primera: string) {
  const texto = primera.trim().toUpperCase();
  return texto === 'NOMBRE' || texto === 'NOMBRE:' || texto.startsWith('TOTALES');
}

function separar(linea: string, columnas: number, minimoSinTabuladores: number) {
  if (linea.includes('\t')) {
    const celdas = linea.split('\t').map((c) => c.trim());
    return { nombre: celdas[0] ?? '', valores: Array.from({ length: columnas }, (_, i) => celdas[i + 1] ?? ''), aviso: null };
  }
  const piezas = linea.trim().split(/\s+/);
  const primerNumero = piezas.findIndex((p) => NUMERO.test(p));
  const nombre = (primerNumero === -1 ? piezas : piezas.slice(0, primerNumero)).join(' ');
  const numeros = primerNumero === -1 ? [] : piezas.slice(primerNumero);
  const enteros = numeros.filter((n) => ENTERO.test(n));
  if (enteros.length < minimoSinTabuladores || enteros.length > columnas) {
    return {
      nombre,
      valores: [],
      aviso: `trae ${enteros.length} números; sin tabuladores escribe las ${columnas} columnas (con 0 en las vacías) o pega desde Excel`,
    };
  }
  return { nombre, valores: Array.from({ length: columnas }, (_, i) => enteros[i] ?? ''), aviso: null };
}

function interpretar<T extends { nombre: string }>(
  texto: string,
  columnas: readonly string[],
  encabezados: readonly string[],
  minimoSinTabuladores: number,
  armar: (nombre: string, valores: number[], acumulado: boolean) => T,
  conAcumulado: boolean,
): Interpretacion<T> {
  const filas: T[] = [];
  const errores: string[] = [];
  const vistos = new Set<string>();
  const lineas = texto.replace(/\r/g, '').split('\n');
  lineas.forEach((linea, indice) => {
    if (!linea.trim()) return;
    const numeroLinea = indice + 1;
    const primera = linea.split('\t')[0].trim().split(/\s+/)[0] ?? '';
    if (esEncabezadoOTotales(linea.includes('\t') ? linea.split('\t')[0] : primera)) return;
    const { nombre: crudo, valores, aviso } = separar(linea, columnas.length, minimoSinTabuladores);
    const acumulado = conAcumulado && ACUMULADO.test(crudo);
    const sinMarca = crudo.replace(ACUMULADO, '').trim();
    if (!sinMarca) {
      errores.push(`Línea ${numeroLinea}: falta el nombre.`);
      return;
    }
    const nombre = normalizarNombre(sinMarca).nombre;
    if (aviso) {
      errores.push(`Línea ${numeroLinea} (${nombre}): ${aviso}.`);
      return;
    }
    const numeros: number[] = [];
    for (const [i, valor] of valores.entries()) {
      if (valor === '') {
        numeros.push(0);
        continue;
      }
      if (!ENTERO.test(valor) || Number(valor) > MAXIMO_POR_CELDA) {
        errores.push(`Línea ${numeroLinea} (${nombre}): «${valor}» en ${encabezados[i]} no es un número entero.`);
        return;
      }
      numeros.push(Number(valor));
    }
    const clave = [crearSlug(nombre), acumulado, ...numeros].join('|');
    if (vistos.has(clave)) {
      errores.push(`Línea ${numeroLinea}: la fila de ${nombre} está repetida.`);
      return;
    }
    vistos.add(clave);
    filas.push(armar(nombre, numeros, acumulado));
  });
  if (filas.length > MAXIMO_FILAS) errores.push(`Son ${filas.length} filas; el máximo por equipo es ${MAXIMO_FILAS}.`);
  return { filas, errores };
}

export function interpretarBateo(texto: string): Interpretacion<FilaBateo> {
  return interpretar(
    texto,
    COLUMNAS_BATEO,
    ENCABEZADOS_BATEO,
    COLUMNAS_BATEO.length,
    (nombre, v, acumulado) => ({ nombre, acumulado, ...(Object.fromEntries(COLUMNAS_BATEO.map((c, i) => [c, v[i]])) as ConteosBateo) }),
    true,
  );
}

export function interpretarPitcheo(texto: string): Interpretacion<FilaPitcheo> {
  return interpretar(
    texto,
    COLUMNAS_PITCHEO,
    ENCABEZADOS_PITCHEO,
    3,
    (nombre, v) => ({ nombre, ...(Object.fromEntries(COLUMNAS_PITCHEO.map((c, i) => [c, v[i]])) as ConteosPitcheo) }),
    false,
  );
}

export function textoDeBateo(filas: FilaBateo[]) {
  const lineas = filas.map((f) => [`${f.nombre}${f.acumulado ? ' (TOTAL)' : ''}`, ...COLUMNAS_BATEO.map((c) => String(f[c]))].join('\t'));
  return filas.length ? ['NOMBRE', ...ENCABEZADOS_BATEO].join('\t') + '\n' + lineas.join('\n') : '';
}

export function textoDePitcheo(filas: FilaPitcheo[]) {
  const lineas = filas.map((f) => [f.nombre, ...COLUMNAS_PITCHEO.map((c) => String(f[c]))].join('\t'));
  return filas.length ? ['NOMBRE', ...ENCABEZADOS_PITCHEO].join('\t') + '\n' + lineas.join('\n') : '';
}

const redondear = (valor: number) => Math.round(valor * 1000) / 1000;

export function porcentajesDeBateo(f: ConteosBateo) {
  return {
    promedio: f.vecesAlBat > 0 ? redondear(f.hits / f.vecesAlBat) : null,
    embasado: f.apariciones > 0 ? redondear((f.hits + f.basesPorBolas + f.intencionales + f.golpeados) / f.apariciones) : null,
    slugging: f.vecesAlBat > 0 ? redondear((f.sencillos + 2 * f.dobles + 3 * f.triples + 4 * f.jonrones) / f.vecesAlBat) : null,
  };
}

export function formatearPorcentaje(valor: number | null) {
  if (valor === null) return '—';
  const texto = valor.toFixed(3);
  return texto.startsWith('0.') ? texto.slice(1) : texto;
}

export function sumarBateo(filas: FilaBateo[]): ConteosBateo {
  const suma = Object.fromEntries(COLUMNAS_BATEO.map((c) => [c, 0])) as ConteosBateo;
  for (const f of filas) {
    if (f.acumulado) continue;
    for (const c of COLUMNAS_BATEO) suma[c] += f[c];
  }
  return suma;
}

export function candidatosDeBateo<T extends FilaBateo>(filas: T[]): T[] {
  const acumulados = new Map<string, T>();
  for (const f of filas) {
    if (!f.acumulado) continue;
    const clave = crearSlug(f.nombre);
    const previo = acumulados.get(clave);
    if (!previo || f.juegos > previo.juegos) acumulados.set(clave, f);
  }
  return [...acumulados.values(), ...filas.filter((f) => !f.acumulado && !acumulados.has(crearSlug(f.nombre)))];
}

function primerosConEmpates<T>(lista: T[], valor: (x: T) => number, cuantos: number) {
  const corte = lista[cuantos - 1];
  if (!corte) return lista;
  const minimo = valor(corte);
  return lista.filter((x, i) => i < cuantos || valor(x) === minimo);
}

export function calcularLideres<B extends FilaBateo, P extends FilaPitcheo>(bateo: B[], pitcheo: P[], minimoApariciones: number) {
  const candidatos = candidatosDeBateo(bateo);
  const promedio = (f: B) => porcentajesDeBateo(f).promedio ?? 0;
  return {
    promedio: candidatos
      .filter((f) => f.apariciones >= minimoApariciones && f.vecesAlBat > 0)
      .sort((a, b) => promedio(b) - promedio(a) || b.hits - a.hits)
      .slice(0, 10),
    jonrones: primerosConEmpates(
      candidatos.filter((f) => f.jonrones > 0).sort((a, b) => b.jonrones - a.jonrones || promedio(b) - promedio(a)),
      (f) => f.jonrones,
      6,
    ),
    hits: primerosConEmpates(
      candidatos.filter((f) => f.hits > 0).sort((a, b) => b.hits - a.hits || promedio(b) - promedio(a)),
      (f) => f.hits,
      6,
    ),
    ganados: primerosConEmpates(
      pitcheo.filter((p) => p.ganados > 0).sort((a, b) => b.ganados - a.ganados || a.perdidos - b.perdidos),
      (p) => p.ganados,
      6,
    ),
  };
}
