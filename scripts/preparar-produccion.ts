import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

for (const archivo of ['.env.local', '.env']) {
  if (existsSync(archivo)) process.loadEnvFile(archivo);
}

function correr(script: string) {
  const resultado = spawnSync(process.execPath, ['--import', 'tsx', script], { stdio: 'inherit', env: process.env });
  if (resultado.status !== 0) throw new Error(`${script} terminó con error.`);
}

async function principal() {
  if (process.env.VERCEL_ENV !== 'production' && !process.argv.includes('--forzar')) {
    console.log('Preparación de la base: solo corre en la compilación de producción de Vercel.');
    return;
  }
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) throw new Error('Falta DATABASE_URL.');
  process.env.DATABASE_URL = url;

  const { Pool } = await import('pg');
  const { drizzle } = await import('drizzle-orm/node-postgres');
  const { migrate } = await import('drizzle-orm/node-postgres/migrator');
  const pool = new Pool({ connectionString: url, max: 1 });
  await migrate(drizzle(pool), { migrationsFolder: 'drizzle' });
  console.log('Migraciones aplicadas.');

  if (process.env.CARGAR_SITIO_ANTERIOR === '1') {
    const contar = async (tabla: string) => (await pool.query(`select count(*)::int as total from ${tabla}`)).rows[0].total as number;
    if ((await contar('temporadas')) === 0) correr('scripts/migrar-legado.ts');
    else console.log('Los datos del sitio anterior ya estaban cargados.');
    if ((await contar('imagenes')) === 0) correr('scripts/migrar-imagenes.ts');
    else console.log('Las imágenes del sitio anterior ya estaban cargadas.');
  }

  const iniciales = process.env.ADMINS_INICIALES;
  if (iniciales) {
    const { buscarUsuario, crearAdministrador, USUARIO_VALIDO } = await import('@/lib/usuarios');
    const { registrarEnBitacora } = await import('@/lib/bitacora');
    for (const par of iniciales.split(',')) {
      const [nombre, clave] = par.split(':').map((p) => p.trim());
      if (!nombre || !clave || !USUARIO_VALIDO.test(nombre) || clave.length < 10) {
        throw new Error('ADMINS_INICIALES debe tener la forma Usuario:clave,Usuario:clave con claves de 10 caracteres o más.');
      }
      if (await buscarUsuario(nombre)) {
        console.log(`${nombre}: ya existe.`);
        continue;
      }
      const creado = await crearAdministrador(nombre, clave);
      await registrarEnBitacora({ usuarioId: null, accion: 'crear', entidad: 'usuario', entidadId: creado.id, resumen: `Administrador ${nombre} creado` });
      console.log(`${nombre}: creado con su clave temporal.`);
    }
  }
  await pool.end();
}

principal()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
