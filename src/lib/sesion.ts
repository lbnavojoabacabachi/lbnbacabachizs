import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { auth } from '@/lib/auth';
import { INICIO_DEL_COMPILADOR, rolDe } from '@/lib/roles';

export const obtenerSesion = cache(async () => auth.api.getSession({ headers: await headers() }));

export async function exigirSesion() {
  const sesion = await obtenerSesion();
  if (!sesion) redirect('/panel/entrar');
  return sesion;
}

async function exigirCuentaLista() {
  const sesion = await exigirSesion();
  if (!sesion.user.activo) redirect('/panel/entrar');
  if (sesion.user.debeCambiarContrasena) redirect('/panel/contrasena');
  return sesion;
}

export async function exigirCompilador() {
  const sesion = await exigirCuentaLista();
  if (rolDe(sesion.user.rol) === null) redirect('/panel/entrar');
  return sesion;
}

export async function exigirAdministrador() {
  const sesion = await exigirCuentaLista();
  const rol = rolDe(sesion.user.rol);
  if (rol === 'compilador') redirect(INICIO_DEL_COMPILADOR);
  if (rol !== 'administrador') redirect('/panel/entrar');
  return sesion;
}
