import { existsSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';

for (const archivo of ['.env.local', '.env']) {
  if (existsSync(archivo)) process.loadEnvFile(archivo);
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/esquema/index.ts',
  out: './drizzle',
  casing: 'snake_case',
  breakpoints: false,
  strict: true,
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
});
