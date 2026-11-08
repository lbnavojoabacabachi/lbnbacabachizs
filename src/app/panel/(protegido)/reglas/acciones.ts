'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/conexion';
import { ajustesTabla, equipos, reglasTemporada } from '@/db/esquema';
import { accionConFormulario, accionDirecta, anotar, ErrorPanel } from '@/lib/panel/acciones';
import { casilla, entero, id, textoRequerido } from '@/lib/panel/campos';
import { CRITERIOS } from '@/lib/panel/catalogos';

const criterio = z.preprocess((v) => (v === '' ? undefined : v), z.enum(CRITERIOS).optional());

const esquemaReglas = z.object({
  temporadaId: id,
  juegosPorEncuentro: entero(1, 3, 'los juegos por encuentro'),
  forfeitCarrerasGanador: entero(0, 30, 'las carreras del ganador por forfeit'),
  forfeitCarrerasPerdedor: entero(0, 30, 'las carreras del perdedor por forfeit'),
  forfeitCuentaCarreras: casilla,
  permiteEmpates: casilla,
  criterio1: criterio,
  criterio2: criterio,
  criterio3: criterio,
  criterio4: criterio,
});

export const guardarReglas = accionConFormulario(esquemaReglas, async (datos, contexto) => {
  if (datos.forfeitCarrerasGanador <= datos.forfeitCarrerasPerdedor) {
    throw new ErrorPanel('En un forfeit, el ganador debe tener más carreras que el perdedor.', {
      forfeitCarrerasGanador: 'Debe ser mayor que las del perdedor.',
    });
  }
  const criterios = [datos.criterio1, datos.criterio2, datos.criterio3, datos.criterio4].filter(
    (c, i, todos): c is (typeof CRITERIOS)[number] => c !== undefined && todos.indexOf(c) === i,
  );
  if (criterios.length === 0) throw new ErrorPanel('Elige al menos un criterio de desempate.', { criterio1: 'Elige un criterio.' });
  const valores = {
    juegosPorEncuentro: datos.juegosPorEncuentro,
    forfeitCarrerasGanador: datos.forfeitCarrerasGanador,
    forfeitCarrerasPerdedor: datos.forfeitCarrerasPerdedor,
    forfeitCuentaCarreras: datos.forfeitCuentaCarreras,
    permiteEmpates: datos.permiteEmpates,
    criteriosDesempate: criterios,
  };
  await db
    .insert(reglasTemporada)
    .values({ temporadaId: datos.temporadaId, ...valores })
    .onConflictDoUpdate({ target: reglasTemporada.temporadaId, set: valores });
  await anotar(contexto, 'editar', 'reglas', datos.temporadaId, 'Cambió las reglas de la tabla', valores);
  return 'Reglas guardadas. La tabla de posiciones ya se calcula con ellas.';
});

const esquemaAjuste = z.object({
  temporadaId: id,
  equipoId: id,
  ganados: entero(-20, 20, 'los ganados'),
  perdidos: entero(-20, 20, 'los perdidos'),
  motivo: textoRequerido('el motivo', 300),
});

export const agregarAjuste = accionConFormulario(esquemaAjuste, async (datos, contexto) => {
  if (datos.ganados === 0 && datos.perdidos === 0) {
    throw new ErrorPanel('El ajuste debe sumar o restar al menos un juego.', { ganados: 'Escribe cuántos ganados suma o resta.' });
  }
  const [equipo] = await db.select({ nombre: equipos.nombre }).from(equipos).where(eq(equipos.id, datos.equipoId));
  if (!equipo) throw new ErrorPanel('El equipo ya no existe.');
  const [creado] = await db.insert(ajustesTabla).values({ ...datos, creadoPorId: contexto.usuarioId }).returning();
  await anotar(contexto, 'crear', 'ajuste_tabla', creado.id, `Ajustó la tabla de ${equipo.nombre}: ${datos.motivo}`, datos);
  return `Ajuste a ${equipo.nombre} guardado.`;
});

export async function eliminarAjuste(ajusteId: number) {
  return accionDirecta(async (contexto) => {
    const valor = id.parse(ajusteId);
    const [ajuste] = await db.select().from(ajustesTabla).where(eq(ajustesTabla.id, valor));
    if (!ajuste) throw new ErrorPanel('El ajuste ya no existe.');
    await db.delete(ajustesTabla).where(eq(ajustesTabla.id, valor));
    await anotar(contexto, 'eliminar', 'ajuste_tabla', valor, `Quitó un ajuste de la tabla: ${ajuste.motivo}`, ajuste);
    return 'Ajuste eliminado.';
  });
}
