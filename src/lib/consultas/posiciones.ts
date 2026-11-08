import { asc, eq } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/db/conexion';
import { ajustesTabla, encuentros, equipos, jornadas, juegos, reglasTemporada, temporadaEquipos } from '@/db/esquema';
import { calcularRachas, type Racha } from '@/lib/jornadas';
import { calcularPosiciones, type FilaPosiciones } from '@/lib/posiciones';

export type FilaConRacha = FilaPosiciones & { racha: Racha | null };

export const obtenerPosiciones = cache(async (temporadaId: number): Promise<FilaConRacha[]> => {
  const [reglas] = await db.select().from(reglasTemporada).where(eq(reglasTemporada.temporadaId, temporadaId));
  if (!reglas) return [];

  const [equiposTemporada, juegosTemporada, ajustes] = await Promise.all([
    db
      .select({ id: equipos.id, nombre: equipos.nombre })
      .from(temporadaEquipos)
      .innerJoin(equipos, eq(temporadaEquipos.equipoId, equipos.id))
      .where(eq(temporadaEquipos.temporadaId, temporadaId)),
    db
      .select({
        localId: encuentros.localId,
        visitanteId: encuentros.visitanteId,
        estado: juegos.estado,
        carrerasLocal: juegos.carrerasLocal,
        carrerasVisitante: juegos.carrerasVisitante,
        forfeitPierdeId: juegos.forfeitPierdeId,
        cuentaParaTabla: juegos.cuentaParaTabla,
      })
      .from(juegos)
      .innerJoin(encuentros, eq(juegos.encuentroId, encuentros.id))
      .innerJoin(jornadas, eq(encuentros.jornadaId, jornadas.id))
      .where(eq(jornadas.temporadaId, temporadaId))
      .orderBy(asc(jornadas.numero), asc(encuentros.orden), asc(juegos.numero)),
    db
      .select({ equipoId: ajustesTabla.equipoId, ganados: ajustesTabla.ganados, perdidos: ajustesTabla.perdidos })
      .from(ajustesTabla)
      .where(eq(ajustesTabla.temporadaId, temporadaId)),
  ]);

  const rachas = calcularRachas(juegosTemporada);
  return calcularPosiciones(equiposTemporada, juegosTemporada, reglas, ajustes).map((fila) => ({
    ...fila,
    racha: rachas.get(fila.equipoId) ?? null,
  }));
});
