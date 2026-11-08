import { appendFileSync, chmodSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

for (const archivo of ['.env.local', '.env']) {
  if (existsSync(archivo)) process.loadEnvFile(archivo);
}

async function principal() {
  const nombres = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const restablecer = process.argv.includes('--restablecer');
  if (nombres.length === 0) {
    console.error('Uso: npm run admins:crear -- Usuario1 Usuario2 [--restablecer]');
    process.exit(1);
  }

  const { buscarUsuario, crearAdministrador, restablecerClave, USUARIO_VALIDO } = await import('@/lib/usuarios');
  const { registrarEnBitacora } = await import('@/lib/bitacora');

  const entregadas: string[] = [];
  for (const nombre of nombres) {
    if (!USUARIO_VALIDO.test(nombre)) {
      console.error(`${nombre}: el usuario lleva de 3 a 30 letras, números, puntos o guiones bajos.`);
      continue;
    }
    const existente = await buscarUsuario(nombre);
    if (existente && !restablecer) {
      console.log(`${nombre}: ya existe, sin cambios (usa --restablecer para darle una clave temporal nueva).`);
      continue;
    }
    if (existente) {
      const clave = await restablecerClave(existente.id);
      await registrarEnBitacora({ usuarioId: null, accion: 'restablecer_contrasena', entidad: 'usuario', entidadId: existente.id, resumen: `Clave temporal nueva para ${nombre}` });
      entregadas.push(`${nombre}\t${clave}`);
      continue;
    }
    const creado = await crearAdministrador(nombre);
    await registrarEnBitacora({ usuarioId: null, accion: 'crear', entidad: 'usuario', entidadId: creado.id, resumen: `Administrador ${nombre} creado` });
    entregadas.push(`${nombre}\t${creado.clave}`);
  }

  if (entregadas.length > 0) {
    const archivo = join(homedir(), '.liga-claves-temporales.txt');
    const encabezado = `${existsSync(archivo) ? '\n' : ''}${new Date().toISOString()}\nUsuario\tClave temporal\n`;
    appendFileSync(archivo, `${encabezado}${entregadas.join('\n')}\n`, { encoding: 'utf8' });
    if (process.platform !== 'win32') chmodSync(archivo, 0o600);
    console.log(`Claves temporales de ${entregadas.length} usuario(s) guardadas en ${archivo}.`);
    console.log('Cada quien la cambia al entrar por primera vez. Borra el archivo cuando las entregues.');
  }
  process.exit(0);
}

principal().catch((error) => {
  console.error(error);
  process.exit(1);
});
