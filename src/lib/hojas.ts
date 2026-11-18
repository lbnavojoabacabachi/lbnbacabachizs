import { COLUMNAS_BATEO, ENCABEZADOS_BATEO, type ConteosBateo } from './estadisticas';
import { crearSlug } from './nombres';

export const COLUMNAS_HOJA = COLUMNAS_BATEO.filter((c) => c !== 'juegos') as Exclude<keyof ConteosBateo, 'juegos'>[];

export type ColumnaHoja = (typeof COLUMNAS_HOJA)[number];
export type ConteosHoja = Record<ColumnaHoja, number>;
export type CeldasHoja = Record<ColumnaHoja, string>;
export type ErroresHoja = Partial<Record<ColumnaHoja, string>>;

export const SIGLAS_HOJA = Object.fromEntries(COLUMNAS_BATEO.map((c, i) => [c, ENCABEZADOS_BATEO[i]])) as Record<keyof ConteosBateo, string>;

export const MAXIMO_POR_JUEGO = 30;

export const DECISIONES = ['ganado', 'perdido', 'salvado'] as const;
export type Decision = (typeof DECISIONES)[number];
export type Pitcheo = 'lanzo' | Decision;

export const OPCIONES_PITCHEO: { valor: '' | Pitcheo; texto: string }[] = [
  { valor: '', texto: 'No lanzó' },
  { valor: 'lanzo', texto: 'Lanzó' },
  { valor: 'ganado', texto: 'Ganó' },
  { valor: 'perdido', texto: 'Perdió' },
  { valor: 'salvado', texto: 'Salvó' },
];

export type ResultadoEquipo = 'gano' | 'perdio' | 'empato';

export const campoBateo = (jugadorId: number, columna: ColumnaHoja) => `b-${jugadorId}-${SIGLAS_HOJA[columna].toLowerCase()}`;
export const campoPitcheo = (jugadorId: number) => `p-${jugadorId}`;

export function celdasVacias(): CeldasHoja {
  return Object.fromEntries(COLUMNAS_HOJA.map((c) => [c, ''])) as CeldasHoja;
}

export function celdasDe(conteos: ConteosHoja): CeldasHoja {
  return Object.fromEntries(COLUMNAS_HOJA.map((c) => [c, String(conteos[c])])) as CeldasHoja;
}

export function interpretarLinea(celdas: CeldasHoja): { conteos: ConteosHoja | null; errores: ErroresHoja } {
  const limpias = Object.fromEntries(COLUMNAS_HOJA.map((c) => [c, (celdas[c] ?? '').trim()])) as CeldasHoja;
  if (COLUMNAS_HOJA.every((c) => limpias[c] === '')) return { conteos: null, errores: {} };

  const errores: ErroresHoja = {};
  const v = Object.fromEntries(COLUMNAS_HOJA.map((c) => [c, 0])) as ConteosHoja;
  for (const c of COLUMNAS_HOJA) {
    if (limpias[c] === '') continue;
    if (!/^\d{1,2}$/.test(limpias[c]) || Number(limpias[c]) > MAXIMO_POR_JUEGO) {
      errores[c] = `${SIGLAS_HOJA[c]} lleva un número entero de 0 a ${MAXIMO_POR_JUEGO}.`;
      continue;
    }
    v[c] = Number(limpias[c]);
  }
  if (Object.keys(errores).length > 0) return { conteos: null, errores };

  if (limpias.apariciones === '') return { conteos: null, errores: { apariciones: 'falta AB (escribe 0 si entró al juego sin batear).' } };

  const extrabases = v.dobles + v.triples + v.jonrones;
  if (limpias.hits === '') v.hits = v.sencillos + extrabases;
  else if (limpias.sencillos === '') v.sencillos = v.hits - extrabases;
  if (v.sencillos < 0) return { conteos: null, errores: { hits: `HC (${v.hits}) es menor que H2 + H3 + HR (${extrabases}).` } };
  if (v.hits !== v.sencillos + extrabases) {
    return { conteos: null, errores: { hits: `HC (${v.hits}) no es la suma de H1, H2, H3 y HR (${v.sencillos + extrabases}).` } };
  }
  if (v.vecesAlBat > v.apariciones) errores.vecesAlBat = `VB (${v.vecesAlBat}) no puede pasar de AB (${v.apariciones}).`;
  else if (v.vecesAlBat + v.basesPorBolas + v.intencionales + v.golpeados > v.apariciones) {
    errores.apariciones = `AB (${v.apariciones}) debe ser al menos VB + BB + BI + BG (${v.vecesAlBat + v.basesPorBolas + v.intencionales + v.golpeados}).`;
  }
  if (v.hits + v.ponches > v.vecesAlBat) {
    errores[v.ponches > 0 && v.hits <= v.vecesAlBat ? 'ponches' : 'hits'] = `HC + K (${v.hits + v.ponches}) no puede pasar de VB (${v.vecesAlBat}).`;
  }
  if (Object.keys(errores).length > 0) return { conteos: null, errores };
  return { conteos: v, errores: {} };
}

export function interpretarPitcheoDeJuego(valor: string): Pitcheo | null | undefined {
  if (valor === '') return null;
  return OPCIONES_PITCHEO.some((o) => o.valor === valor) ? (valor as Pitcheo) : undefined;
}

export function resultadoDelEquipo(propias: number, ajenas: number): ResultadoEquipo {
  return propias > ajenas ? 'gano' : propias < ajenas ? 'perdio' : 'empato';
}

const MOTIVO: Record<ResultadoEquipo, Partial<Record<Decision, string>>> = {
  gano: { perdido: 'su equipo ganó, así que no puede ser el pitcher perdedor.' },
  perdio: { ganado: 'su equipo perdió, así que no puede ser el pitcher ganador.', salvado: 'su equipo perdió, así que no puede salvar el juego.' },
  empato: {
    ganado: 'el juego quedó empatado y nadie gana.',
    perdido: 'el juego quedó empatado y nadie pierde.',
    salvado: 'el juego quedó empatado y nadie salva.',
  },
};

const UNICO: Record<Decision, string> = {
  ganado: 'solo un pitcher gana el juego.',
  perdido: 'solo un pitcher pierde el juego.',
  salvado: 'solo un pitcher salva el juego.',
};

export function validarPitcheo(lanzadores: { jugadorId: number; pitcheo: Pitcheo }[], resultado: ResultadoEquipo) {
  const errores: Record<number, string> = {};
  const vistas = new Set<Decision>();
  for (const { jugadorId, pitcheo } of lanzadores) {
    if (pitcheo === 'lanzo') continue;
    const motivo = MOTIVO[resultado][pitcheo];
    if (motivo) errores[jugadorId] = motivo;
    else if (vistas.has(pitcheo)) errores[jugadorId] = UNICO[pitcheo];
    vistas.add(pitcheo);
  }
  const avisos: string[] = [];
  if (lanzadores.length === 0) avisos.push('No marcaste quién lanzó.');
  else if (resultado === 'gano' && !vistas.has('ganado')) avisos.push('Falta marcar al pitcher ganador.');
  else if (resultado === 'perdio' && !vistas.has('perdido')) avisos.push('Falta marcar al pitcher perdedor.');
  return { errores, avisos };
}

export type JugadorDeHoja = { jugadorId: number; nombre: string };

const NUMERO = /^\d+$/;
const DECIMAL = /^-?\d*[.,]\d+$|^#/;
const SIGLA_A_COLUMNA = new Map(COLUMNAS_HOJA.map((c) => [SIGLAS_HOJA[c], c]));

function buscarJugador(nombre: string, jugadores: { jugadorId: number; palabras: string[]; slug: string }[]) {
  const slug = crearSlug(nombre);
  const exactos = jugadores.filter((j) => j.slug === slug);
  if (exactos.length === 1) return exactos[0].jugadorId;
  if (exactos.length > 1) return null;
  const palabras = slug.split('-').filter(Boolean);
  if (palabras.length < 2) return null;
  const parecidos = jugadores.filter((j) => palabras.every((p) => j.palabras.includes(p)) || j.palabras.every((p) => palabras.includes(p)));
  return parecidos.length === 1 ? parecidos[0].jugadorId : null;
}

function partirLinea(linea: string) {
  if (linea.includes('\t')) return linea.split('\t').map((c) => c.trim());
  const piezas = linea.trim().split(/\s+/);
  const primerNumero = piezas.findIndex((p) => NUMERO.test(p) || DECIMAL.test(p));
  if (primerNumero === -1) return [piezas.join(' ')];
  return [piezas.slice(0, primerNumero).join(' '), ...piezas.slice(primerNumero)];
}

export function interpretarPegado(texto: string, plantilla: JugadorDeHoja[]) {
  const jugadores = plantilla.map((j) => {
    const slug = crearSlug(j.nombre);
    return { jugadorId: j.jugadorId, slug, palabras: slug.split('-').filter(Boolean) };
  });
  const celdas = new Map<number, CeldasHoja>();
  const errores: string[] = [];
  let columnas: (ColumnaHoja | null)[] = [...COLUMNAS_HOJA];

  for (const [indice, cruda] of texto.replace(/\r/g, '').split('\n').entries()) {
    if (!cruda.trim()) continue;
    const [primera = '', ...resto] = partirLinea(cruda);
    const etiqueta = primera.replace(/:$/, '').trim().toUpperCase();
    if (etiqueta.startsWith('TOTAL')) continue;
    if (etiqueta === 'NOMBRE' || etiqueta === 'JUGADOR') {
      const delEncabezado = resto.map((sigla) => SIGLA_A_COLUMNA.get(sigla.toUpperCase()) ?? null);
      if (delEncabezado.some(Boolean)) columnas = delEncabezado;
      continue;
    }
    const nombre = primera.replace(/\(\s*total\s*\)\s*$/i, '').trim();
    if (!nombre) {
      errores.push(`Línea ${indice + 1}: falta el nombre.`);
      continue;
    }
    const jugadorId = buscarJugador(nombre, jugadores);
    if (jugadorId === null) {
      errores.push(`Línea ${indice + 1}: «${nombre}» no está en la plantilla o hay más de uno parecido.`);
      continue;
    }
    if (celdas.has(jugadorId)) {
      errores.push(`Línea ${indice + 1}: «${nombre}» viene dos veces.`);
      continue;
    }
    const fila = celdasVacias();
    columnas.forEach((columna, i) => {
      const valor = resto[i] ?? '';
      if (columna && NUMERO.test(valor)) fila[columna] = String(Number(valor));
    });
    celdas.set(jugadorId, fila);
  }
  return { celdas, errores };
}

export type EstadoHoja = 'pendiente' | 'capturada' | 'sin_numeros';

export type JuegoConHojas = {
  juegoId: number;
  jornada: number;
  hojaLocal: EstadoHoja;
  hojaVisitante: EstadoHoja;
};

export function avanceDeHojas(juegos: JuegoConHojas[]) {
  const estados = juegos.flatMap((j) => [j.hojaLocal, j.hojaVisitante]);
  const capturadas = estados.filter((e) => e === 'capturada').length;
  const pendientes = estados.filter((e) => e === 'pendiente').length;
  return { capturadas, pendientes, esperadas: capturadas + pendientes };
}

export function avancePorJornada<T extends JuegoConHojas>(juegos: T[]) {
  const jornadas = new Map<number, T[]>();
  for (const juego of juegos) jornadas.set(juego.jornada, [...(jornadas.get(juego.jornada) ?? []), juego]);
  return [...jornadas.entries()].sort(([a], [b]) => a - b).map(([numero, propios]) => ({ numero, juegos: propios, ...avanceDeHojas(propios) }));
}
