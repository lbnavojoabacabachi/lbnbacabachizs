import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import pg from 'pg';
import { cargarEntorno } from './lib/entorno.mjs';

cargarEntorno();

const comando = process.argv[2];
const bin = process.env.POSTGRES_BIN;
const datos = process.env.POSTGRES_DATOS;
const adminUrl = process.env.POSTGRES_ADMIN_URL;

function exigir(valor, nombre) {
  if (!valor) {
    console.error(`Falta ${nombre} en .env.local (ver .env.example y README).`);
    process.exit(1);
  }
  return valor;
}

function pgCtl(...argumentos) {
  const ejecutable = join(exigir(bin, 'POSTGRES_BIN'), process.platform === 'win32' ? 'pg_ctl.exe' : 'pg_ctl');
  return spawnSync(ejecutable, ['-D', exigir(datos, 'POSTGRES_DATOS'), ...argumentos], { encoding: 'utf8', windowsHide: true });
}

function corriendo() {
  return pgCtl('status').status === 0;
}

async function esperarConexion(segundos) {
  const limite = Date.now() + segundos * 1000;
  while (Date.now() < limite) {
    const cliente = new pg.Client({ connectionString: exigir(adminUrl, 'POSTGRES_ADMIN_URL') });
    try {
      await cliente.connect();
      await cliente.end();
      return true;
    } catch {
      await new Promise((resolver) => setTimeout(resolver, 500));
    }
  }
  return false;
}

async function iniciar() {
  if (corriendo()) {
    console.log('PostgreSQL local ya está corriendo.');
    return;
  }
  if (!existsSync(join(exigir(datos, 'POSTGRES_DATOS'), 'PG_VERSION'))) {
    console.error(`No hay un clúster en ${datos}. Créalo con initdb (ver README).`);
    process.exit(1);
  }
  const puerto = new URL(exigir(adminUrl, 'POSTGRES_ADMIN_URL')).port || '5432';
  const ejecutable = join(exigir(bin, 'POSTGRES_BIN'), process.platform === 'win32' ? 'pg_ctl.exe' : 'pg_ctl');
  const registro = join(dirname(datos), 'postgres.log');
  const proceso = spawn(
    ejecutable,
    ['-D', datos, '-l', registro, '-o', `-p ${puerto} -c listen_addresses=localhost`, 'start'],
    { detached: true, stdio: 'ignore', windowsHide: true },
  );
  proceso.unref();
  if (await esperarConexion(20)) console.log(`PostgreSQL local corriendo en el puerto ${puerto}.`);
  else {
    console.error(`PostgreSQL no respondió en 20 segundos. Revisa ${registro}.`);
    process.exit(1);
  }
}

function detener() {
  if (!corriendo()) {
    console.log('PostgreSQL local ya estaba detenido.');
    return;
  }
  const resultado = pgCtl('-m', 'fast', '-w', 'stop');
  console.log(resultado.status === 0 ? 'PostgreSQL local detenido.' : resultado.stderr);
}

function estado() {
  console.log(corriendo() ? 'PostgreSQL local: corriendo.' : 'PostgreSQL local: detenido.');
}

async function preparar() {
  const destino = new URL(exigir(process.env.DATABASE_URL, 'DATABASE_URL'));
  const rol = decodeURIComponent(destino.username);
  const clave = decodeURIComponent(destino.password);
  const base = destino.pathname.slice(1);
  const cliente = new pg.Client({ connectionString: exigir(adminUrl, 'POSTGRES_ADMIN_URL') });
  await cliente.connect();
  try {
    const existeRol = await cliente.query('select 1 from pg_roles where rolname = $1', [rol]);
    if (existeRol.rowCount === 0) {
      await cliente.query(`create role ${cliente.escapeIdentifier(rol)} login password ${cliente.escapeLiteral(clave)}`);
      console.log(`Rol ${rol} creado.`);
    }
    const existeBase = await cliente.query('select 1 from pg_database where datname = $1', [base]);
    if (existeBase.rowCount === 0) {
      await cliente.query(
        `create database ${cliente.escapeIdentifier(base)} owner ${cliente.escapeIdentifier(rol)} encoding 'UTF8' template template0`,
      );
      console.log(`Base ${base} creada.`);
    }
    console.log('Base local lista.');
  } finally {
    await cliente.end();
  }
}

const acciones = { iniciar, detener, estado, preparar };

if (!(comando in acciones)) {
  console.error('Uso: node scripts/postgres-local.mjs iniciar|detener|estado|preparar');
  process.exit(1);
}

await acciones[comando]();
