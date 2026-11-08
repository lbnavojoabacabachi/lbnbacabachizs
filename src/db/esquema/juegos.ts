import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  time,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { user } from './autenticacion';
import { actualizadoEn, creadoEn } from './columnas';
import { equipos, temporadas } from './liga';

export const estadoJuego = pgEnum('estado_juego', [
  'programado',
  'jugado',
  'forfeit',
  'suspendido',
  'pospuesto',
  'cancelado',
]);

export const reglasTemporada = pgTable('reglas_temporada', {
  temporadaId: integer()
    .primaryKey()
    .references(() => temporadas.id, { onDelete: 'cascade' }),
  juegosPorEncuentro: smallint().notNull().default(2),
  forfeitCarrerasGanador: smallint().notNull().default(7),
  forfeitCarrerasPerdedor: smallint().notNull().default(0),
  forfeitCuentaCarreras: boolean().notNull().default(false),
  permiteEmpates: boolean().notNull().default(true),
  criteriosDesempate: jsonb()
    .$type<string[]>()
    .notNull()
    .default(sql`'["ave","diferencia_carreras"]'::jsonb`),
  actualizadoEn: actualizadoEn(),
});

export const jornadas = pgTable(
  'jornadas',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    temporadaId: integer()
      .notNull()
      .references(() => temporadas.id, { onDelete: 'cascade' }),
    numero: smallint().notNull(),
    fecha: date({ mode: 'string' }),
    vuelta: smallint(),
    equipoDescansaId: integer().references(() => equipos.id, { onDelete: 'set null' }),
    nota: text(),
    creadoEn: creadoEn(),
    actualizadoEn: actualizadoEn(),
  },
  (t) => [uniqueIndex('jornadas_numero').on(t.temporadaId, t.numero)],
);

export const encuentros = pgTable(
  'encuentros',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    jornadaId: integer()
      .notNull()
      .references(() => jornadas.id, { onDelete: 'cascade' }),
    localId: integer()
      .notNull()
      .references(() => equipos.id, { onDelete: 'restrict' }),
    visitanteId: integer()
      .notNull()
      .references(() => equipos.id, { onDelete: 'restrict' }),
    sede: text(),
    hora: time(),
    orden: smallint().notNull().default(0),
  },
  (t) => [
    index('encuentros_jornada').on(t.jornadaId),
    check('encuentros_equipos_distintos', sql`${t.localId} <> ${t.visitanteId}`),
  ],
);

export const juegos = pgTable(
  'juegos',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    encuentroId: integer()
      .notNull()
      .references(() => encuentros.id, { onDelete: 'cascade' }),
    numero: smallint().notNull(),
    estado: estadoJuego().notNull().default('programado'),
    carrerasLocal: smallint(),
    carrerasVisitante: smallint(),
    forfeitPierdeId: integer().references(() => equipos.id, { onDelete: 'restrict' }),
    cuentaParaTabla: boolean().notNull().default(true),
    notaPublica: text(),
    actualizadoEn: actualizadoEn(),
  },
  (t) => [
    uniqueIndex('juegos_numero').on(t.encuentroId, t.numero),
    check('juegos_carreras_no_negativas', sql`${t.carrerasLocal} >= 0 and ${t.carrerasVisitante} >= 0`),
  ],
);

export const ajustesTabla = pgTable(
  'ajustes_tabla',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    temporadaId: integer()
      .notNull()
      .references(() => temporadas.id, { onDelete: 'cascade' }),
    equipoId: integer()
      .notNull()
      .references(() => equipos.id, { onDelete: 'restrict' }),
    ganados: smallint().notNull().default(0),
    perdidos: smallint().notNull().default(0),
    motivo: text().notNull(),
    creadoPorId: text().references(() => user.id, { onDelete: 'set null' }),
    creadoEn: creadoEn(),
  },
  (t) => [index('ajustes_tabla_temporada').on(t.temporadaId)],
);
