import type { EstadoJuegoTabla } from '@/lib/posiciones';

export const ESTADOS_CAPTURA = [
  { valor: 'programado', texto: 'Por jugar' },
  { valor: 'jugado', texto: 'Se jugó' },
  { valor: 'forfeit_visitante', texto: 'Forfeit: no se presentó la visita' },
  { valor: 'forfeit_local', texto: 'Forfeit: no se presentó el local' },
  { valor: 'suspendido', texto: 'Suspendido' },
  { valor: 'pospuesto', texto: 'Pospuesto' },
  { valor: 'cancelado', texto: 'Cancelado' },
] as const;

export type EstadoCaptura = (typeof ESTADOS_CAPTURA)[number]['valor'];

export type CapturaJuego = {
  visita: string;
  local: string;
  estado: string;
  cuenta: boolean;
  nota: string;
};

export type JuegoGuardado = {
  estado: EstadoJuegoTabla;
  carrerasLocal: number | null;
  carrerasVisitante: number | null;
  forfeitPierdeId: number | null;
  cuentaParaTabla: boolean;
  notaPublica: string | null;
};

type Errores = Partial<Record<'visita' | 'local' | 'estado' | 'nota', string>>;

const MAXIMO_CARRERAS = 99;

function leerCarreras(texto: string): number | null | 'invalido' {
  const limpio = texto.trim();
  if (limpio === '') return null;
  if (!/^\d{1,2}$/.test(limpio)) return 'invalido';
  const valor = Number(limpio);
  return valor <= MAXIMO_CARRERAS ? valor : 'invalido';
}

export function estadoParaCaptura(juego: { estado: EstadoJuegoTabla; forfeitPierdeId: number | null }, localId: number): EstadoCaptura {
  if (juego.estado === 'forfeit') return juego.forfeitPierdeId === localId ? 'forfeit_local' : 'forfeit_visitante';
  return juego.estado;
}

export function interpretarCaptura(
  captura: CapturaJuego,
  equipos: { localId: number; visitanteId: number },
  permiteEmpates: boolean,
): { juego: JuegoGuardado; errores: null } | { juego: null; errores: Errores } {
  const errores: Errores = {};
  const visita = leerCarreras(captura.visita);
  const local = leerCarreras(captura.local);
  if (visita === 'invalido') errores.visita = `Escribe las carreras de la visita con un número de 0 a ${MAXIMO_CARRERAS}.`;
  if (local === 'invalido') errores.local = `Escribe las carreras del local con un número de 0 a ${MAXIMO_CARRERAS}.`;
  const nota = captura.nota.trim();
  if (nota.length > 200) errores.nota = 'La nota puede tener hasta 200 caracteres.';
  const valido = ESTADOS_CAPTURA.some((e) => e.valor === captura.estado);
  if (!valido) errores.estado = 'Elige cómo terminó el juego.';
  if (Object.keys(errores).length > 0 || visita === 'invalido' || local === 'invalido') return { juego: null, errores };

  let estado = captura.estado as EstadoCaptura;
  if (estado === 'programado' && (visita !== null || local !== null)) estado = 'jugado';

  const base = { cuentaParaTabla: captura.cuenta, notaPublica: nota === '' ? null : nota };

  if (estado === 'forfeit_visitante' || estado === 'forfeit_local') {
    return {
      juego: {
        ...base,
        estado: 'forfeit',
        carrerasLocal: null,
        carrerasVisitante: null,
        forfeitPierdeId: estado === 'forfeit_local' ? equipos.localId : equipos.visitanteId,
      },
      errores: null,
    };
  }

  if (estado === 'jugado') {
    if (visita === null) errores.visita = 'Escribe las carreras de la visita.';
    if (local === null) errores.local = 'Escribe las carreras del local.';
    if (visita !== null && local !== null && visita === local && !permiteEmpates) {
      errores.estado = 'Las reglas de la temporada no permiten empates. Revisa el marcador o cambia la regla.';
    }
    if (Object.keys(errores).length > 0) return { juego: null, errores };
    return { juego: { ...base, estado: 'jugado', carrerasLocal: local, carrerasVisitante: visita, forfeitPierdeId: null }, errores: null };
  }

  const ambas = visita !== null && local !== null;
  return {
    juego: {
      ...base,
      estado,
      carrerasLocal: ambas ? local : null,
      carrerasVisitante: ambas ? visita : null,
      forfeitPierdeId: null,
    },
    errores: null,
  };
}
