import { capitalizar, formatearFecha } from './fechas';
import type { EstadoJuegoTabla, JuegoTabla, ReglasTabla } from './posiciones';

export type JuegoDeEncuentro = {
  numero: number;
  estado: EstadoJuegoTabla;
  carrerasLocal: number | null;
  carrerasVisitante: number | null;
  forfeitPierdeId: number | null;
  cuentaParaTabla: boolean;
  notaPublica: string | null;
};

export type Lado = 'local' | 'visitante';

export type ResultadoJuego = {
  numero: number;
  estado: EstadoJuegoTabla;
  local: number | null;
  visitante: number | null;
  ganador: Lado | 'empate' | null;
  forfeitDe: Lado | null;
  cuentaParaTabla: boolean;
  notaPublica: string | null;
};

const DECIDIDOS = new Set<EstadoJuegoTabla>(['jugado', 'forfeit']);

export function resultadoDeJuego(
  juego: JuegoDeEncuentro,
  localId: number,
  reglas: Pick<ReglasTabla, 'forfeitCarrerasGanador' | 'forfeitCarrerasPerdedor'>,
): ResultadoJuego {
  const base = {
    numero: juego.numero,
    estado: juego.estado,
    cuentaParaTabla: juego.cuentaParaTabla,
    notaPublica: juego.notaPublica,
  };
  if (juego.estado === 'forfeit' && juego.forfeitPierdeId !== null) {
    const pierdeLocal = juego.forfeitPierdeId === localId;
    return {
      ...base,
      local: pierdeLocal ? reglas.forfeitCarrerasPerdedor : reglas.forfeitCarrerasGanador,
      visitante: pierdeLocal ? reglas.forfeitCarrerasGanador : reglas.forfeitCarrerasPerdedor,
      ganador: pierdeLocal ? 'visitante' : 'local',
      forfeitDe: pierdeLocal ? 'local' : 'visitante',
    };
  }
  if (juego.estado === 'jugado' && juego.carrerasLocal !== null && juego.carrerasVisitante !== null) {
    const local = juego.carrerasLocal;
    const visitante = juego.carrerasVisitante;
    return {
      ...base,
      local,
      visitante,
      ganador: local > visitante ? 'local' : local < visitante ? 'visitante' : 'empate',
      forfeitDe: null,
    };
  }
  return { ...base, local: null, visitante: null, ganador: null, forfeitDe: null };
}

export function juegoDecidido(juego: { estado: EstadoJuegoTabla }) {
  return DECIDIDOS.has(juego.estado);
}

export type JornadaParaResumen = {
  numero: number;
  fecha: string | null;
  encuentros: { juegos: { estado: EstadoJuegoTabla }[] }[];
};

export function jornadaConResultados(jornada: JornadaParaResumen) {
  return jornada.encuentros.some((e) => e.juegos.some(juegoDecidido));
}

export function resumirJornadas<T extends JornadaParaResumen>(jornadas: T[], hoy: string) {
  const ordenadas = [...jornadas].sort((a, b) => a.numero - b.numero);
  const jugadas = ordenadas.filter(jornadaConResultados);
  const ultima = jugadas.at(-1) ?? null;
  const siguiente = ordenadas.find((j) => (ultima ? j.numero > ultima.numero : true)) ?? null;
  const siguientePorPublicar = Boolean(siguiente?.fecha && siguiente.fecha < hoy);
  return { ultima, siguiente, siguientePorPublicar };
}

export type Racha = { resultado: 'G' | 'P' | 'E'; cuenta: number };

export function calcularRachas(juegosEnOrden: JuegoTabla[]) {
  const rachas = new Map<number, Racha>();
  const anotar = (equipoId: number, resultado: Racha['resultado']) => {
    const actual = rachas.get(equipoId);
    rachas.set(
      equipoId,
      actual && actual.resultado === resultado ? { resultado, cuenta: actual.cuenta + 1 } : { resultado, cuenta: 1 },
    );
  };
  for (const juego of juegosEnOrden) {
    if (!juego.cuentaParaTabla) continue;
    if (juego.estado === 'forfeit' && juego.forfeitPierdeId !== null) {
      const ganador = juego.forfeitPierdeId === juego.localId ? juego.visitanteId : juego.localId;
      anotar(ganador, 'G');
      anotar(juego.forfeitPierdeId, 'P');
      continue;
    }
    if (juego.estado !== 'jugado' || juego.carrerasLocal === null || juego.carrerasVisitante === null) continue;
    if (juego.carrerasLocal === juego.carrerasVisitante) {
      anotar(juego.localId, 'E');
      anotar(juego.visitanteId, 'E');
      continue;
    }
    const ganaLocal = juego.carrerasLocal > juego.carrerasVisitante;
    anotar(juego.localId, ganaLocal ? 'G' : 'P');
    anotar(juego.visitanteId, ganaLocal ? 'P' : 'G');
  }
  return rachas;
}

const NOMBRES_RACHA = { G: ['ganado', 'ganados'], P: ['perdido', 'perdidos'], E: ['empate', 'empates'] } as const;

export function describirRacha(racha: Racha) {
  const [singular, plural] = NOMBRES_RACHA[racha.resultado];
  return racha.cuenta === 1 ? `1 ${singular}` : `${racha.cuenta} ${plural} seguidos`;
}

const VUELTAS: Record<number, string> = { 1: 'primera vuelta', 2: 'segunda vuelta' };

export function describirJornada(jornada: { fecha: string | null; vuelta: number | null }) {
  return [
    jornada.fecha ? capitalizar(formatearFecha(jornada.fecha)) : 'Fecha por confirmar',
    jornada.vuelta ? (VUELTAS[jornada.vuelta] ?? `vuelta ${jornada.vuelta}`) : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

type EncuentroConNombres = { local: { nombre: string }; visitante: { nombre: string }; juegos: ResultadoJuego[] };

export function resumenDeEncuentro(encuentro: EncuentroConNombres) {
  const marcadores = encuentro.juegos
    .filter((j) => j.local !== null && j.visitante !== null)
    .map((j) => `${j.visitante}-${j.local}`);
  if (marcadores.length === 0) return `${encuentro.visitante.nombre} en ${encuentro.local.nombre}`;
  return `${encuentro.visitante.nombre} ${marcadores.join(' y ')} ${encuentro.local.nombre}`;
}

export function resumenDeResultados(jornada: { encuentros: EncuentroConNombres[] }) {
  return jornada.encuentros.map(resumenDeEncuentro).join('; ');
}
