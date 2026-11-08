'use server';

import { and, eq, max, ne } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/conexion';
import { albumFotos, albumes, imagenes } from '@/db/esquema';
import { borrarImagenesSinUso } from '@/lib/imagenes/limpiar';
import { crearSlug } from '@/lib/nombres';
import { accionConFormulario, accionDirecta, anotar, ErrorPanel } from '@/lib/panel/acciones';
import { casilla, fechaOpcional, id, textoOpcional, textoRequerido } from '@/lib/panel/campos';

async function slugDeAlbum(titulo: string, excepto: number | null) {
  const base = crearSlug(titulo).slice(0, 80).replace(/-$/, '') || 'album';
  let slug = base;
  for (let n = 2; ; n++) {
    const [usado] = await db
      .select({ id: albumes.id })
      .from(albumes)
      .where(and(eq(albumes.slug, slug), excepto ? ne(albumes.id, excepto) : undefined));
    if (!usado) return slug;
    slug = `${base}-${n}`;
  }
}

const esquemaAlbum = z.object({
  titulo: textoRequerido('el título del álbum', 120),
  fecha: fechaOpcional(),
  descripcion: textoOpcional(500),
});

export const crearAlbum = accionConFormulario(esquemaAlbum, async (datos, contexto) => {
  const [creado] = await db
    .insert(albumes)
    .values({ ...datos, slug: await slugDeAlbum(datos.titulo, null), publicado: false })
    .returning();
  await anotar(contexto, 'crear', 'album', creado.id, `Creó el álbum «${creado.titulo}»`);
  return { mensaje: 'Álbum creado. Ahora sube sus fotos.', datos: { destino: `/panel/galeria/${creado.id}` } };
});

export const guardarAlbum = accionConFormulario(esquemaAlbum.extend({ id, publicado: casilla }), async (datos, contexto) => {
  const [actual] = await db.select().from(albumes).where(eq(albumes.id, datos.id));
  if (!actual) throw new ErrorPanel('El álbum ya no existe.');
  const fotos = await db.$count(albumFotos, eq(albumFotos.albumId, actual.id));
  if (datos.publicado && fotos === 0) throw new ErrorPanel('Sube al menos una foto antes de publicar el álbum.');
  const slug = actual.publicado || datos.titulo === actual.titulo ? actual.slug : await slugDeAlbum(datos.titulo, actual.id);
  await db
    .update(albumes)
    .set({ titulo: datos.titulo, fecha: datos.fecha, descripcion: datos.descripcion, publicado: datos.publicado, slug })
    .where(eq(albumes.id, actual.id));
  await anotar(contexto, 'editar', 'album', actual.id, `${datos.publicado && !actual.publicado ? 'Publicó' : 'Editó'} el álbum «${datos.titulo}»`);
  return datos.publicado ? 'Álbum guardado y publicado.' : 'Álbum guardado; no se ve en el sitio hasta publicarlo.';
});

export async function agregarFotoAlAlbum(albumId: number, imagenId: number) {
  return accionDirecta(async (contexto) => {
    const album = id.parse(albumId);
    const imagen = id.parse(imagenId);
    const [registro] = await db.select().from(albumes).where(eq(albumes.id, album));
    if (!registro) throw new ErrorPanel('El álbum ya no existe.');
    const [existe] = await db.select({ id: imagenes.id }).from(imagenes).where(eq(imagenes.id, imagen));
    if (!existe) throw new ErrorPanel('La imagen no se guardó. Súbela otra vez.');
    const [ultimo] = await db.select({ orden: max(albumFotos.orden) }).from(albumFotos).where(eq(albumFotos.albumId, album));
    await db
      .insert(albumFotos)
      .values({ albumId: album, imagenId: imagen, orden: (ultimo?.orden ?? -1) + 1 })
      .onConflictDoNothing();
    if (!registro.portadaId) await db.update(albumes).set({ portadaId: imagen }).where(eq(albumes.id, album));
    await anotar(contexto, 'subir', 'album_foto', imagen, `Agregó una foto al álbum «${registro.titulo}»`);
    return 'Foto agregada.';
  });
}

export const guardarFotos = accionConFormulario(z.object({ albumId: id }), async (datos, contexto, formulario) => {
  const fotos = await db.select().from(albumFotos).where(eq(albumFotos.albumId, datos.albumId));
  const errores: Record<string, string> = {};
  const cambios: { imagenId: number; pie: string | null; orden: number }[] = [];
  for (const foto of fotos) {
    const pie = String(formulario.get(`pie-${foto.imagenId}`) ?? '').trim();
    const orden = Number(formulario.get(`orden-${foto.imagenId}`) ?? foto.orden + 1);
    if (pie.length > 200) errores[`pie-${foto.imagenId}`] = 'El pie puede tener hasta 200 caracteres.';
    if (!Number.isInteger(orden) || orden < 1 || orden > 9999) errores[`orden-${foto.imagenId}`] = 'Escribe un número de orden.';
    cambios.push({ imagenId: foto.imagenId, pie: pie === '' ? null : pie, orden: orden - 1 });
  }
  if (Object.keys(errores).length > 0) throw new ErrorPanel(Object.values(errores)[0], errores);
  await db.transaction(async (tx) => {
    for (const c of cambios) {
      await tx
        .update(albumFotos)
        .set({ pie: c.pie, orden: c.orden })
        .where(and(eq(albumFotos.albumId, datos.albumId), eq(albumFotos.imagenId, c.imagenId)));
    }
  });
  await anotar(contexto, 'editar', 'album', datos.albumId, 'Cambió pies y orden de las fotos de un álbum');
  return 'Pies y orden guardados.';
});

export async function usarComoPortada(albumId: number, imagenId: number) {
  return accionDirecta(async (contexto) => {
    const album = id.parse(albumId);
    const imagen = id.parse(imagenId);
    await db.update(albumes).set({ portadaId: imagen }).where(eq(albumes.id, album));
    await anotar(contexto, 'editar', 'album', album, 'Cambió la portada de un álbum');
    return 'Portada cambiada.';
  });
}

export async function quitarFoto(albumId: number, imagenId: number) {
  return accionDirecta(async (contexto) => {
    const album = id.parse(albumId);
    const imagen = id.parse(imagenId);
    const [registro] = await db.select().from(albumes).where(eq(albumes.id, album));
    if (!registro) throw new ErrorPanel('El álbum ya no existe.');
    await db.delete(albumFotos).where(and(eq(albumFotos.albumId, album), eq(albumFotos.imagenId, imagen)));
    if (registro.portadaId === imagen) {
      const [otra] = await db.select({ imagenId: albumFotos.imagenId }).from(albumFotos).where(eq(albumFotos.albumId, album)).limit(1);
      await db
        .update(albumes)
        .set({ portadaId: otra?.imagenId ?? null, publicado: otra ? registro.publicado : false })
        .where(eq(albumes.id, album));
    }
    await borrarImagenesSinUso([imagen]);
    await anotar(contexto, 'eliminar', 'album_foto', imagen, `Quitó una foto del álbum «${registro.titulo}»`);
    return 'Foto quitada.';
  });
}

export async function eliminarAlbum(albumId: number) {
  return accionDirecta(async (contexto) => {
    const album = id.parse(albumId);
    const [registro] = await db.select().from(albumes).where(eq(albumes.id, album));
    if (!registro) throw new ErrorPanel('El álbum ya no existe.');
    const fotos = await db.select({ imagenId: albumFotos.imagenId }).from(albumFotos).where(eq(albumFotos.albumId, album));
    await db.delete(albumes).where(eq(albumes.id, album));
    const borradas = await borrarImagenesSinUso([...fotos.map((f) => f.imagenId), ...(registro.portadaId ? [registro.portadaId] : [])]);
    await anotar(contexto, 'eliminar', 'album', album, `Eliminó el álbum «${registro.titulo}» y ${borradas} fotos`);
    return 'Álbum eliminado.';
  });
}
