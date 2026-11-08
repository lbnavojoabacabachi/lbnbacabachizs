import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
} from 'drizzle-orm/pg-core';
import { user } from './autenticacion';
import { actualizadoEn, creadoEn, instante } from './columnas';
import { imagenes } from './imagenes';
import { encuentros } from './juegos';

export const redSocial = pgEnum('red_social', ['facebook', 'instagram', 'youtube', 'tiktok', 'x']);
export const plataformaTransmision = pgEnum('plataforma_transmision', ['youtube', 'facebook']);

export const noticias = pgTable(
  'noticias',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    titulo: text().notNull(),
    slug: text().notNull().unique(),
    resumen: text(),
    cuerpo: text().notNull(),
    imagenId: integer().references(() => imagenes.id, { onDelete: 'set null' }),
    publicadaEn: instante(),
    destacada: boolean().notNull().default(false),
    creadoPorId: text().references(() => user.id, { onDelete: 'set null' }),
    creadoEn: creadoEn(),
    actualizadoEn: actualizadoEn(),
  },
  (t) => [index('noticias_publicada_en').on(t.publicadaEn)],
);

export const eventos = pgTable('eventos', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  titulo: text().notNull(),
  descripcion: text(),
  inicio: instante().notNull(),
  sede: text(),
  posterId: integer().references(() => imagenes.id, { onDelete: 'set null' }),
  destacado: boolean().notNull().default(false),
  creadoEn: creadoEn(),
  actualizadoEn: actualizadoEn(),
});

export const albumes = pgTable('albumes', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  titulo: text().notNull(),
  slug: text().notNull().unique(),
  fecha: date({ mode: 'string' }),
  descripcion: text(),
  portadaId: integer().references(() => imagenes.id, { onDelete: 'set null' }),
  publicado: boolean().notNull().default(false),
  creadoEn: creadoEn(),
  actualizadoEn: actualizadoEn(),
});

export const albumFotos = pgTable(
  'album_fotos',
  {
    albumId: integer()
      .notNull()
      .references(() => albumes.id, { onDelete: 'cascade' }),
    imagenId: integer()
      .notNull()
      .references(() => imagenes.id, { onDelete: 'cascade' }),
    pie: text(),
    orden: integer().notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.albumId, t.imagenId] })],
);

export const patrocinadores = pgTable('patrocinadores', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  nombre: text().notNull(),
  enlace: text(),
  logoId: integer().references(() => imagenes.id, { onDelete: 'set null' }),
  orden: integer().notNull().default(0),
  activo: boolean().notNull().default(true),
  creadoEn: creadoEn(),
  actualizadoEn: actualizadoEn(),
});

export const documentos = pgTable('documentos', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  titulo: text().notNull(),
  url: text().notNull(),
  bytes: integer(),
  orden: integer().notNull().default(0),
  publicadoEn: instante(),
  creadoEn: creadoEn(),
});

export const publicacionesRedes = pgTable('publicaciones_redes', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  red: redSocial().notNull(),
  url: text().notNull(),
  titulo: text(),
  publicadaEn: date({ mode: 'string' }),
  destacada: boolean().notNull().default(false),
  orden: integer().notNull().default(0),
  activa: boolean().notNull().default(true),
  creadoEn: creadoEn(),
});

export const transmisiones = pgTable(
  'transmisiones',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    plataforma: plataformaTransmision().notNull(),
    url: text().notNull(),
    titulo: text().notNull(),
    inicio: instante().notNull(),
    fin: instante(),
    enVivo: boolean().notNull().default(false),
    encuentroId: integer().references(() => encuentros.id, { onDelete: 'set null' }),
    creadoEn: creadoEn(),
    actualizadoEn: actualizadoEn(),
  },
  (t) => [index('transmisiones_inicio').on(t.inicio)],
);

export const configuracion = pgTable(
  'configuracion',
  {
    id: smallint().primaryKey().default(1),
    correoContacto: text(),
    telefonoContacto: text(),
    direccion: text(),
    horario: text(),
    facebook: text(),
    instagram: text(),
    youtube: text(),
    tiktok: text(),
    actualizadoEn: actualizadoEn(),
  },
  (t) => [check('configuracion_unica', sql`${t.id} = 1`)],
);
