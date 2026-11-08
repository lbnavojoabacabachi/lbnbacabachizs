'use server';

import { and, eq, inArray, max, ne, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/conexion';
import { encuentros, jornadas, juegos, reglasTemporada, temporadaEquipos, temporadas } from '@/db/esquema';
import { accionConFormulario, accionDirecta, anotar, ErrorPanel } from '@/lib/panel/acciones';
import { casilla, entero, enteroOpcional, fecha, fechaOpcional, hora, id, idOpcional, textoOpcional, textoRequerido } from '@/lib/panel/campos';

const listaDeIds = z
  .union([id, z.array(id)])
  .optional()
  .transform((v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]));

const esquemaTemporada = z.object({
  nombre: textoRequerido('el nombre de la temporada', 40),
  inicio: fecha('la fecha de inicio'),
  fin: fechaOpcional('la fecha de fin'),
  equipos: listaDeIds,
  vigente: casilla,
});

export const crearTemporada = accionConFormulario(esquemaTemporada, async (datos, contexto) => {
  if (datos.equipos.length < 2) throw new ErrorPanel('Elige al menos dos equipos.', { equipos: 'Elige al menos dos equipos.' });
  const [repetida] = await db.select({ id: temporadas.id }).from(temporadas).where(eq(temporadas.nombre, datos.nombre));
  if (repetida) throw new ErrorPanel('Ya existe una temporada con ese nombre.', { nombre: 'Ya existe una temporada con ese nombre.' });
  const nueva = await db.transaction(async (tx) => {
    const [anterior] = await tx.select().from(temporadas).where(eq(temporadas.vigente, true));
    const [reglasAnteriores] = anterior
      ? await tx.select().from(reglasTemporada).where(eq(reglasTemporada.temporadaId, anterior.id))
      : [];
    if (datos.vigente) await tx.update(temporadas).set({ vigente: false }).where(eq(temporadas.vigente, true));
    const [creada] = await tx
      .insert(temporadas)
      .values({ nombre: datos.nombre, inicio: datos.inicio, fin: datos.fin, vigente: datos.vigente, estado: 'preparacion' })
      .returning();
    await tx.insert(temporadaEquipos).values(datos.equipos.map((equipoId) => ({ temporadaId: creada.id, equipoId })));
    await tx.insert(reglasTemporada).values({
      temporadaId: creada.id,
      ...(reglasAnteriores
        ? {
            juegosPorEncuentro: reglasAnteriores.juegosPorEncuentro,
            forfeitCarrerasGanador: reglasAnteriores.forfeitCarrerasGanador,
            forfeitCarrerasPerdedor: reglasAnteriores.forfeitCarrerasPerdedor,
            forfeitCuentaCarreras: reglasAnteriores.forfeitCuentaCarreras,
            permiteEmpates: reglasAnteriores.permiteEmpates,
            criteriosDesempate: reglasAnteriores.criteriosDesempate,
          }
        : {}),
    });
    return creada;
  });
  await anotar(contexto, 'crear', 'temporada', nueva.id, `Creó la temporada ${nueva.nombre}`, datos);
  return `Temporada ${nueva.nombre} creada${datos.vigente ? ' y marcada como vigente' : ''}.`;
});

const ESTADOS_TEMPORADA = ['preparacion', 'regular', 'postemporada', 'terminada'] as const;

const esquemaDatosTemporada = z.object({
  id,
  inicio: fecha('la fecha de inicio'),
  fin: fechaOpcional('la fecha de fin'),
  estado: z.enum(ESTADOS_TEMPORADA, { error: 'Elige el estado de la temporada.' }),
  equipos: listaDeIds,
});

export const guardarTemporada = accionConFormulario(esquemaDatosTemporada, async (datos, contexto) => {
  if (datos.equipos.length < 2) throw new ErrorPanel('Elige al menos dos equipos.', { equipos: 'Elige al menos dos equipos.' });
  const [temporada] = await db.select().from(temporadas).where(eq(temporadas.id, datos.id));
  if (!temporada) throw new ErrorPanel('La temporada ya no existe.');
  const actuales = await db.select({ equipoId: temporadaEquipos.equipoId }).from(temporadaEquipos).where(eq(temporadaEquipos.temporadaId, datos.id));
  const quitados = actuales.map((a) => a.equipoId).filter((e) => !datos.equipos.includes(e));
  if (quitados.length > 0) {
    const [usado] = await db
      .select({ id: encuentros.id })
      .from(encuentros)
      .innerJoin(jornadas, eq(encuentros.jornadaId, jornadas.id))
      .where(and(eq(jornadas.temporadaId, datos.id), or(inArray(encuentros.localId, quitados), inArray(encuentros.visitanteId, quitados))))
      .limit(1);
    if (usado) throw new ErrorPanel('No se puede quitar un equipo que ya tiene encuentros en el calendario.');
  }
  await db.transaction(async (tx) => {
    await tx.update(temporadas).set({ inicio: datos.inicio, fin: datos.fin, estado: datos.estado }).where(eq(temporadas.id, datos.id));
    await tx.delete(temporadaEquipos).where(eq(temporadaEquipos.temporadaId, datos.id));
    await tx.insert(temporadaEquipos).values(datos.equipos.map((equipoId) => ({ temporadaId: datos.id, equipoId })));
  });
  await anotar(contexto, 'editar', 'temporada', datos.id, `Editó la temporada ${temporada.nombre}`, datos);
  return 'Temporada guardada.';
});

export async function marcarVigente(temporadaId: number) {
  return accionDirecta(async (contexto) => {
    const valor = id.parse(temporadaId);
    const [temporada] = await db.select().from(temporadas).where(eq(temporadas.id, valor));
    if (!temporada) throw new ErrorPanel('La temporada ya no existe.');
    await db.transaction(async (tx) => {
      await tx.update(temporadas).set({ vigente: false }).where(ne(temporadas.id, valor));
      await tx.update(temporadas).set({ vigente: true }).where(eq(temporadas.id, valor));
    });
    await anotar(contexto, 'vigente', 'temporada', valor, `Marcó la temporada ${temporada.nombre} como vigente`);
    return `La temporada ${temporada.nombre} es la vigente.`;
  });
}

const esquemaJornada = z.object({
  temporadaId: id,
  numero: entero(1, 99, 'el número de jornada'),
  fecha: fechaOpcional(),
  vuelta: enteroOpcional(1, 9, 'la vuelta'),
  descansaId: idOpcional,
  nota: textoOpcional(200),
});

export const crearJornada = accionConFormulario(esquemaJornada, async (datos, contexto) => {
  const [repetida] = await db
    .select({ id: jornadas.id })
    .from(jornadas)
    .where(and(eq(jornadas.temporadaId, datos.temporadaId), eq(jornadas.numero, datos.numero)));
  if (repetida) throw new ErrorPanel(`Ya existe la jornada ${datos.numero}.`, { numero: 'Ese número ya está ocupado.' });
  const [creada] = await db
    .insert(jornadas)
    .values({ ...datos, equipoDescansaId: datos.descansaId })
    .returning();
  await anotar(contexto, 'crear', 'jornada', creada.id, `Agregó la jornada ${creada.numero}`, datos);
  return `Jornada ${creada.numero} agregada. Ahora agrégale sus encuentros.`;
});

const esquemaEditarJornada = esquemaJornada.omit({ temporadaId: true, numero: true }).extend({ id });

export const guardarJornada = accionConFormulario(esquemaEditarJornada, async (datos, contexto) => {
  const [jornada] = await db.select().from(jornadas).where(eq(jornadas.id, datos.id));
  if (!jornada) throw new ErrorPanel('La jornada ya no existe.');
  if (datos.descansaId) {
    const [juega] = await db
      .select({ id: encuentros.id })
      .from(encuentros)
      .where(and(eq(encuentros.jornadaId, datos.id), or(eq(encuentros.localId, datos.descansaId), eq(encuentros.visitanteId, datos.descansaId))));
    if (juega) throw new ErrorPanel('Ese equipo juega en esta jornada, no puede descansar.', { descansaId: 'Ese equipo tiene un encuentro en esta jornada.' });
  }
  await db
    .update(jornadas)
    .set({ fecha: datos.fecha, vuelta: datos.vuelta, equipoDescansaId: datos.descansaId, nota: datos.nota })
    .where(eq(jornadas.id, datos.id));
  await anotar(contexto, 'editar', 'jornada', datos.id, `Editó la jornada ${jornada.numero}`, datos);
  return 'Jornada guardada.';
});

async function juegosConResultado(condicion: ReturnType<typeof eq>) {
  const [fila] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(juegos)
    .innerJoin(encuentros, eq(juegos.encuentroId, encuentros.id))
    .where(and(condicion, ne(juegos.estado, 'programado')));
  return fila?.total ?? 0;
}

export async function eliminarJornada(jornadaId: number) {
  return accionDirecta(async (contexto) => {
    const valor = id.parse(jornadaId);
    const [jornada] = await db.select().from(jornadas).where(eq(jornadas.id, valor));
    if (!jornada) throw new ErrorPanel('La jornada ya no existe.');
    if ((await juegosConResultado(eq(encuentros.jornadaId, valor))) > 0) {
      throw new ErrorPanel('La jornada tiene resultados capturados. Bórralos primero en Resultados (pon los juegos como "Por jugar").');
    }
    await db.delete(jornadas).where(eq(jornadas.id, valor));
    await anotar(contexto, 'eliminar', 'jornada', valor, `Eliminó la jornada ${jornada.numero}`);
    return `Jornada ${jornada.numero} eliminada.`;
  });
}

const esquemaEncuentro = z.object({
  visitanteId: id,
  localId: id,
  hora,
  sede: textoOpcional(120),
  juegos: entero(1, 3, 'el número de juegos'),
});

async function validarEncuentro(jornadaId: number, datos: z.infer<typeof esquemaEncuentro>, encuentroId: number | null) {
  if (datos.visitanteId === datos.localId) {
    throw new ErrorPanel('La visita y el local deben ser equipos distintos.', { localId: 'Elige un equipo distinto de la visita.' });
  }
  const [jornada] = await db.select().from(jornadas).where(eq(jornadas.id, jornadaId));
  if (!jornada) throw new ErrorPanel('La jornada ya no existe.');
  if (jornada.equipoDescansaId && [datos.visitanteId, datos.localId].includes(jornada.equipoDescansaId)) {
    throw new ErrorPanel('Uno de los equipos descansa en esta jornada.');
  }
  const ocupados = await db
    .select({ id: encuentros.id })
    .from(encuentros)
    .where(
      and(
        eq(encuentros.jornadaId, jornadaId),
        encuentroId ? ne(encuentros.id, encuentroId) : undefined,
        or(
          inArray(encuentros.localId, [datos.visitanteId, datos.localId]),
          inArray(encuentros.visitanteId, [datos.visitanteId, datos.localId]),
        ),
      ),
    );
  if (ocupados.length > 0) throw new ErrorPanel('Uno de los equipos ya tiene otro encuentro en esta jornada.');
  return jornada;
}

export const agregarEncuentro = accionConFormulario(esquemaEncuentro.extend({ jornadaId: id }), async (datos, contexto) => {
  const jornada = await validarEncuentro(datos.jornadaId, datos, null);
  const [ultimo] = await db.select({ orden: max(encuentros.orden) }).from(encuentros).where(eq(encuentros.jornadaId, jornada.id));
  const creado = await db.transaction(async (tx) => {
    const [nuevo] = await tx
      .insert(encuentros)
      .values({
        jornadaId: jornada.id,
        visitanteId: datos.visitanteId,
        localId: datos.localId,
        hora: datos.hora,
        sede: datos.sede,
        orden: (ultimo?.orden ?? -1) + 1,
      })
      .returning();
    await tx.insert(juegos).values(Array.from({ length: datos.juegos }, (_, i) => ({ encuentroId: nuevo.id, numero: i + 1 })));
    return nuevo;
  });
  await anotar(contexto, 'crear', 'encuentro', creado.id, `Agregó un encuentro a la jornada ${jornada.numero}`, datos);
  return 'Encuentro agregado.';
});

export const guardarEncuentro = accionConFormulario(esquemaEncuentro.extend({ id }), async (datos, contexto) => {
  const [encuentro] = await db.select().from(encuentros).where(eq(encuentros.id, datos.id));
  if (!encuentro) throw new ErrorPanel('El encuentro ya no existe.');
  const jornada = await validarEncuentro(encuentro.jornadaId, datos, encuentro.id);
  const actuales = await db.select().from(juegos).where(eq(juegos.encuentroId, encuentro.id));
  const sobrantes = actuales.filter((g) => g.numero > datos.juegos);
  if (sobrantes.some((g) => g.estado !== 'programado')) {
    throw new ErrorPanel('No se puede quitar un juego que ya tiene resultado.', { juegos: 'Ese juego ya tiene resultado.' });
  }
  const cambiaronEquipos = encuentro.localId !== datos.localId || encuentro.visitanteId !== datos.visitanteId;
  if (cambiaronEquipos && actuales.some((g) => g.estado !== 'programado')) {
    throw new ErrorPanel('No se pueden cambiar los equipos de un encuentro con resultados.');
  }
  await db.transaction(async (tx) => {
    await tx
      .update(encuentros)
      .set({ visitanteId: datos.visitanteId, localId: datos.localId, hora: datos.hora, sede: datos.sede })
      .where(eq(encuentros.id, encuentro.id));
    if (sobrantes.length > 0) await tx.delete(juegos).where(inArray(juegos.id, sobrantes.map((g) => g.id)));
    const faltantes = Array.from({ length: datos.juegos }, (_, i) => i + 1).filter((n) => !actuales.some((g) => g.numero === n));
    if (faltantes.length > 0) await tx.insert(juegos).values(faltantes.map((numero) => ({ encuentroId: encuentro.id, numero })));
  });
  await anotar(contexto, 'editar', 'encuentro', encuentro.id, `Editó un encuentro de la jornada ${jornada.numero}`, datos);
  return 'Encuentro guardado.';
});

export async function eliminarEncuentro(encuentroId: number) {
  return accionDirecta(async (contexto) => {
    const valor = id.parse(encuentroId);
    const [encuentro] = await db.select().from(encuentros).where(eq(encuentros.id, valor));
    if (!encuentro) throw new ErrorPanel('El encuentro ya no existe.');
    if ((await juegosConResultado(eq(encuentros.id, valor))) > 0) {
      throw new ErrorPanel('El encuentro tiene resultados capturados; no se puede borrar.');
    }
    await db.delete(encuentros).where(eq(encuentros.id, valor));
    await anotar(contexto, 'eliminar', 'encuentro', valor, 'Eliminó un encuentro');
    return 'Encuentro eliminado.';
  });
}
