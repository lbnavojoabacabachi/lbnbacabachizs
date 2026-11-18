'use server';

import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/conexion';
import {
  equipos,
  estadisticasBateo,
  estadisticasPitcheo,
  hojasAnotacion,
  lineasBateo,
  lineasPitcheo,
  reglasTemporada,
  temporadaEquipos,
  temporadas,
} from '@/db/esquema';
import { hojaGuardada, juegoParaHoja, modoDeEstadisticas, plantillaParaHoja, temporadaTieneHojas } from '@/lib/consultas/hojas';
import { interpretarBateo, interpretarPitcheo } from '@/lib/estadisticas';
import {
  campoBateo,
  campoPitcheo,
  COLUMNAS_HOJA,
  interpretarLinea,
  interpretarPitcheoDeJuego,
  resultadoDelEquipo,
  validarPitcheo,
  type CeldasHoja,
  type ColumnaHoja,
  type ConteosHoja,
  type Pitcheo,
} from '@/lib/hojas';
import { accionConFormulario, accionDirecta, anotar, ErrorPanel, type Contexto } from '@/lib/panel/acciones';
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
  if (await temporadaTieneHojas(temporadaId)) {
    throw new ErrorPanel('Esta temporada ya se lleva juego por juego: los totales salen de las hojas capturadas.');
  }
  return fila;
}

function errorDeFilas(errores: string[]) {
  const resumen = errores.length === 1 ? 'Hay un problema' : `Hay ${errores.length} problemas`;
  const detalle = errores.slice(0, 4).join(' ') + (errores.length > 4 ? ' …' : '');
  return new ErrorPanel(`${resumen} y no se guardó nada. ${detalle}`, { filas: errores[0] });
}

export const guardarBateo = accionConFormulario(
  esquemaTabla,
  async (datos, contexto) => {
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
  },
  'compilador',
);

export const guardarPitcheo = accionConFormulario(
  esquemaTabla,
  async (datos, contexto) => {
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
  },
  'compilador',
);

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
  'compilador',
);

async function juegoDeHoja(juegoId: number, equipoId: number) {
  const juego = await juegoParaHoja(juegoId, equipoId);
  if (!juego) throw new ErrorPanel('Ese juego ya no está marcado como jugado. Revisa los resultados de la jornada.');
  if ((await modoDeEstadisticas(juego.temporadaId)) === 'totales') {
    throw new ErrorPanel(`La temporada ${juego.temporada} se lleva con los totales pegados por equipo. Bórralos para capturar juego por juego.`);
  }
  return juego;
}

type JuegoDeHoja = Awaited<ReturnType<typeof juegoDeHoja>>;

const describir = (juego: JuegoDeHoja) => `${juego.equipo.nombre}, juego ${juego.numero} de la jornada ${juego.jornada}`;

const plural = (cantidad: number, uno: string, varios: string) => `${cantidad} ${cantidad === 1 ? uno : varios}`;

export const guardarHoja = accionConFormulario(
  z.object({ juegoId: id, equipoId: id }),
  async (datos, contexto, formulario) => {
    const juego = await juegoDeHoja(datos.juegoId, datos.equipoId);
    const plantilla = await plantillaParaHoja(juego.temporadaId, datos.equipoId);
    const errores: Record<string, string> = {};
    const mensajes: string[] = [];
    const bateo: { jugadorId: number; conteos: ConteosHoja }[] = [];
    const lanzadores: { jugadorId: number; pitcheo: Pitcheo }[] = [];

    for (const jugador of plantilla) {
      const celdas = Object.fromEntries(
        COLUMNAS_HOJA.map((c) => [c, String(formulario.get(campoBateo(jugador.jugadorId, c)) ?? '')]),
      ) as CeldasHoja;
      const linea = interpretarLinea(celdas);
      for (const [columna, mensaje] of Object.entries(linea.errores)) {
        errores[campoBateo(jugador.jugadorId, columna as ColumnaHoja)] = mensaje;
        mensajes.push(`${jugador.nombre}: ${mensaje}`);
      }
      if (linea.conteos) bateo.push({ jugadorId: jugador.jugadorId, conteos: linea.conteos });
      const pitcheo = interpretarPitcheoDeJuego(String(formulario.get(campoPitcheo(jugador.jugadorId)) ?? ''));
      if (pitcheo === undefined) {
        errores[campoPitcheo(jugador.jugadorId)] = 'elige una opción de la lista.';
        mensajes.push(`${jugador.nombre}: elige una opción de pitcheo de la lista.`);
      } else if (pitcheo) lanzadores.push({ jugadorId: jugador.jugadorId, pitcheo });
    }

    const revision = validarPitcheo(lanzadores, resultadoDelEquipo(juego.equipo.carreras, juego.rival.carreras));
    for (const [jugadorId, mensaje] of Object.entries(revision.errores)) {
      const nombre = plantilla.find((j) => j.jugadorId === Number(jugadorId))?.nombre ?? 'Pitcher';
      errores[campoPitcheo(Number(jugadorId))] = mensaje;
      mensajes.push(`${nombre}: ${mensaje}`);
    }
    if (mensajes.length > 0) {
      const resumen = mensajes.length === 1 ? 'Hay un dato por corregir' : `Hay ${mensajes.length} datos por corregir`;
      throw new ErrorPanel(`${resumen} y no se guardó nada. ${mensajes.slice(0, 4).join(' ')}${mensajes.length > 4 ? ' …' : ''}`, errores);
    }
    if (bateo.length === 0 && lanzadores.length === 0) {
      throw new ErrorPanel('No capturaste a nadie. Si no existe la hoja de anotación de este juego, usa «No hay hoja de este juego».');
    }

    const hojaId = await db.transaction(async (tx) => {
      const [hoja] = await tx
        .insert(hojasAnotacion)
        .values({ juegoId: juego.juegoId, equipoId: datos.equipoId, sinNumeros: false, capturadaPorId: contexto.usuarioId })
        .onConflictDoUpdate({
          target: [hojasAnotacion.juegoId, hojasAnotacion.equipoId],
          set: { sinNumeros: false, capturadaPorId: contexto.usuarioId, actualizadoEn: new Date() },
        })
        .returning({ id: hojasAnotacion.id });
      await tx.delete(lineasBateo).where(eq(lineasBateo.hojaId, hoja.id));
      await tx.delete(lineasPitcheo).where(eq(lineasPitcheo.hojaId, hoja.id));
      if (bateo.length > 0) await tx.insert(lineasBateo).values(bateo.map((l) => ({ hojaId: hoja.id, jugadorId: l.jugadorId, ...l.conteos })));
      if (lanzadores.length > 0) {
        await tx
          .insert(lineasPitcheo)
          .values(lanzadores.map((l) => ({ hojaId: hoja.id, jugadorId: l.jugadorId, decision: l.pitcheo === 'lanzo' ? null : l.pitcheo })));
      }
      return hoja.id;
    });
    const cuenta = `${plural(bateo.length, 'bateador', 'bateadores')} y ${plural(lanzadores.length, 'pitcher', 'pitchers')}`;
    await anotar(contexto, 'capturar_hoja', 'hoja', hojaId, `Capturó la hoja de ${describir(juego)} (${cuenta})`);
    return `Hoja guardada y publicada: ${cuenta}.${revision.avisos.length > 0 ? ` Ojo: ${revision.avisos.join(' ')}` : ''}`;
  },
  'compilador',
);

function conHoja(juegoId: number, equipoId: number, trabajo: (juego: JuegoDeHoja, contexto: Contexto) => Promise<string>) {
  return accionDirecta(async (contexto) => trabajo(await juegoDeHoja(id.parse(juegoId), id.parse(equipoId)), contexto), 'compilador');
}

export async function marcarSinHoja(juegoId: number, equipoId: number) {
  return conHoja(juegoId, equipoId, async (juego, contexto) => {
    const hojaId = await db.transaction(async (tx) => {
      const [hoja] = await tx
        .insert(hojasAnotacion)
        .values({ juegoId: juego.juegoId, equipoId: juego.equipo.id, sinNumeros: true, capturadaPorId: contexto.usuarioId })
        .onConflictDoUpdate({
          target: [hojasAnotacion.juegoId, hojasAnotacion.equipoId],
          set: { sinNumeros: true, capturadaPorId: contexto.usuarioId, actualizadoEn: new Date() },
        })
        .returning({ id: hojasAnotacion.id });
      await tx.delete(lineasBateo).where(eq(lineasBateo.hojaId, hoja.id));
      await tx.delete(lineasPitcheo).where(eq(lineasPitcheo.hojaId, hoja.id));
      return hoja.id;
    });
    await anotar(contexto, 'sin_hoja', 'hoja', hojaId, `Marcó que no hay hoja de ${describir(juego)}`);
    return 'Listo: este juego ya no aparece como pendiente y no suma a los acumulados.';
  });
}

export async function borrarHoja(juegoId: number, equipoId: number) {
  return conHoja(juegoId, equipoId, async (juego, contexto) => {
    const previa = await hojaGuardada(juego.juegoId, juego.equipo.id);
    if (!previa) throw new ErrorPanel('Esta hoja ya estaba sin capturar.');
    await db.delete(hojasAnotacion).where(eq(hojasAnotacion.id, previa.id));
    await anotar(contexto, 'eliminar', 'hoja', previa.id, `Borró la hoja de ${describir(juego)}`, {
      bateo: Object.fromEntries(previa.bateo),
      pitcheo: Object.fromEntries(previa.pitcheo),
    });
    return 'Hoja borrada. El juego vuelve a quedar pendiente.';
  });
}
