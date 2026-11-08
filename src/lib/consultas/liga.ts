import { and, asc, desc, eq, inArray, isNotNull, or } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/db/conexion';
import {
  ajustesTabla,
  cuerpoTecnico,
  encuentros,
  equipos,
  imagenes,
  jornadas,
  jugadores,
  juegos,
  plantillas,
  reglasTemporada,
  temporadaEquipos,
  temporadas,
} from '@/db/esquema';
import type { ImagenPublica } from '@/lib/imagenes/tamanos';
import { resultadoDeJuego, type ResultadoJuego } from '@/lib/jornadas';
import { columnasImagen } from './comunes';

export type Equipo = {
  id: number;
  nombre: string;
  nombreCorto: string;
  slug: string;
  poblado: string | null;
  logo: ImagenPublica | null;
};

export type Encuentro = {
  id: number;
  orden: number;
  sede: string | null;
  hora: string | null;
  local: Equipo;
  visitante: Equipo;
  juegos: ResultadoJuego[];
};

export type Jornada = {
  id: number;
  numero: number;
  fecha: string | null;
  vuelta: number | null;
  nota: string | null;
  descansa: Equipo | null;
  encuentros: Encuentro[];
};

export const obtenerTemporadaVigente = cache(async () => {
  const [temporada] = await db
    .select({ id: temporadas.id, nombre: temporadas.nombre, estado: temporadas.estado, inicio: temporadas.inicio, fin: temporadas.fin })
    .from(temporadas)
    .where(eq(temporadas.vigente, true))
    .limit(1);
  return temporada ?? null;
});

export const obtenerReglas = cache(async (temporadaId: number) => {
  const [reglas] = await db.select().from(reglasTemporada).where(eq(reglasTemporada.temporadaId, temporadaId));
  return reglas ?? { forfeitCarrerasGanador: 7, forfeitCarrerasPerdedor: 0, forfeitCuentaCarreras: false, criteriosDesempate: ['ave'] };
});

export const obtenerEquipos = cache(async (temporadaId: number): Promise<Equipo[]> => {
  const filas = await db
    .select({
      id: equipos.id,
      nombre: equipos.nombre,
      nombreCorto: equipos.nombreCorto,
      slug: equipos.slug,
      poblado: equipos.poblado,
      logo: columnasImagen,
    })
    .from(temporadaEquipos)
    .innerJoin(equipos, eq(temporadaEquipos.equipoId, equipos.id))
    .leftJoin(imagenes, eq(equipos.logoId, imagenes.id))
    .where(eq(temporadaEquipos.temporadaId, temporadaId))
    .orderBy(asc(equipos.nombre));
  return filas;
});

export const obtenerCalendario = cache(async (temporadaId: number): Promise<Jornada[]> => {
  const [listaEquipos, reglas, filasJornadas] = await Promise.all([
    obtenerEquipos(temporadaId),
    obtenerReglas(temporadaId),
    db.select().from(jornadas).where(eq(jornadas.temporadaId, temporadaId)).orderBy(asc(jornadas.numero)),
  ]);
  const idsJornada = filasJornadas.map((j) => j.id);
  if (idsJornada.length === 0) return [];

  const filasEncuentros = await db
    .select()
    .from(encuentros)
    .where(inArray(encuentros.jornadaId, idsJornada))
    .orderBy(asc(encuentros.orden), asc(encuentros.id));
  const filasJuegos = filasEncuentros.length
    ? await db
        .select()
        .from(juegos)
        .where(
          inArray(
            juegos.encuentroId,
            filasEncuentros.map((e) => e.id),
          ),
        )
        .orderBy(asc(juegos.numero))
    : [];

  const porId = new Map(listaEquipos.map((e) => [e.id, e]));
  const equipoDe = (id: number): Equipo =>
    porId.get(id) ?? { id, nombre: 'Equipo', nombreCorto: '', slug: '', poblado: null, logo: null };

  return filasJornadas.map((jornada) => ({
    id: jornada.id,
    numero: jornada.numero,
    fecha: jornada.fecha,
    vuelta: jornada.vuelta,
    nota: jornada.nota,
    descansa: jornada.equipoDescansaId ? equipoDe(jornada.equipoDescansaId) : null,
    encuentros: filasEncuentros
      .filter((e) => e.jornadaId === jornada.id)
      .map((e) => ({
        id: e.id,
        orden: e.orden,
        sede: e.sede,
        hora: e.hora,
        local: equipoDe(e.localId),
        visitante: equipoDe(e.visitanteId),
        juegos: filasJuegos.filter((g) => g.encuentroId === e.id).map((g) => resultadoDeJuego(g, e.localId, reglas)),
      })),
  }));
});

export const obtenerAjustes = cache(async (temporadaId: number) =>
  db
    .select({ equipo: equipos.nombre, ganados: ajustesTabla.ganados, perdidos: ajustesTabla.perdidos, motivo: ajustesTabla.motivo })
    .from(ajustesTabla)
    .innerJoin(equipos, eq(ajustesTabla.equipoId, equipos.id))
    .where(eq(ajustesTabla.temporadaId, temporadaId))
    .orderBy(asc(ajustesTabla.creadoEn)),
);

export const obtenerPlantilla = cache(async (temporadaId: number, equipoId: number) =>
  db
    .select({
      id: plantillas.id,
      nombre: jugadores.nombre,
      numero: plantillas.numero,
      categoria: plantillas.categoria,
      baja: plantillas.baja,
    })
    .from(plantillas)
    .innerJoin(jugadores, eq(plantillas.jugadorId, jugadores.id))
    .where(and(eq(plantillas.temporadaId, temporadaId), eq(plantillas.equipoId, equipoId)))
    .orderBy(asc(plantillas.numero), asc(jugadores.nombre)),
);

export const obtenerCuerpoTecnico = cache(async (temporadaId: number, equipoId: number) =>
  db
    .select({ id: cuerpoTecnico.id, puesto: cuerpoTecnico.puesto, nombre: cuerpoTecnico.nombre })
    .from(cuerpoTecnico)
    .where(and(eq(cuerpoTecnico.temporadaId, temporadaId), eq(cuerpoTecnico.equipoId, equipoId))),
);

export const obtenerMovimientos = cache(async (temporadaId: number) =>
  db
    .select({
      id: plantillas.id,
      nombre: jugadores.nombre,
      numero: plantillas.numero,
      categoria: plantillas.categoria,
      alta: plantillas.alta,
      baja: plantillas.baja,
      equipo: equipos.nombre,
      equipoSlug: equipos.slug,
    })
    .from(plantillas)
    .innerJoin(jugadores, eq(plantillas.jugadorId, jugadores.id))
    .innerJoin(equipos, eq(plantillas.equipoId, equipos.id))
    .where(and(eq(plantillas.temporadaId, temporadaId), or(isNotNull(plantillas.alta), isNotNull(plantillas.baja))))
    .orderBy(desc(plantillas.actualizadoEn)),
);
