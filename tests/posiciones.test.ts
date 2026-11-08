import { describe, expect, it } from 'vitest';
import { calcularPosiciones, formatearAve, type JuegoTabla, type ReglasTabla } from '@/lib/posiciones';

const EQUIPOS = [
  { id: 1, nombre: 'Astros' },
  { id: 2, nombre: 'Saneal' },
  { id: 3, nombre: 'Rojos de Bacabachi' },
];

const REGLAS: ReglasTabla = {
  forfeitCarrerasGanador: 7,
  forfeitCarrerasPerdedor: 0,
  forfeitCuentaCarreras: false,
  criteriosDesempate: ['ave', 'diferencia_carreras'],
};

const jugado = (localId: number, visitanteId: number, carrerasLocal: number, carrerasVisitante: number): JuegoTabla => ({
  localId,
  visitanteId,
  estado: 'jugado',
  carrerasLocal,
  carrerasVisitante,
  forfeitPierdeId: null,
  cuentaParaTabla: true,
});

describe('calcularPosiciones', () => {
  it('cuenta ganados, perdidos, carreras y ordena por porcentaje', () => {
    const tabla = calcularPosiciones(EQUIPOS, [jugado(1, 2, 5, 3), jugado(1, 2, 2, 4), jugado(3, 1, 1, 0)], REGLAS);
    expect(tabla.map((f) => [f.nombre, f.jj, f.jg, f.jp, f.cf, f.cc])).toEqual([
      ['Rojos de Bacabachi', 1, 1, 0, 1, 0],
      ['Saneal', 2, 1, 1, 7, 7],
      ['Astros', 3, 1, 2, 7, 8],
    ]);
  });

  it('el empate cuenta como jugado pero no entra al porcentaje', () => {
    const [astros] = calcularPosiciones(EQUIPOS, [jugado(1, 2, 4, 4), jugado(1, 3, 3, 1)], REGLAS);
    expect(astros).toMatchObject({ nombre: 'Astros', jj: 2, jg: 1, je: 1, ave: 1 });
    expect(formatearAve(astros.ave)).toBe('1.000');
  });

  it('el forfeit da el juego al rival y solo suma carreras si la regla lo dice', () => {
    const forfeit: JuegoTabla = { ...jugado(1, 2, 0, 0), estado: 'forfeit', carrerasLocal: null, carrerasVisitante: null, forfeitPierdeId: 1 };
    const sinCarreras = calcularPosiciones(EQUIPOS, [forfeit], REGLAS);
    expect(sinCarreras[0]).toMatchObject({ nombre: 'Saneal', jg: 1, cf: 0 });
    const conCarreras = calcularPosiciones(EQUIPOS, [forfeit], { ...REGLAS, forfeitCuentaCarreras: true });
    expect(conCarreras[0]).toMatchObject({ nombre: 'Saneal', jg: 1, cf: 7, cc: 0 });
    expect(conCarreras.find((f) => f.nombre === 'Astros')).toMatchObject({ jp: 1, cf: 0, cc: 7 });
  });

  it('ignora juegos que no cuentan, sin resultado o pendientes', () => {
    const juegos: JuegoTabla[] = [
      { ...jugado(1, 2, 9, 0), cuentaParaTabla: false },
      { ...jugado(1, 2, 0, 0), estado: 'programado', carrerasLocal: null, carrerasVisitante: null },
      { ...jugado(1, 2, 0, 0), estado: 'suspendido' },
    ];
    expect(calcularPosiciones(EQUIPOS, juegos, REGLAS).every((f) => f.jj === 0)).toBe(true);
  });

  it('aplica ajustes manuales y desempata por diferencia de carreras', () => {
    const tabla = calcularPosiciones(EQUIPOS, [jugado(1, 2, 10, 0), jugado(3, 2, 1, 0)], REGLAS, [
      { equipoId: 2, ganados: 0, perdidos: 1 },
    ]);
    expect(tabla.map((f) => f.nombre)).toEqual(['Astros', 'Rojos de Bacabachi', 'Saneal']);
    expect(tabla[2]).toMatchObject({ jj: 3, jp: 3 });
  });
});
