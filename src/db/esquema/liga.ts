import { sql } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { actualizadoEn, creadoEn } from './columnas';
import { imagenes } from './imagenes';

export const estadoTemporada = pgEnum('estado_temporada', ['preparacion', 'regular', 'postemporada', 'terminada']);
export const categoriaJugador = pgEnum('categoria_jugador', ['local', 'novato', 'nuevo_valor', 'refuerzo']);
export const puestoCuerpoTecnico = pgEnum('puesto_cuerpo_tecnico', ['delegado', 'manager', 'coach']);

export const temporadas = pgTable(
  'temporadas',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    nombre: text().notNull().unique(),
    inicio: date({ mode: 'string' }).notNull(),
    fin: date({ mode: 'string' }),
    estado: estadoTemporada().notNull().default('preparacion'),
    vigente: boolean().notNull().default(false),
    creadoEn: creadoEn(),
    actualizadoEn: actualizadoEn(),
  },
  (t) => [uniqueIndex('temporadas_una_vigente').on(t.vigente).where(sql`${t.vigente}`)],
);

export const equipos = pgTable('equipos', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  nombre: text().notNull().unique(),
  nombreCorto: text().notNull(),
  slug: text().notNull().unique(),
  poblado: text(),
  colorPrincipal: text(),
  logoId: integer().references(() => imagenes.id, { onDelete: 'set null' }),
  activo: boolean().notNull().default(true),
  creadoEn: creadoEn(),
  actualizadoEn: actualizadoEn(),
});

export const temporadaEquipos = pgTable(
  'temporada_equipos',
  {
    temporadaId: integer()
      .notNull()
      .references(() => temporadas.id, { onDelete: 'cascade' }),
    equipoId: integer()
      .notNull()
      .references(() => equipos.id, { onDelete: 'restrict' }),
    grupo: text(),
  },
  (t) => [primaryKey({ columns: [t.temporadaId, t.equipoId] })],
);

export const jugadores = pgTable('jugadores', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  nombre: text().notNull(),
  activo: boolean().notNull().default(true),
  creadoEn: creadoEn(),
  actualizadoEn: actualizadoEn(),
});

export const datosPrivadosJugador = pgTable('datos_privados_jugador', {
  jugadorId: integer()
    .primaryKey()
    .references(() => jugadores.id, { onDelete: 'cascade' }),
  fechaNacimiento: date({ mode: 'string' }),
  notas: text(),
  actualizadoEn: actualizadoEn(),
});

export const plantillas = pgTable(
  'plantillas',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    temporadaId: integer()
      .notNull()
      .references(() => temporadas.id, { onDelete: 'cascade' }),
    equipoId: integer()
      .notNull()
      .references(() => equipos.id, { onDelete: 'restrict' }),
    jugadorId: integer()
      .notNull()
      .references(() => jugadores.id, { onDelete: 'restrict' }),
    numero: smallint(),
    categoria: categoriaJugador().notNull().default('local'),
    alta: date({ mode: 'string' }),
    baja: date({ mode: 'string' }),
    creadoEn: creadoEn(),
    actualizadoEn: actualizadoEn(),
  },
  (t) => [
    uniqueIndex('plantillas_jugador_en_equipo').on(t.temporadaId, t.equipoId, t.jugadorId),
    index('plantillas_jugador').on(t.temporadaId, t.jugadorId),
  ],
);

export const cuerpoTecnico = pgTable(
  'cuerpo_tecnico',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    temporadaId: integer()
      .notNull()
      .references(() => temporadas.id, { onDelete: 'cascade' }),
    equipoId: integer()
      .notNull()
      .references(() => equipos.id, { onDelete: 'restrict' }),
    puesto: puestoCuerpoTecnico().notNull(),
    nombre: text().notNull(),
  },
  (t) => [index('cuerpo_tecnico_equipo').on(t.temporadaId, t.equipoId)],
);
