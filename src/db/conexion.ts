import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as esquema from './esquema';

const almacen = globalThis as unknown as { poolLiga?: Pool };

const pool = almacen.poolLiga ?? new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

if (process.env.NODE_ENV !== 'production') almacen.poolLiga = pool;

export const db = drizzle(pool, { schema: esquema, casing: 'snake_case' });
