import { existsSync } from 'node:fs';

export function cargarEntorno() {
  for (const archivo of ['.env.local', '.env']) {
    if (existsSync(archivo)) process.loadEnvFile(archivo);
  }
}
