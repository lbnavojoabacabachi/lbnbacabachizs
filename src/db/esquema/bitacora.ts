import { bigint, index, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { user } from './autenticacion';
import { creadoEn } from './columnas';

export const bitacora = pgTable(
  'bitacora',
  {
    id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    usuarioId: text().references(() => user.id, { onDelete: 'set null' }),
    accion: text().notNull(),
    entidad: text().notNull(),
    entidadId: text(),
    resumen: text().notNull(),
    cambios: jsonb(),
    creadoEn: creadoEn(),
  },
  (t) => [index('bitacora_creado_en').on(t.creadoEn)],
);
