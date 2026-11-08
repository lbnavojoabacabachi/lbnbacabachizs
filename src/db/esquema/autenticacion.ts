import { bigint, boolean, index, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { actualizadoEn, creadoEn, instante } from './columnas';

export const user = pgTable('user', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  createdAt: creadoEn(),
  updatedAt: actualizadoEn(),
  username: text().unique(),
  displayUsername: text(),
  rol: text().notNull().default('administrador'),
  debeCambiarContrasena: boolean().notNull().default(true),
  activo: boolean().notNull().default(true),
});

export const session = pgTable(
  'session',
  {
    id: text().primaryKey(),
    expiresAt: instante().notNull(),
    token: text().notNull().unique(),
    createdAt: creadoEn(),
    updatedAt: actualizadoEn(),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (t) => [index('session_user_id').on(t.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: instante(),
    refreshTokenExpiresAt: instante(),
    scope: text(),
    password: text(),
    createdAt: creadoEn(),
    updatedAt: actualizadoEn(),
  },
  (t) => [index('account_user_id').on(t.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: instante().notNull(),
    createdAt: creadoEn(),
    updatedAt: actualizadoEn(),
  },
  (t) => [index('verification_identifier').on(t.identifier)],
);

export const rateLimit = pgTable('rate_limit', {
  id: text().primaryKey(),
  key: text().notNull().unique(),
  count: integer().notNull(),
  lastRequest: bigint({ mode: 'number' }).notNull(),
});
