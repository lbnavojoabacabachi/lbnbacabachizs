import { and, asc, count, desc, eq, gte, isNotNull, lte } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/db/conexion';
import {
  albumFotos,
  albumes,
  configuracion,
  documentos,
  eventos,
  imagenes,
  noticias,
  patrocinadores,
  publicacionesRedes,
  transmisiones,
} from '@/db/esquema';
import { hoyEnSonora } from '@/lib/fechas';
import { columnasImagen } from './comunes';

const columnasNoticia = {
  id: noticias.id,
  titulo: noticias.titulo,
  slug: noticias.slug,
  resumen: noticias.resumen,
  publicadaEn: noticias.publicadaEn,
  imagen: columnasImagen,
};

function noticiaPublicada(ahora: Date) {
  return and(isNotNull(noticias.publicadaEn), lte(noticias.publicadaEn, ahora));
}

export const obtenerConfiguracion = cache(async () => {
  const [fila] = await db.select().from(configuracion).where(eq(configuracion.id, 1));
  return fila ?? null;
});

export const obtenerNoticias = cache(async (limite = 50) =>
  db
    .select(columnasNoticia)
    .from(noticias)
    .leftJoin(imagenes, eq(noticias.imagenId, imagenes.id))
    .where(noticiaPublicada(new Date()))
    .orderBy(desc(noticias.destacada), desc(noticias.publicadaEn), desc(noticias.id))
    .limit(limite),
);

export const obtenerNoticia = cache(async (slug: string) => {
  const [fila] = await db
    .select({ ...columnasNoticia, cuerpo: noticias.cuerpo, actualizadoEn: noticias.actualizadoEn })
    .from(noticias)
    .leftJoin(imagenes, eq(noticias.imagenId, imagenes.id))
    .where(and(eq(noticias.slug, slug), noticiaPublicada(new Date())));
  return fila ?? null;
});

export const obtenerProximosEventos = cache(async () => {
  const inicioDeHoy = new Date(`${hoyEnSonora()}T00:00:00-07:00`);
  return db
    .select({
      id: eventos.id,
      titulo: eventos.titulo,
      descripcion: eventos.descripcion,
      inicio: eventos.inicio,
      sede: eventos.sede,
      poster: columnasImagen,
    })
    .from(eventos)
    .leftJoin(imagenes, eq(eventos.posterId, imagenes.id))
    .where(gte(eventos.inicio, inicioDeHoy))
    .orderBy(desc(eventos.destacado), asc(eventos.inicio))
    .limit(3);
});

export const obtenerAlbumes = cache(async () =>
  db
    .select({
      id: albumes.id,
      titulo: albumes.titulo,
      slug: albumes.slug,
      fecha: albumes.fecha,
      portada: columnasImagen,
      fotos: db.$count(albumFotos, eq(albumFotos.albumId, albumes.id)),
    })
    .from(albumes)
    .leftJoin(imagenes, eq(albumes.portadaId, imagenes.id))
    .where(eq(albumes.publicado, true))
    .orderBy(desc(albumes.fecha), desc(albumes.creadoEn)),
);

export const obtenerAlbum = cache(async (slug: string) => {
  const [album] = await db
    .select({ id: albumes.id, titulo: albumes.titulo, slug: albumes.slug, fecha: albumes.fecha, descripcion: albumes.descripcion, portada: columnasImagen })
    .from(albumes)
    .leftJoin(imagenes, eq(albumes.portadaId, imagenes.id))
    .where(and(eq(albumes.slug, slug), eq(albumes.publicado, true)));
  if (!album) return null;
  const fotos = await db
    .select({ id: imagenes.id, pie: albumFotos.pie, imagen: columnasImagen })
    .from(albumFotos)
    .innerJoin(imagenes, eq(albumFotos.imagenId, imagenes.id))
    .where(eq(albumFotos.albumId, album.id))
    .orderBy(asc(albumFotos.orden), asc(imagenes.id));
  return { ...album, fotos };
});

export const obtenerPatrocinadores = cache(async () =>
  db
    .select({ id: patrocinadores.id, nombre: patrocinadores.nombre, enlace: patrocinadores.enlace, logo: columnasImagen })
    .from(patrocinadores)
    .leftJoin(imagenes, eq(patrocinadores.logoId, imagenes.id))
    .where(eq(patrocinadores.activo, true))
    .orderBy(asc(patrocinadores.orden), asc(patrocinadores.nombre)),
);

export const obtenerDocumentos = cache(async () =>
  db
    .select({ id: documentos.id, titulo: documentos.titulo, url: documentos.url, bytes: documentos.bytes, publicadoEn: documentos.publicadoEn })
    .from(documentos)
    .where(and(isNotNull(documentos.publicadoEn), lte(documentos.publicadoEn, new Date())))
    .orderBy(asc(documentos.orden), asc(documentos.titulo)),
);

export const obtenerPublicacionesRedes = cache(async (limite = 24) =>
  db
    .select({
      id: publicacionesRedes.id,
      red: publicacionesRedes.red,
      url: publicacionesRedes.url,
      titulo: publicacionesRedes.titulo,
      publicadaEn: publicacionesRedes.publicadaEn,
      destacada: publicacionesRedes.destacada,
    })
    .from(publicacionesRedes)
    .where(eq(publicacionesRedes.activa, true))
    .orderBy(desc(publicacionesRedes.destacada), asc(publicacionesRedes.orden), desc(publicacionesRedes.publicadaEn))
    .limit(limite),
);

export type Transmision = {
  id: number;
  plataforma: 'youtube' | 'facebook';
  url: string;
  titulo: string;
  inicio: Date;
  fin: Date | null;
  enVivo: boolean;
};

export function clasificarTransmisiones(lista: Transmision[], ahora: Date) {
  const enVivo = lista.filter((t) => t.enVivo && (t.fin === null || t.fin > ahora));
  const vivas = new Set(enVivo.map((t) => t.id));
  const proximas = lista
    .filter((t) => !vivas.has(t.id) && t.inicio > ahora)
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  const anteriores = lista
    .filter((t) => !vivas.has(t.id) && t.inicio <= ahora)
    .sort((a, b) => b.inicio.getTime() - a.inicio.getTime())
    .slice(0, 6);
  return { enVivo, proximas, anteriores };
}

export const obtenerTransmisiones = cache(async () => {
  const lista = await db
    .select({
      id: transmisiones.id,
      plataforma: transmisiones.plataforma,
      url: transmisiones.url,
      titulo: transmisiones.titulo,
      inicio: transmisiones.inicio,
      fin: transmisiones.fin,
      enVivo: transmisiones.enVivo,
    })
    .from(transmisiones)
    .orderBy(desc(transmisiones.inicio))
    .limit(40);
  return clasificarTransmisiones(lista, new Date());
});

export const contarFotos = cache(async () => {
  const [fila] = await db.select({ total: count() }).from(albumFotos);
  return fila?.total ?? 0;
});
