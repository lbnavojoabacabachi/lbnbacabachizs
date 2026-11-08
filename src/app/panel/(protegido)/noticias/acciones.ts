'use server';

import { and, eq, ne } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/conexion';
import { eventos, noticias } from '@/db/esquema';
import { borrarImagenesSinUso } from '@/lib/imagenes/limpiar';
import { crearSlug } from '@/lib/nombres';
import { accionConFormulario, accionDirecta, anotar, ErrorPanel } from '@/lib/panel/acciones';
import { casilla, fecha, horaRequerida, id, idOpcional, instanteEnSonora, textoOpcional, textoRequerido } from '@/lib/panel/campos';

async function slugDeNoticia(titulo: string, excepto: number | null) {
  const base = crearSlug(titulo).slice(0, 80).replace(/-$/, '') || 'noticia';
  let slug = base;
  for (let n = 2; ; n++) {
    const [usado] = await db
      .select({ id: noticias.id })
      .from(noticias)
      .where(and(eq(noticias.slug, slug), excepto ? ne(noticias.id, excepto) : undefined));
    if (!usado) return slug;
    slug = `${base}-${n}`;
  }
}

const esquemaNoticia = z.object({
  id: idOpcional,
  titulo: textoRequerido('el título', 140),
  resumen: textoOpcional(300),
  cuerpo: textoRequerido('el texto de la noticia', 10000),
  imagenId: idOpcional,
  destacada: casilla,
  publicar: casilla,
});

export const guardarNoticia = accionConFormulario(esquemaNoticia, async (datos, contexto) => {
  if (datos.id === null) {
    const [creada] = await db
      .insert(noticias)
      .values({
        titulo: datos.titulo,
        slug: await slugDeNoticia(datos.titulo, null),
        resumen: datos.resumen,
        cuerpo: datos.cuerpo,
        imagenId: datos.imagenId,
        destacada: datos.destacada,
        publicadaEn: datos.publicar ? new Date() : null,
        creadoPorId: contexto.usuarioId,
      })
      .returning();
    await anotar(contexto, 'crear', 'noticia', creada.id, `${datos.publicar ? 'Publicó' : 'Guardó en borrador'} la noticia «${creada.titulo}»`);
    return {
      mensaje: datos.publicar ? 'Noticia publicada.' : 'Noticia guardada como borrador.',
      datos: { destino: `/panel/noticias/${creada.id}` },
    };
  }
  const [actual] = await db.select().from(noticias).where(eq(noticias.id, datos.id));
  if (!actual) throw new ErrorPanel('La noticia ya no existe.');
  const yaPublicada = actual.publicadaEn !== null;
  const slug = yaPublicada || datos.titulo === actual.titulo ? actual.slug : await slugDeNoticia(datos.titulo, actual.id);
  const publicadaEn = datos.publicar ? (actual.publicadaEn ?? new Date()) : null;
  await db
    .update(noticias)
    .set({
      titulo: datos.titulo,
      slug,
      resumen: datos.resumen,
      cuerpo: datos.cuerpo,
      imagenId: datos.imagenId,
      destacada: datos.destacada,
      publicadaEn,
    })
    .where(eq(noticias.id, actual.id));
  if (actual.imagenId && actual.imagenId !== datos.imagenId) await borrarImagenesSinUso([actual.imagenId]);
  const accion = !yaPublicada && datos.publicar ? 'Publicó' : yaPublicada && !datos.publicar ? 'Pasó a borrador' : 'Editó';
  await anotar(contexto, 'editar', 'noticia', actual.id, `${accion} la noticia «${datos.titulo}»`);
  return datos.publicar ? 'Noticia guardada y publicada.' : 'Noticia guardada como borrador; no se ve en el sitio.';
});

export async function eliminarNoticia(noticiaId: number) {
  return accionDirecta(async (contexto) => {
    const valor = id.parse(noticiaId);
    const [noticia] = await db.select().from(noticias).where(eq(noticias.id, valor));
    if (!noticia) throw new ErrorPanel('La noticia ya no existe.');
    await db.delete(noticias).where(eq(noticias.id, valor));
    if (noticia.imagenId) await borrarImagenesSinUso([noticia.imagenId]);
    await anotar(contexto, 'eliminar', 'noticia', valor, `Eliminó la noticia «${noticia.titulo}»`);
    return 'Noticia eliminada.';
  });
}

const esquemaEvento = z.object({
  id: idOpcional,
  titulo: textoRequerido('el nombre del evento', 140),
  descripcion: textoOpcional(1000),
  fecha: fecha('la fecha del evento'),
  hora: horaRequerida,
  sede: textoOpcional(120),
  posterId: idOpcional,
  destacado: casilla,
});

export const guardarEvento = accionConFormulario(esquemaEvento, async (datos, contexto) => {
  const valores = {
    titulo: datos.titulo,
    descripcion: datos.descripcion,
    inicio: instanteEnSonora(datos.fecha, datos.hora),
    sede: datos.sede,
    posterId: datos.posterId,
    destacado: datos.destacado,
  };
  if (datos.id === null) {
    const [creado] = await db.insert(eventos).values(valores).returning();
    await anotar(contexto, 'crear', 'evento', creado.id, `Agregó el evento «${creado.titulo}»`);
    return { mensaje: 'Evento guardado.', datos: { destino: '/panel/eventos' } };
  }
  const [actual] = await db.select({ id: eventos.id, posterId: eventos.posterId }).from(eventos).where(eq(eventos.id, datos.id));
  if (!actual) throw new ErrorPanel('El evento ya no existe.');
  await db.update(eventos).set(valores).where(eq(eventos.id, datos.id));
  if (actual.posterId && actual.posterId !== datos.posterId) await borrarImagenesSinUso([actual.posterId]);
  await anotar(contexto, 'editar', 'evento', datos.id, `Editó el evento «${datos.titulo}»`);
  return 'Evento guardado.';
});

export async function eliminarEvento(eventoId: number) {
  return accionDirecta(async (contexto) => {
    const valor = id.parse(eventoId);
    const [evento] = await db.select().from(eventos).where(eq(eventos.id, valor));
    if (!evento) throw new ErrorPanel('El evento ya no existe.');
    await db.delete(eventos).where(eq(eventos.id, valor));
    if (evento.posterId) await borrarImagenesSinUso([evento.posterId]);
    await anotar(contexto, 'eliminar', 'evento', valor, `Eliminó el evento «${evento.titulo}»`);
    return 'Evento eliminado.';
  });
}
