'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/conexion';
import { publicacionesRedes, transmisiones } from '@/db/esquema';
import { incrustacionDePublicacion, incrustacionDeTransmision, redDeUrl } from '@/lib/incrustar';
import { accionConFormulario, accionDirecta, anotar, ErrorPanel } from '@/lib/panel/acciones';
import { casilla, entero, fecha, fechaOpcional, hora, horaRequerida, id, idOpcional, instanteEnSonora, textoOpcional, textoRequerido } from '@/lib/panel/campos';

const esquemaTransmision = z.object({
  id: idOpcional,
  url: textoRequerido('el enlace de la transmisión', 500),
  titulo: textoRequerido('el título', 140),
  fecha: fecha('la fecha'),
  hora: horaRequerida,
  horaFin: hora,
  enVivo: casilla,
});

export const guardarTransmision = accionConFormulario(esquemaTransmision, async (datos, contexto) => {
  const incrustacion = incrustacionDeTransmision(datos.url);
  if (!incrustacion || (incrustacion.red !== 'youtube' && incrustacion.red !== 'facebook')) {
    throw new ErrorPanel('El enlace debe ser de un video de YouTube o de Facebook.', {
      url: 'Pega el enlace del video o del en vivo, por ejemplo https://www.youtube.com/live/… o https://www.facebook.com/…/videos/…',
    });
  }
  const inicio = instanteEnSonora(datos.fecha, datos.hora);
  let fin = datos.horaFin ? instanteEnSonora(datos.fecha, datos.horaFin) : null;
  if (fin && fin <= inicio) fin = new Date(fin.getTime() + 24 * 60 * 60 * 1000);
  const valores = {
    plataforma: incrustacion.red,
    url: datos.url.trim(),
    titulo: datos.titulo,
    inicio,
    fin,
    enVivo: datos.enVivo,
  };
  if (datos.id === null) {
    const [creada] = await db.insert(transmisiones).values(valores).returning();
    await anotar(contexto, 'crear', 'transmision', creada.id, `${datos.enVivo ? 'Puso en vivo' : 'Programó'} la transmisión «${creada.titulo}»`);
    return datos.enVivo ? 'Transmisión publicada: el aviso «En vivo» ya está en la portada.' : 'Transmisión programada.';
  }
  await db.update(transmisiones).set(valores).where(eq(transmisiones.id, datos.id));
  await anotar(contexto, 'editar', 'transmision', datos.id, `Editó la transmisión «${datos.titulo}»`);
  return 'Transmisión guardada.';
});

export async function cambiarEnVivo(transmisionId: number, enVivo: boolean) {
  return accionDirecta(async (contexto) => {
    const valor = id.parse(transmisionId);
    const [actual] = await db.select().from(transmisiones).where(eq(transmisiones.id, valor));
    if (!actual) throw new ErrorPanel('La transmisión ya no existe.');
    await db
      .update(transmisiones)
      .set({ enVivo, fin: enVivo ? (actual.fin && actual.fin > new Date() ? actual.fin : null) : new Date() })
      .where(eq(transmisiones.id, valor));
    await anotar(contexto, enVivo ? 'en_vivo' : 'terminar', 'transmision', valor, `${enVivo ? 'Puso en vivo' : 'Terminó'} «${actual.titulo}»`);
    return enVivo ? 'En vivo.' : 'Transmisión terminada.';
  });
}

export async function eliminarTransmision(transmisionId: number) {
  return accionDirecta(async (contexto) => {
    const valor = id.parse(transmisionId);
    const [actual] = await db.select().from(transmisiones).where(eq(transmisiones.id, valor));
    if (!actual) throw new ErrorPanel('La transmisión ya no existe.');
    await db.delete(transmisiones).where(eq(transmisiones.id, valor));
    await anotar(contexto, 'eliminar', 'transmision', valor, `Eliminó la transmisión «${actual.titulo}»`);
    return 'Transmisión eliminada.';
  });
}

const esquemaPublicacion = z.object({
  id: idOpcional,
  url: textoRequerido('el enlace de la publicación', 500),
  titulo: textoOpcional(140),
  publicadaEn: fechaOpcional('la fecha'),
  orden: entero(0, 999, 'el orden'),
  destacada: casilla,
  activa: casilla,
});

export const guardarPublicacion = accionConFormulario(esquemaPublicacion, async (datos, contexto) => {
  const red = redDeUrl(datos.url);
  if (!red) {
    throw new ErrorPanel('El enlace debe ser de Facebook, Instagram, YouTube, TikTok o X.', {
      url: 'Copia el enlace con el botón «Compartir» de la publicación.',
    });
  }
  const valores = { red, url: datos.url.trim(), titulo: datos.titulo, publicadaEn: datos.publicadaEn, orden: datos.orden, destacada: datos.destacada, activa: datos.activa };
  const aviso = red !== 'x' && !incrustacionDePublicacion(datos.url) ? ' No se puede mostrar dentro del sitio: se verá como enlace.' : '';
  if (datos.id === null) {
    const [creada] = await db.insert(publicacionesRedes).values(valores).returning();
    await anotar(contexto, 'crear', 'publicacion_red', creada.id, `Agregó una publicación de ${red}`);
    return `Publicación agregada.${aviso}`;
  }
  await db.update(publicacionesRedes).set(valores).where(eq(publicacionesRedes.id, datos.id));
  await anotar(contexto, 'editar', 'publicacion_red', datos.id, `Editó una publicación de ${red}`);
  return `Publicación guardada.${aviso}`;
});

export async function eliminarPublicacion(publicacionId: number) {
  return accionDirecta(async (contexto) => {
    const valor = id.parse(publicacionId);
    const [actual] = await db.select().from(publicacionesRedes).where(eq(publicacionesRedes.id, valor));
    if (!actual) throw new ErrorPanel('La publicación ya no existe.');
    await db.delete(publicacionesRedes).where(eq(publicacionesRedes.id, valor));
    await anotar(contexto, 'eliminar', 'publicacion_red', valor, `Quitó una publicación de ${actual.red}`);
    return 'Publicación quitada.';
  });
}
