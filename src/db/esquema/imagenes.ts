import { integer, pgEnum, pgTable, text } from 'drizzle-orm/pg-core';
import { user } from './autenticacion';
import { creadoEn } from './columnas';

export const tipoImagen = pgEnum('tipo_imagen', ['foto', 'logo', 'poster', 'noticia', 'patrocinador']);

export const imagenes = pgTable('imagenes', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  tipo: tipoImagen().notNull(),
  urlChica: text().notNull(),
  urlMediana: text().notNull(),
  urlGrande: text().notNull(),
  ancho: integer().notNull(),
  alto: integer().notNull(),
  colorFondo: text(),
  nombreOriginal: text(),
  bytesOriginal: integer(),
  creadaPorId: text().references(() => user.id, { onDelete: 'set null' }),
  creadaEn: creadoEn(),
});
