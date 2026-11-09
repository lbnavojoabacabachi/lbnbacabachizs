'use server';

import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/conexion';
import { equipos, estadisticasBateo, estadisticasPitcheo, reglasTemporada, temporadaEquipos, temporadas } from '@/db/esquema';
import { interpretarBateo, interpretarPitcheo } from '@/lib/estadisticas';
import { accionConFormulario, anotar, ErrorPanel } from '@/lib/panel/acciones';
import { entero, id } from '@/lib/panel/campos';

const esquemaTabla = z.object({
  temporadaId: id,
  equipoId: id,
  filas: z.string().max(40000, 'El texto es demasiado largo.').default(''),
});

async function participacion(temporadaId: number, equipoId: number) {
  const [fila] = await db
    .select({ temporada: temporadas.nombre, equipo: equipos.nombre })
    .from(temporadaEquipos)
    .innerJoin(temporadas, eq(temporadaEquipos.temporadaId, temporadas.id))
    .innerJoin(equipos, eq(temporadaEquipos.equipoId, equipos.id))
    .where(and(eq(temporadaEquipos.temporadaId, temporadaId), eq(temporadaEquipos.equipoId, equipoId)));
  if (!fila) throw new ErrorPanel('Ese equipo no participa en esa temporada.');
  return fila;
}

function errorDeFilas(errores: string[]) {
  const resumen = errores.length === 1 ? 'Hay un problema' : `Hay ${errores.length} problemas`;
  const detalle = errores.slice(0, 4).join(' ') + (errores.length > 4 ? ' …' : '');
  return new ErrorPanel(`${resumen} y no se guardó nada. ${detalle}`, { filas: errores[0] });
}

export const guardarBateo = accionConFormulario(esquemaTabla, async (datos, contexto) => {
  const { temporada, equipo } = await participacion(datos.temporadaId, datos.equipoId);
  const { filas, errores } = interpretarBateo(datos.filas);
  if (errores.length > 0) throw errorDeFilas(errores);
  const deEsteEquipo = and(eq(estadisticasBateo.temporadaId, datos.temporadaId), eq(estadisticasBateo.equipoId, datos.equipoId));
  await db.transaction(async (tx) => {
    await tx.delete(estadisticasBateo).where(deEsteEquipo);
    if (filas.length > 0) {
      await tx.insert(estadisticasBateo).values(filas.map((f, orden) => ({ ...f, orden, temporadaId: datos.temporadaId, equipoId: datos.equipoId })));
    }
  });
  await anotar(contexto, 'editar', 'estadisticas', `${datos.temporadaId}-${datos.equipoId}`, `Actualizó el bateo de ${equipo} en la temporada ${temporada} (${filas.length} filas)`);
  return filas.length > 0 ? `Bateo guardado: ${filas.length} filas.` : 'Se borró el bateo de este equipo.';
});

export const guardarPitcheo = accionConFormulario(esquemaTabla, async (datos, contexto) => {
  const { temporada, equipo } = await participacion(datos.temporadaId, datos.equipoId);
  const { filas, errores } = interpretarPitcheo(datos.filas);
  if (errores.length > 0) throw errorDeFilas(errores);
  const deEsteEquipo = and(eq(estadisticasPitcheo.temporadaId, datos.temporadaId), eq(estadisticasPitcheo.equipoId, datos.equipoId));
  await db.transaction(async (tx) => {
    await tx.delete(estadisticasPitcheo).where(deEsteEquipo);
    if (filas.length > 0) {
      await tx.insert(estadisticasPitcheo).values(filas.map((f, orden) => ({ ...f, orden, temporadaId: datos.temporadaId, equipoId: datos.equipoId })));
    }
  });
  await anotar(contexto, 'editar', 'estadisticas', `${datos.temporadaId}-${datos.equipoId}`, `Actualizó el pitcheo de ${equipo} en la temporada ${temporada} (${filas.length} filas)`);
  return filas.length > 0 ? `Pitcheo guardado: ${filas.length} filas.` : 'Se borró el pitcheo de este equipo.';
});

export const guardarMinimoApariciones = accionConFormulario(
  z.object({ temporadaId: id, minimoApariciones: entero(0, 999, 'el mínimo de apariciones') }),
  async (datos, contexto) => {
    const [temporada] = await db.select({ nombre: temporadas.nombre }).from(temporadas).where(eq(temporadas.id, datos.temporadaId));
    if (!temporada) throw new ErrorPanel('La temporada ya no existe.');
    await db
      .insert(reglasTemporada)
      .values({ temporadaId: datos.temporadaId, minimoApariciones: datos.minimoApariciones })
      .onConflictDoUpdate({ target: reglasTemporada.temporadaId, set: { minimoApariciones: datos.minimoApariciones } });
    await anotar(contexto, 'editar', 'reglas', datos.temporadaId, `Puso ${datos.minimoApariciones} apariciones como mínimo para el título de bateo de ${temporada.nombre}`);
    return 'Mínimo guardado.';
  },
);
