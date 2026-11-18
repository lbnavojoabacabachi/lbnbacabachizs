import { and, asc, desc, eq, or, sql } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/db/conexion';
import { encuentros, estadisticasBateo, estadisticasPitcheo, hojasAnotacion, jornadas, juegos, reglasTemporada, temporadas } from '@/db/esquema';
import { filasDeBateoPorJuego, minimoProrrateado, type FilaBateo, type FilaPitcheo } from '@/lib/estadisticas';
import { avanceDeHojas } from '@/lib/hojas';
import { hojasEsperadasAlCierre, juegosConHojas, modoDeEstadisticas, totalesDeBateo, totalesDePitcheo } from './hojas';
import { obtenerEquipos } from './liga';

const b = estadisticasBateo;
const p = estadisticasPitcheo;

const columnasBateo = {
  equipoId: b.equipoId,
  nombre: b.nombre,
  acumulado: b.acumulado,
  juegos: b.juegos,
  apariciones: b.apariciones,
  vecesAlBat: b.vecesAlBat,
  hits: b.hits,
  sencillos: b.sencillos,
  dobles: b.dobles,
  triples: b.triples,
  jonrones: b.jonrones,
  ponches: b.ponches,
  basesPorBolas: b.basesPorBolas,
  intencionales: b.intencionales,
  golpeados: b.golpeados,
};

const columnasPitcheo = {
  equipoId: p.equipoId,
  nombre: p.nombre,
  juegos: p.juegos,
  ganados: p.ganados,
  perdidos: p.perdidos,
  salvados: p.salvados,
};

export const obtenerTemporadaConEstadisticas = cache(async () => {
  const [temporada] = await db
    .select({ id: temporadas.id, nombre: temporadas.nombre, vigente: temporadas.vigente })
    .from(temporadas)
    .where(
      or(
        sql`exists (select 1 from ${b} where ${b.temporadaId} = ${temporadas.id})`,
        sql`exists (select 1 from ${p} where ${p.temporadaId} = ${temporadas.id})`,
        sql`exists (select 1 from ${hojasAnotacion} inner join ${juegos} on ${juegos.id} = ${hojasAnotacion.juegoId} inner join ${encuentros} on ${encuentros.id} = ${juegos.encuentroId} inner join ${jornadas} on ${jornadas.id} = ${encuentros.jornadaId} where ${jornadas.temporadaId} = ${temporadas.id} and ${juegos.estado} = 'jugado' and not ${hojasAnotacion.sinNumeros})`,
      ),
    )
    .orderBy(desc(temporadas.inicio))
    .limit(1);
  return temporada ?? null;
});

export function obtenerFilasDeBateo(temporadaId: number, equipoId?: number) {
  return db
    .select(columnasBateo)
    .from(b)
    .where(and(eq(b.temporadaId, temporadaId), equipoId === undefined ? undefined : eq(b.equipoId, equipoId)))
    .orderBy(asc(b.equipoId), asc(b.orden));
}

export function obtenerFilasDePitcheo(temporadaId: number, equipoId?: number) {
  return db
    .select(columnasPitcheo)
    .from(p)
    .where(and(eq(p.temporadaId, temporadaId), equipoId === undefined ? undefined : eq(p.equipoId, equipoId)))
    .orderBy(asc(p.equipoId), asc(p.orden));
}

export async function obtenerMinimoApariciones(temporadaId: number) {
  const [fila] = await db.select({ minimo: reglasTemporada.minimoApariciones }).from(reglasTemporada).where(eq(reglasTemporada.temporadaId, temporadaId));
  return fila?.minimo ?? 70;
}

type BateoDeEquipo = FilaBateo & { equipoId: number };
type PitcheoDeEquipo = FilaPitcheo & { equipoId: number };

async function filasPorJuego(temporadaId: number) {
  const [bateo, pitcheo, jugados, esperadas] = await Promise.all([
    totalesDeBateo(temporadaId),
    totalesDePitcheo(temporadaId),
    juegosConHojas(temporadaId),
    hojasEsperadasAlCierre(temporadaId),
  ]);
  return { bateo: filasDeBateoPorJuego(bateo), pitcheo, capturadas: avanceDeHojas(jugados).capturadas, esperadas };
}

export const obtenerEstadisticas = cache(async (temporadaId: number) => {
  const [equipos, modo, minimoAlCierre] = await Promise.all([
    obtenerEquipos(temporadaId),
    modoDeEstadisticas(temporadaId),
    obtenerMinimoApariciones(temporadaId),
  ]);
  let bateo: BateoDeEquipo[];
  let pitcheo: PitcheoDeEquipo[];
  let minimoApariciones = minimoAlCierre;
  if (modo === 'juegos') {
    const porJuego = await filasPorJuego(temporadaId);
    bateo = porJuego.bateo;
    pitcheo = porJuego.pitcheo;
    minimoApariciones = minimoProrrateado(minimoAlCierre, porJuego.capturadas, porJuego.esperadas);
  } else {
    [bateo, pitcheo] = await Promise.all([obtenerFilasDeBateo(temporadaId), obtenerFilasDePitcheo(temporadaId)]);
  }
  return {
    modo,
    minimoApariciones,
    minimoAlCierre,
    bateo,
    pitcheo,
    equipos: equipos
      .map((e) => ({ ...e, bateo: bateo.filter((f) => f.equipoId === e.id), pitcheo: pitcheo.filter((f) => f.equipoId === e.id) }))
      .filter((e) => e.bateo.length > 0 || e.pitcheo.length > 0),
  };
});
