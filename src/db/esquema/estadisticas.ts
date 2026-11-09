import { boolean, index, integer, pgTable, smallint, text } from 'drizzle-orm/pg-core';
import { creadoEn } from './columnas';
import { equipos, temporadas } from './liga';

const conteo = () => smallint().notNull().default(0);

export const estadisticasBateo = pgTable(
  'estadisticas_bateo',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    temporadaId: integer()
      .notNull()
      .references(() => temporadas.id, { onDelete: 'cascade' }),
    equipoId: integer()
      .notNull()
      .references(() => equipos.id, { onDelete: 'restrict' }),
    orden: smallint().notNull(),
    nombre: text().notNull(),
    acumulado: boolean().notNull().default(false),
    juegos: conteo(),
    apariciones: conteo(),
    vecesAlBat: conteo(),
    hits: conteo(),
    sencillos: conteo(),
    dobles: conteo(),
    triples: conteo(),
    jonrones: conteo(),
    ponches: conteo(),
    basesPorBolas: conteo(),
    intencionales: conteo(),
    golpeados: conteo(),
    creadoEn: creadoEn(),
  },
  (t) => [index('estadisticas_bateo_equipo').on(t.temporadaId, t.equipoId)],
);

export const estadisticasPitcheo = pgTable(
  'estadisticas_pitcheo',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    temporadaId: integer()
      .notNull()
      .references(() => temporadas.id, { onDelete: 'cascade' }),
    equipoId: integer()
      .notNull()
      .references(() => equipos.id, { onDelete: 'restrict' }),
    orden: smallint().notNull(),
    nombre: text().notNull(),
    juegos: conteo(),
    ganados: conteo(),
    perdidos: conteo(),
    salvados: conteo(),
    creadoEn: creadoEn(),
  },
  (t) => [index('estadisticas_pitcheo_equipo').on(t.temporadaId, t.equipoId)],
);
