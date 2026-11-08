import { timestamp } from 'drizzle-orm/pg-core';

export const instante = () => timestamp({ withTimezone: true, mode: 'date' });

export const creadoEn = () => instante().notNull().defaultNow();

export const actualizadoEn = () =>
  instante()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
