export type EstadoJuegoTabla = 'programado' | 'jugado' | 'forfeit' | 'suspendido' | 'pospuesto' | 'cancelado';

export type EquipoTabla = { id: number; nombre: string };

export type JuegoTabla = {
  localId: number;
  visitanteId: number;
  estado: EstadoJuegoTabla;
  carrerasLocal: number | null;
  carrerasVisitante: number | null;
  forfeitPierdeId: number | null;
  cuentaParaTabla: boolean;
};

export type ReglasTabla = {
  forfeitCarrerasGanador: number;
  forfeitCarrerasPerdedor: number;
  forfeitCuentaCarreras: boolean;
  criteriosDesempate: string[];
};

export type AjusteTabla = { equipoId: number; ganados: number; perdidos: number };

export type FilaPosiciones = {
  posicion: number;
  equipoId: number;
  nombre: string;
  jj: number;
  jg: number;
  jp: number;
  je: number;
  cf: number;
  cc: number;
  dif: number;
  ave: number;
};

type Acumulado = Omit<FilaPosiciones, 'posicion' | 'jj' | 'dif' | 'ave'>;

const COMPARADORES: Record<string, (a: FilaPosiciones, b: FilaPosiciones) => number> = {
  ave: (a, b) => b.ave - a.ave,
  diferencia_carreras: (a, b) => b.dif - a.dif,
  carreras_favor: (a, b) => b.cf - a.cf,
  carreras_contra: (a, b) => a.cc - b.cc,
  ganados: (a, b) => b.jg - a.jg,
};

export function calcularPosiciones(
  equipos: EquipoTabla[],
  juegos: JuegoTabla[],
  reglas: ReglasTabla,
  ajustes: AjusteTabla[] = [],
): FilaPosiciones[] {
  const acumulados = new Map<number, Acumulado>(
    equipos.map((e) => [e.id, { equipoId: e.id, nombre: e.nombre, jg: 0, jp: 0, je: 0, cf: 0, cc: 0 }]),
  );
  const sumar = (equipoId: number, cambio: Partial<Acumulado>) => {
    const fila = acumulados.get(equipoId);
    if (!fila) return;
    fila.jg += cambio.jg ?? 0;
    fila.jp += cambio.jp ?? 0;
    fila.je += cambio.je ?? 0;
    fila.cf += cambio.cf ?? 0;
    fila.cc += cambio.cc ?? 0;
  };

  for (const juego of juegos) {
    if (!juego.cuentaParaTabla) continue;
    if (juego.estado === 'forfeit' && juego.forfeitPierdeId !== null) {
      const perdedor = juego.forfeitPierdeId;
      const ganador = perdedor === juego.localId ? juego.visitanteId : juego.localId;
      const carreras = reglas.forfeitCuentaCarreras;
      sumar(ganador, { jg: 1, cf: carreras ? reglas.forfeitCarrerasGanador : 0, cc: carreras ? reglas.forfeitCarrerasPerdedor : 0 });
      sumar(perdedor, { jp: 1, cf: carreras ? reglas.forfeitCarrerasPerdedor : 0, cc: carreras ? reglas.forfeitCarrerasGanador : 0 });
      continue;
    }
    if (juego.estado !== 'jugado' || juego.carrerasLocal === null || juego.carrerasVisitante === null) continue;
    const local = juego.carrerasLocal;
    const visita = juego.carrerasVisitante;
    const resultadoLocal = local > visita ? { jg: 1 } : local < visita ? { jp: 1 } : { je: 1 };
    const resultadoVisita = local > visita ? { jp: 1 } : local < visita ? { jg: 1 } : { je: 1 };
    sumar(juego.localId, { ...resultadoLocal, cf: local, cc: visita });
    sumar(juego.visitanteId, { ...resultadoVisita, cf: visita, cc: local });
  }

  for (const ajuste of ajustes) sumar(ajuste.equipoId, { jg: ajuste.ganados, jp: ajuste.perdidos });

  const filas: FilaPosiciones[] = [...acumulados.values()].map((a) => {
    const decididos = a.jg + a.jp;
    return { ...a, posicion: 0, jj: a.jg + a.jp + a.je, dif: a.cf - a.cc, ave: decididos > 0 ? a.jg / decididos : 0 };
  });

  const criterios = reglas.criteriosDesempate.map((c) => COMPARADORES[c]).filter(Boolean);
  filas.sort((a, b) => {
    for (const comparar of criterios) {
      const resultado = comparar(a, b);
      if (resultado !== 0) return resultado;
    }
    return a.nombre.localeCompare(b.nombre, 'es-MX');
  });
  filas.forEach((f, i) => {
    f.posicion = i + 1;
  });
  return filas;
}

export function formatearAve(ave: number) {
  return ave.toFixed(3).replace(/^0/, '');
}
