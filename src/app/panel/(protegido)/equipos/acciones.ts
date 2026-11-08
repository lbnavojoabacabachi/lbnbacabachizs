'use server';

import { and, desc, eq, isNull, ne } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/conexion';
import { cuerpoTecnico, datosPrivadosJugador, equipos, jugadores, plantillas, temporadaEquipos, temporadas } from '@/db/esquema';
import { hoyEnSonora } from '@/lib/fechas';
import { borrarImagenesSinUso } from '@/lib/imagenes/limpiar';
import { crearSlug, normalizarNombre } from '@/lib/nombres';
import { accionConFormulario, accionDirecta, anotar, ErrorPanel } from '@/lib/panel/acciones';
import { casilla, enteroOpcional, fechaOpcional, id, idOpcional, textoOpcional, textoRequerido } from '@/lib/panel/campos';

const esquemaEquipo = z.object({
  nombre: textoRequerido('el nombre del equipo', 60),
  nombreCorto: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-ZÁÉÍÓÚÑ]{2,4}$/, 'La abreviatura lleva de 2 a 4 letras, como AST.'),
  poblado: textoOpcional(60),
});

async function slugLibre(nombre: string, excepto: number | null) {
  const base = crearSlug(nombre) || 'equipo';
  let slug = base;
  for (let n = 2; ; n++) {
    const [usado] = await db
      .select({ id: equipos.id })
      .from(equipos)
      .where(and(eq(equipos.slug, slug), excepto ? ne(equipos.id, excepto) : undefined));
    if (!usado) return slug;
    slug = `${base}-${n}`;
  }
}

export const crearEquipo = accionConFormulario(esquemaEquipo.extend({ enTemporada: casilla }), async (datos, contexto) => {
  const [repetido] = await db.select({ id: equipos.id }).from(equipos).where(eq(equipos.nombre, datos.nombre));
  if (repetido) throw new ErrorPanel('Ya existe un equipo con ese nombre.', { nombre: 'Ya existe un equipo con ese nombre.' });
  const [creado] = await db
    .insert(equipos)
    .values({ nombre: datos.nombre, nombreCorto: datos.nombreCorto, poblado: datos.poblado, slug: await slugLibre(datos.nombre, null) })
    .returning();
  if (datos.enTemporada) {
    const [vigente] = await db.select({ id: temporadas.id }).from(temporadas).where(eq(temporadas.vigente, true));
    if (vigente) await db.insert(temporadaEquipos).values({ temporadaId: vigente.id, equipoId: creado.id }).onConflictDoNothing();
  }
  await anotar(contexto, 'crear', 'equipo', creado.id, `Dio de alta el equipo ${creado.nombre}`, datos);
  return `Equipo ${creado.nombre} creado. Agrégale su logotipo y su plantilla.`;
});

export const guardarEquipo = accionConFormulario(
  esquemaEquipo.extend({ id, logoId: idOpcional, activo: casilla }),
  async (datos, contexto) => {
    const [actual] = await db.select().from(equipos).where(eq(equipos.id, datos.id));
    if (!actual) throw new ErrorPanel('El equipo ya no existe.');
    const [repetido] = await db
      .select({ id: equipos.id })
      .from(equipos)
      .where(and(eq(equipos.nombre, datos.nombre), ne(equipos.id, datos.id)));
    if (repetido) throw new ErrorPanel('Ya existe otro equipo con ese nombre.', { nombre: 'Ya existe otro equipo con ese nombre.' });
    const slug = datos.nombre === actual.nombre ? actual.slug : await slugLibre(datos.nombre, datos.id);
    await db
      .update(equipos)
      .set({ nombre: datos.nombre, nombreCorto: datos.nombreCorto, poblado: datos.poblado, logoId: datos.logoId, activo: datos.activo, slug })
      .where(eq(equipos.id, datos.id));
    if (actual.logoId && actual.logoId !== datos.logoId) await borrarImagenesSinUso([actual.logoId]);
    await anotar(contexto, 'editar', 'equipo', datos.id, `Editó el equipo ${datos.nombre}`, datos);
    return 'Equipo guardado.';
  },
);

const esquemaCuerpo = z.object({
  temporadaId: id,
  equipoId: id,
  puesto: z.enum(['delegado', 'manager', 'coach'], { error: 'Elige el puesto.' }),
  nombre: textoRequerido('el nombre', 80),
});

export const agregarCuerpoTecnico = accionConFormulario(esquemaCuerpo, async (datos, contexto) => {
  const nombre = normalizarNombre(datos.nombre).nombre;
  const [creado] = await db.insert(cuerpoTecnico).values({ ...datos, nombre }).returning();
  await anotar(contexto, 'crear', 'cuerpo_tecnico', creado.id, `Agregó a ${nombre} al cuerpo técnico`, datos);
  return `Guardado como «${nombre}».`;
});

export async function quitarCuerpoTecnico(registroId: number) {
  return accionDirecta(async (contexto) => {
    const valor = id.parse(registroId);
    const [registro] = await db.select().from(cuerpoTecnico).where(eq(cuerpoTecnico.id, valor));
    if (!registro) throw new ErrorPanel('El registro ya no existe.');
    await db.delete(cuerpoTecnico).where(eq(cuerpoTecnico.id, valor));
    await anotar(contexto, 'eliminar', 'cuerpo_tecnico', valor, `Quitó a ${registro.nombre} del cuerpo técnico`, registro);
    return 'Quitado del cuerpo técnico.';
  });
}

const categoria = z.enum(['local', 'novato', 'nuevo_valor', 'refuerzo'], { error: 'Elige la categoría.' });

const esquemaJugador = z.object({
  nombre: textoRequerido('el nombre del jugador', 80),
  numero: enteroOpcional(0, 99, 'el número'),
  categoria,
  fechaNacimiento: fechaOpcional('la fecha de nacimiento'),
  alta: fechaOpcional('la fecha de alta'),
});

async function validarNumero(temporadaId: number, equipoId: number, numero: number | null, excepto: number | null) {
  if (numero === null) return;
  const [ocupado] = await db
    .select({ nombre: jugadores.nombre })
    .from(plantillas)
    .innerJoin(jugadores, eq(plantillas.jugadorId, jugadores.id))
    .where(
      and(
        eq(plantillas.temporadaId, temporadaId),
        eq(plantillas.equipoId, equipoId),
        eq(plantillas.numero, numero),
        isNull(plantillas.baja),
        excepto ? ne(plantillas.id, excepto) : undefined,
      ),
    );
  if (ocupado) throw new ErrorPanel(`El número ${numero} ya lo usa ${ocupado.nombre}.`, { numero: `Ya lo usa ${ocupado.nombre}.` });
}

function validarNacimiento(fecha: string | null) {
  if (fecha && (fecha > hoyEnSonora() || fecha < '1940-01-01')) {
    throw new ErrorPanel('Revisa la fecha de nacimiento.', { fechaNacimiento: 'La fecha no parece correcta.' });
  }
}

export const agregarJugador = accionConFormulario(esquemaJugador.extend({ temporadaId: id, equipoId: id }), async (datos, contexto) => {
  validarNacimiento(datos.fechaNacimiento);
  await validarNumero(datos.temporadaId, datos.equipoId, datos.numero, null);
  const nombre = normalizarNombre(datos.nombre).nombre;
  const creado = await db.transaction(async (tx) => {
    const [jugador] = await tx.insert(jugadores).values({ nombre }).returning();
    if (datos.fechaNacimiento) await tx.insert(datosPrivadosJugador).values({ jugadorId: jugador.id, fechaNacimiento: datos.fechaNacimiento });
    const [registro] = await tx
      .insert(plantillas)
      .values({
        temporadaId: datos.temporadaId,
        equipoId: datos.equipoId,
        jugadorId: jugador.id,
        numero: datos.numero,
        categoria: datos.categoria,
        alta: datos.alta ?? hoyEnSonora(),
      })
      .returning();
    return registro;
  });
  const [equipo] = await db.select({ nombre: equipos.nombre }).from(equipos).where(eq(equipos.id, datos.equipoId));
  await anotar(contexto, 'alta', 'plantilla', creado.id, `Dio de alta a ${nombre} en ${equipo?.nombre ?? 'un equipo'}`, {
    ...datos,
    fechaNacimiento: datos.fechaNacimiento ? 'capturada' : null,
  });
  return `${nombre} dado de alta.`;
});

export const guardarJugador = accionConFormulario(
  esquemaJugador.extend({ plantillaId: id, baja: fechaOpcional('la fecha de baja'), notas: textoOpcional(500) }),
  async (datos, contexto) => {
    validarNacimiento(datos.fechaNacimiento);
    const [registro] = await db.select().from(plantillas).where(eq(plantillas.id, datos.plantillaId));
    if (!registro) throw new ErrorPanel('El jugador ya no está en la plantilla.');
    if (datos.baja && datos.alta && datos.baja < datos.alta) {
      throw new ErrorPanel('La baja no puede ser antes del alta.', { baja: 'Debe ser igual o posterior al alta.' });
    }
    if (!datos.baja) await validarNumero(registro.temporadaId, registro.equipoId, datos.numero, registro.id);
    const nombre = normalizarNombre(datos.nombre).nombre;
    await db.transaction(async (tx) => {
      await tx.update(jugadores).set({ nombre }).where(eq(jugadores.id, registro.jugadorId));
      await tx
        .update(plantillas)
        .set({ numero: datos.numero, categoria: datos.categoria, alta: datos.alta, baja: datos.baja })
        .where(eq(plantillas.id, registro.id));
      await tx
        .insert(datosPrivadosJugador)
        .values({ jugadorId: registro.jugadorId, fechaNacimiento: datos.fechaNacimiento, notas: datos.notas })
        .onConflictDoUpdate({ target: datosPrivadosJugador.jugadorId, set: { fechaNacimiento: datos.fechaNacimiento, notas: datos.notas } });
    });
    const accion = datos.baja && !registro.baja ? 'baja' : 'editar';
    await anotar(contexto, accion, 'plantilla', registro.id, accion === 'baja' ? `Dio de baja a ${nombre}` : `Editó a ${nombre}`, {
      numero: datos.numero,
      categoria: datos.categoria,
      alta: datos.alta,
      baja: datos.baja,
    });
    return `Guardado como «${nombre}».`;
  },
);

export async function quitarDePlantilla(plantillaId: number) {
  return accionDirecta(async (contexto) => {
    const valor = id.parse(plantillaId);
    const [registro] = await db
      .select({ id: plantillas.id, nombre: jugadores.nombre, jugadorId: plantillas.jugadorId })
      .from(plantillas)
      .innerJoin(jugadores, eq(plantillas.jugadorId, jugadores.id))
      .where(eq(plantillas.id, valor));
    if (!registro) throw new ErrorPanel('El jugador ya no está en la plantilla.');
    await db.transaction(async (tx) => {
      await tx.delete(plantillas).where(eq(plantillas.id, valor));
      const otras = await tx.$count(plantillas, eq(plantillas.jugadorId, registro.jugadorId));
      if (otras === 0) await tx.delete(jugadores).where(eq(jugadores.id, registro.jugadorId));
    });
    await anotar(contexto, 'eliminar', 'plantilla', valor, `Quitó a ${registro.nombre} de la plantilla (captura equivocada)`);
    return 'Quitado de la plantilla.';
  });
}

export async function copiarPlantillaAnterior(equipoId: number, temporadaId: number) {
  return accionDirecta(async (contexto) => {
    const equipo = id.parse(equipoId);
    const temporada = id.parse(temporadaId);
    const [actual] = await db.select().from(temporadas).where(eq(temporadas.id, temporada));
    if (!actual) throw new ErrorPanel('La temporada ya no existe.');
    const [anterior] = await db
      .select()
      .from(temporadas)
      .where(and(ne(temporadas.id, temporada)))
      .orderBy(desc(temporadas.inicio))
      .limit(1);
    if (!anterior) throw new ErrorPanel('No hay una temporada anterior de donde copiar.');
    const previos = await db
      .select()
      .from(plantillas)
      .where(and(eq(plantillas.temporadaId, anterior.id), eq(plantillas.equipoId, equipo), isNull(plantillas.baja)));
    if (previos.length === 0) throw new ErrorPanel(`El equipo no tenía plantilla en la temporada ${anterior.nombre}.`);
    const hoy = hoyEnSonora();
    await db
      .insert(plantillas)
      .values(previos.map((p) => ({ temporadaId: temporada, equipoId: equipo, jugadorId: p.jugadorId, numero: p.numero, categoria: p.categoria, alta: hoy })))
      .onConflictDoNothing();
    await anotar(contexto, 'copiar', 'plantilla', equipo, `Copió ${previos.length} jugadores de la temporada ${anterior.nombre}`);
    return `${previos.length} jugadores copiados de la temporada ${anterior.nombre}. Revisa categorías y números.`;
  });
}
