'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/conexion';
import { encuentros, jornadas, juegos, reglasTemporada } from '@/db/esquema';
import { accionConFormulario, anotar, ErrorPanel } from '@/lib/panel/acciones';
import { id } from '@/lib/panel/campos';
import { interpretarCaptura, type JuegoGuardado } from '@/lib/panel/resultados';

const esquema = z.object({
  jornadaId: id,
  juegos: z.union([id, z.array(id)]).transform((v) => (Array.isArray(v) ? v : [v])),
});

export const guardarResultados = accionConFormulario(esquema, async (datos, contexto, formulario) => {
  const [jornada] = await db.select().from(jornadas).where(eq(jornadas.id, datos.jornadaId));
  if (!jornada) throw new ErrorPanel('La jornada ya no existe.');
  const [reglas] = await db.select().from(reglasTemporada).where(eq(reglasTemporada.temporadaId, jornada.temporadaId));
  const filas = await db
    .select({ juego: juegos, localId: encuentros.localId, visitanteId: encuentros.visitanteId })
    .from(juegos)
    .innerJoin(encuentros, eq(juegos.encuentroId, encuentros.id))
    .where(and(inArray(juegos.id, datos.juegos), eq(encuentros.jornadaId, jornada.id)));
  if (filas.length !== datos.juegos.length) throw new ErrorPanel('El calendario cambió mientras capturabas. Recarga la página.');

  const errores: Record<string, string> = {};
  const cambios: { id: number; juego: JuegoGuardado }[] = [];
  for (const fila of filas) {
    const prefijo = `j-${fila.juego.id}`;
    const texto = (campo: string) => String(formulario.get(`${prefijo}-${campo}`) ?? '');
    const resultado = interpretarCaptura(
      {
        visita: texto('visita'),
        local: texto('local'),
        estado: texto('estado'),
        cuenta: formulario.get(`${prefijo}-cuenta`) === 'on',
        nota: texto('nota'),
      },
      { localId: fila.localId, visitanteId: fila.visitanteId },
      reglas?.permiteEmpates ?? true,
    );
    if (resultado.errores) {
      for (const [campo, mensaje] of Object.entries(resultado.errores)) errores[`${prefijo}-${campo}`] = mensaje;
      continue;
    }
    cambios.push({ id: fila.juego.id, juego: resultado.juego });
  }
  if (Object.keys(errores).length > 0) {
    throw new ErrorPanel(`Hay ${Object.keys(errores).length === 1 ? 'un dato' : 'datos'} por corregir: ${Object.values(errores)[0]}`, errores);
  }

  await db.transaction(async (tx) => {
    for (const cambio of cambios) await tx.update(juegos).set(cambio.juego).where(eq(juegos.id, cambio.id));
  });
  await anotar(contexto, 'capturar_resultados', 'jornada', jornada.id, `Guardó los resultados de la jornada ${jornada.numero}`, cambios);
  return `Resultados de la jornada ${jornada.numero} guardados y publicados.`;
});
