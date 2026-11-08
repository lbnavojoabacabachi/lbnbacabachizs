import { describe, expect, it } from 'vitest';
import { convertirEncuentros, leerLegado, posicionesSitioAnterior } from '../scripts/lib/legado';
import { calcularPosiciones, type JuegoTabla } from '@/lib/posiciones';

const datos = leerLegado('legado');

describe('datos del sitio anterior', () => {
  it('convierte todos los encuentros del rol con sus juegos', () => {
    const encuentros = convertirEncuentros(datos, 2);
    expect(encuentros).toHaveLength(72);
    const juegos = encuentros.flatMap((e) => e.juegos);
    expect(juegos.filter((j) => j.estado === 'forfeit')).toHaveLength(8);
    expect(encuentros.filter((e) => e.jornada === 2).every((e) => e.juegos.length === 1)).toBe(true);
    expect(encuentros.filter((e) => e.jornada >= 11).every((e) => e.juegos.every((j) => j.estado === 'programado'))).toBe(true);
  });

  it('la tabla nueva coincide con la del sitio anterior', () => {
    const ids = new Map(datos.equipos.map((e, i) => [e.name, i + 1]));
    const juegos: JuegoTabla[] = convertirEncuentros(datos, 2).flatMap((e) =>
      e.juegos.map((j) => ({
        localId: ids.get(e.local)!,
        visitanteId: ids.get(e.visitante)!,
        estado: j.estado,
        carrerasLocal: j.carrerasLocal,
        carrerasVisitante: j.carrerasVisitante,
        forfeitPierdeId: j.forfeitPierde ? ids.get(j.forfeitPierde)! : null,
        cuentaParaTabla: true,
      })),
    );
    const nueva = calcularPosiciones(
      datos.equipos.map((e, i) => ({ id: i + 1, nombre: e.name })),
      juegos,
      { forfeitCarrerasGanador: 7, forfeitCarrerasPerdedor: 0, forfeitCuentaCarreras: false, criteriosDesempate: ['ave', 'diferencia_carreras'] },
    );
    const anterior = posicionesSitioAnterior(datos);
    expect(nueva.map((f) => [f.nombre, f.jj, f.jg, f.jp, f.je, f.dif, f.ave.toFixed(3)])).toEqual(
      anterior.map((f) => [f.equipo, f.jj, f.jg, f.jp, f.je, f.dif, Number(f.ave).toFixed(3)]),
    );
    expect(nueva[0]).toMatchObject({ nombre: 'Guerreros de Chente Meza', jg: 13, jp: 4 });
  });
});
