import { boolean, index, integer, pgEnum, pgTable, smallint, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { user } from './autenticacion';
import { actualizadoEn, creadoEn } from './columnas';
import { juegos } from './juegos';
import { equipos, jugadores, temporadas } from './liga';

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

export const decisionPitcher = pgEnum('decision_pitcher', ['ganado', 'perdido', 'salvado']);

export const hojasAnotacion = pgTable(
  'hojas_anotacion',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    juegoId: integer()
      .notNull()
      .references(() => juegos.id, { onDelete: 'cascade' }),
    equipoId: integer()
      .notNull()
      .references(() => equipos.id, { onDelete: 'restrict' }),
    sinNumeros: boolean().notNull().default(false),
    capturadaPorId: text().references(() => user.id, { onDelete: 'set null' }),
    creadoEn: creadoEn(),
    actualizadoEn: actualizadoEn(),
  },
  (t) => [uniqueIndex('hojas_anotacion_juego_equipo').on(t.juegoId, t.equipoId)],
);

export const lineasBateo = pgTable(
  'lineas_bateo',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    hojaId: integer()
      .notNull()
      .references(() => hojasAnotacion.id, { onDelete: 'cascade' }),
    jugadorId: integer()
      .notNull()
      .references(() => jugadores.id, { onDelete: 'restrict' }),
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
  },
  (t) => [uniqueIndex('lineas_bateo_hoja_jugador').on(t.hojaId, t.jugadorId), index('lineas_bateo_jugador').on(t.jugadorId)],
);

export const lineasPitcheo = pgTable(
  'lineas_pitcheo',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    hojaId: integer()
      .notNull()
      .references(() => hojasAnotacion.id, { onDelete: 'cascade' }),
    jugadorId: integer()
      .notNull()
      .references(() => jugadores.id, { onDelete: 'restrict' }),
    decision: decisionPitcher(),
  },
  (t) => [uniqueIndex('lineas_pitcheo_hoja_jugador').on(t.hojaId, t.jugadorId), index('lineas_pitcheo_jugador').on(t.jugadorId)],
);
