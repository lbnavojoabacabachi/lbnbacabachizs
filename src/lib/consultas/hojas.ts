import { and, asc, count, eq, inArray, notInArray, sql } from 'drizzle-orm';
import { alias, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { cache } from 'react';
import { db } from '@/db/conexion';
import {
  encuentros,
  equipos,
  estadisticasBateo,
  estadisticasPitcheo,
  hojasAnotacion,
  jornadas,
  juegos,
  jugadores,
  lineasBateo,
  lineasPitcheo,
  plantillas,
  temporadas,
} from '@/db/esquema';
import type { TotalBateo } from '@/lib/estadisticas';
import { COLUMNAS_HOJA, type ConteosHoja, type Decision, type EstadoHoja } from '@/lib/hojas';

const local = alias(equipos, 'local');
const visitante = alias(equipos, 'visitante');

export type ModoDeEstadisticas = 'juegos' | 'totales';

export const modoDeEstadisticas = cache(async (temporadaId: number): Promise<ModoDeEstadisticas> => {
  const [bateo, pitcheo] = await Promise.all([
    db.$count(estadisticasBateo, eq(estadisticasBateo.temporadaId, temporadaId)),
    db.$count(estadisticasPitcheo, eq(estadisticasPitcheo.temporadaId, temporadaId)),
  ]);
  return bateo + pitcheo > 0 ? 'totales' : 'juegos';
});

export const juegosConHojas = cache(async (temporadaId: number) => {
  const filas = await db
    .select({
      juegoId: juegos.id,
      numero: juegos.numero,
      carrerasLocal: juegos.carrerasLocal,
      carrerasVisitante: juegos.carrerasVisitante,
      jornada: jornadas.numero,
      fecha: jornadas.fecha,
      localId: encuentros.localId,
      visitanteId: encuentros.visitanteId,
      local: local.nombre,
      visitante: visitante.nombre,
    })
    .from(juegos)
    .innerJoin(encuentros, eq(juegos.encuentroId, encuentros.id))
    .innerJoin(jornadas, eq(encuentros.jornadaId, jornadas.id))
    .innerJoin(local, eq(encuentros.localId, local.id))
    .innerJoin(visitante, eq(encuentros.visitanteId, visitante.id))
    .where(and(eq(jornadas.temporadaId, temporadaId), eq(juegos.estado, 'jugado')))
    .orderBy(asc(jornadas.numero), asc(encuentros.orden), asc(encuentros.id), asc(juegos.numero));
  if (filas.length === 0) return [];
  const hojas = await db
    .select({ juegoId: hojasAnotacion.juegoId, equipoId: hojasAnotacion.equipoId, sinNumeros: hojasAnotacion.sinNumeros })
    .from(hojasAnotacion)
    .where(
      inArray(
        hojasAnotacion.juegoId,
        filas.map((f) => f.juegoId),
      ),
    );
  const estados = new Map(hojas.map((h) => [`${h.juegoId}-${h.equipoId}`, h.sinNumeros ? 'sin_numeros' : 'capturada'] as const));
  const estadoDe = (juegoId: number, equipoId: number): EstadoHoja => estados.get(`${juegoId}-${equipoId}`) ?? 'pendiente';
  return filas.map((f) => ({ ...f, hojaLocal: estadoDe(f.juegoId, f.localId), hojaVisitante: estadoDe(f.juegoId, f.visitanteId) }));
});

export async function hojasEsperadasAlCierre(temporadaId: number) {
  const [[porJugar], [sinNumeros]] = await Promise.all([
    db
      .select({ total: count() })
      .from(juegos)
      .innerJoin(encuentros, eq(juegos.encuentroId, encuentros.id))
      .innerJoin(jornadas, eq(encuentros.jornadaId, jornadas.id))
      .where(and(eq(jornadas.temporadaId, temporadaId), notInArray(juegos.estado, ['forfeit', 'cancelado']))),
    db
      .select({ total: count() })
      .from(hojasAnotacion)
      .innerJoin(juegos, eq(hojasAnotacion.juegoId, juegos.id))
      .innerJoin(encuentros, eq(juegos.encuentroId, encuentros.id))
      .innerJoin(jornadas, eq(encuentros.jornadaId, jornadas.id))
      .where(and(eq(jornadas.temporadaId, temporadaId), eq(juegos.estado, 'jugado'), eq(hojasAnotacion.sinNumeros, true))),
  ]);
  return Math.max(0, porJugar.total * 2 - sinNumeros.total);
}

export async function temporadaTieneHojas(temporadaId: number) {
  const [fila] = await db
    .select({ total: count() })
    .from(hojasAnotacion)
    .innerJoin(juegos, eq(hojasAnotacion.juegoId, juegos.id))
    .innerJoin(encuentros, eq(juegos.encuentroId, encuentros.id))
    .innerJoin(jornadas, eq(encuentros.jornadaId, jornadas.id))
    .where(eq(jornadas.temporadaId, temporadaId));
  return fila.total > 0;
}

export async function juegoParaHoja(juegoId: number, equipoId: number) {
  const [fila] = await db
    .select({
      juegoId: juegos.id,
      numero: juegos.numero,
      estado: juegos.estado,
      carrerasLocal: juegos.carrerasLocal,
      carrerasVisitante: juegos.carrerasVisitante,
      jornada: jornadas.numero,
      fecha: jornadas.fecha,
      temporadaId: jornadas.temporadaId,
      temporada: temporadas.nombre,
      localId: encuentros.localId,
      visitanteId: encuentros.visitanteId,
      local: local.nombre,
      visitante: visitante.nombre,
    })
    .from(juegos)
    .innerJoin(encuentros, eq(juegos.encuentroId, encuentros.id))
    .innerJoin(jornadas, eq(encuentros.jornadaId, jornadas.id))
    .innerJoin(temporadas, eq(jornadas.temporadaId, temporadas.id))
    .innerJoin(local, eq(encuentros.localId, local.id))
    .innerJoin(visitante, eq(encuentros.visitanteId, visitante.id))
    .where(eq(juegos.id, juegoId));
  if (!fila || (equipoId !== fila.localId && equipoId !== fila.visitanteId)) return null;
  if (fila.estado !== 'jugado' || fila.carrerasLocal === null || fila.carrerasVisitante === null) return null;
  const esLocal = equipoId === fila.localId;
  return {
    juegoId: fila.juegoId,
    numero: fila.numero,
    jornada: fila.jornada,
    fecha: fila.fecha,
    temporadaId: fila.temporadaId,
    temporada: fila.temporada,
    equipo: { id: equipoId, nombre: esLocal ? fila.local : fila.visitante, carreras: esLocal ? fila.carrerasLocal : fila.carrerasVisitante },
    rival: {
      id: esLocal ? fila.visitanteId : fila.localId,
      nombre: esLocal ? fila.visitante : fila.local,
      carreras: esLocal ? fila.carrerasVisitante : fila.carrerasLocal,
    },
  };
}

export async function plantillaParaHoja(temporadaId: number, equipoId: number) {
  const filas = await db
    .select({ jugadorId: plantillas.jugadorId, nombre: jugadores.nombre, numero: plantillas.numero, baja: plantillas.baja })
    .from(plantillas)
    .innerJoin(jugadores, eq(plantillas.jugadorId, jugadores.id))
    .where(and(eq(plantillas.temporadaId, temporadaId), eq(plantillas.equipoId, equipoId)));
  return filas.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

export async function hojaGuardada(juegoId: number, equipoId: number) {
  const [hoja] = await db
    .select()
    .from(hojasAnotacion)
    .where(and(eq(hojasAnotacion.juegoId, juegoId), eq(hojasAnotacion.equipoId, equipoId)));
  if (!hoja) return null;
  const [bateo, pitcheo] = await Promise.all([
    db.select().from(lineasBateo).where(eq(lineasBateo.hojaId, hoja.id)),
    db.select().from(lineasPitcheo).where(eq(lineasPitcheo.hojaId, hoja.id)),
  ]);
  return {
    id: hoja.id,
    sinNumeros: hoja.sinNumeros,
    actualizadoEn: hoja.actualizadoEn,
    bateo: new Map(bateo.map((l) => [l.jugadorId, Object.fromEntries(COLUMNAS_HOJA.map((c) => [c, l[c]])) as ConteosHoja])),
    pitcheo: new Map(pitcheo.map((l) => [l.jugadorId, (l.decision ?? 'lanzo') as Decision | 'lanzo'])),
  };
}

const deTemporadaJugado = (temporadaId: number) => and(eq(jornadas.temporadaId, temporadaId), eq(juegos.estado, 'jugado'));

const suma = (columna: AnyPgColumn) => sql<number>`coalesce(sum(${columna}), 0)::int`;

export async function totalesDeBateo(temporadaId: number): Promise<TotalBateo[]> {
  return db
    .select({
      equipoId: hojasAnotacion.equipoId,
      jugadorId: lineasBateo.jugadorId,
      nombre: jugadores.nombre,
      ultimaJornada: sql<number>`max(${jornadas.numero})::int`,
      juegos: count(),
      apariciones: suma(lineasBateo.apariciones),
      vecesAlBat: suma(lineasBateo.vecesAlBat),
      hits: suma(lineasBateo.hits),
      sencillos: suma(lineasBateo.sencillos),
      dobles: suma(lineasBateo.dobles),
      triples: suma(lineasBateo.triples),
      jonrones: suma(lineasBateo.jonrones),
      ponches: suma(lineasBateo.ponches),
      basesPorBolas: suma(lineasBateo.basesPorBolas),
      intencionales: suma(lineasBateo.intencionales),
      golpeados: suma(lineasBateo.golpeados),
    })
    .from(lineasBateo)
    .innerJoin(hojasAnotacion, eq(lineasBateo.hojaId, hojasAnotacion.id))
    .innerJoin(juegos, eq(hojasAnotacion.juegoId, juegos.id))
    .innerJoin(encuentros, eq(juegos.encuentroId, encuentros.id))
    .innerJoin(jornadas, eq(encuentros.jornadaId, jornadas.id))
    .innerJoin(jugadores, eq(lineasBateo.jugadorId, jugadores.id))
    .where(deTemporadaJugado(temporadaId))
    .groupBy(hojasAnotacion.equipoId, lineasBateo.jugadorId, jugadores.nombre);
}

const decisiones = (decision: Decision) => sql<number>`(count(*) filter (where ${lineasPitcheo.decision} = ${decision}))::int`;

export async function totalesDePitcheo(temporadaId: number) {
  const filas = await db
    .select({
      equipoId: hojasAnotacion.equipoId,
      jugadorId: lineasPitcheo.jugadorId,
      nombre: jugadores.nombre,
      ultimaJornada: sql<number>`max(${jornadas.numero})::int`,
      juegos: count(),
      ganados: decisiones('ganado'),
      perdidos: decisiones('perdido'),
      salvados: decisiones('salvado'),
    })
    .from(lineasPitcheo)
    .innerJoin(hojasAnotacion, eq(lineasPitcheo.hojaId, hojasAnotacion.id))
    .innerJoin(juegos, eq(hojasAnotacion.juegoId, juegos.id))
    .innerJoin(encuentros, eq(juegos.encuentroId, encuentros.id))
    .innerJoin(jornadas, eq(encuentros.jornadaId, jornadas.id))
    .innerJoin(jugadores, eq(lineasPitcheo.jugadorId, jugadores.id))
    .where(deTemporadaJugado(temporadaId))
    .groupBy(hojasAnotacion.equipoId, lineasPitcheo.jugadorId, jugadores.nombre);
  return filas.sort((a, b) => a.equipoId - b.equipoId || a.nombre.localeCompare(b.nombre, 'es'));
}

export async function hojasConJugador(temporadaId: number, equipoId: number, jugadorId: number) {
  const deEseEquipo = and(eq(jornadas.temporadaId, temporadaId), eq(hojasAnotacion.equipoId, equipoId));
  const [[bateo], [pitcheo]] = await Promise.all([
    db
      .select({ total: count() })
      .from(lineasBateo)
      .innerJoin(hojasAnotacion, eq(lineasBateo.hojaId, hojasAnotacion.id))
      .innerJoin(juegos, eq(hojasAnotacion.juegoId, juegos.id))
      .innerJoin(encuentros, eq(juegos.encuentroId, encuentros.id))
      .innerJoin(jornadas, eq(encuentros.jornadaId, jornadas.id))
      .where(and(deEseEquipo, eq(lineasBateo.jugadorId, jugadorId))),
    db
      .select({ total: count() })
      .from(lineasPitcheo)
      .innerJoin(hojasAnotacion, eq(lineasPitcheo.hojaId, hojasAnotacion.id))
      .innerJoin(juegos, eq(hojasAnotacion.juegoId, juegos.id))
      .innerJoin(encuentros, eq(juegos.encuentroId, encuentros.id))
      .innerJoin(jornadas, eq(encuentros.jornadaId, jornadas.id))
      .where(and(deEseEquipo, eq(lineasPitcheo.jugadorId, jugadorId))),
  ]);
  return Math.max(bateo.total, pitcheo.total);
}
