import { and, asc, eq, inArray } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '@/db/conexion';
import { encuentros, equipos, jornadas, juegos } from '@/db/esquema';

const local = alias(equipos, 'local');
const visitante = alias(equipos, 'visitante');

export async function jornadasConAvance(temporadaId: number) {
  const filas = await db.select().from(jornadas).where(eq(jornadas.temporadaId, temporadaId)).orderBy(asc(jornadas.numero));
  if (filas.length === 0) return [];
  const juegosDeTemporada = await db
    .select({ jornadaId: encuentros.jornadaId, estado: juegos.estado })
    .from(juegos)
    .innerJoin(encuentros, eq(juegos.encuentroId, encuentros.id))
    .where(
      inArray(
        encuentros.jornadaId,
        filas.map((j) => j.id),
      ),
    );
  return filas.map((j) => {
    const propios = juegosDeTemporada.filter((g) => g.jornadaId === j.id);
    return {
      ...j,
      juegos: propios.length,
      capturados: propios.filter((g) => g.estado !== 'programado').length,
    };
  });
}

export async function jornadaParaCaptura(temporadaId: number, numero: number) {
  const [jornada] = await db
    .select()
    .from(jornadas)
    .where(and(eq(jornadas.temporadaId, temporadaId), eq(jornadas.numero, numero)));
  if (!jornada) return null;
  const filas = await db
    .select({
      id: encuentros.id,
      orden: encuentros.orden,
      localId: encuentros.localId,
      visitanteId: encuentros.visitanteId,
      hora: encuentros.hora,
      sede: encuentros.sede,
      local: local.nombre,
      visitante: visitante.nombre,
    })
    .from(encuentros)
    .innerJoin(local, eq(encuentros.localId, local.id))
    .innerJoin(visitante, eq(encuentros.visitanteId, visitante.id))
    .where(eq(encuentros.jornadaId, jornada.id))
    .orderBy(asc(encuentros.orden), asc(encuentros.id));
  const listaJuegos = filas.length
    ? await db
        .select()
        .from(juegos)
        .where(
          inArray(
            juegos.encuentroId,
            filas.map((e) => e.id),
          ),
        )
        .orderBy(asc(juegos.numero))
    : [];
  return {
    jornada,
    encuentros: filas.map((e) => ({ ...e, juegos: listaJuegos.filter((g) => g.encuentroId === e.id) })),
  };
}
