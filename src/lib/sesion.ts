import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { auth } from '@/lib/auth';

export const obtenerSesion = cache(async () => auth.api.getSession({ headers: await headers() }));

export async function exigirSesion() {
  const sesion = await obtenerSesion();
  if (!sesion) redirect('/panel/entrar');
  return sesion;
}

export async function exigirAdministrador() {
  const sesion = await exigirSesion();
  if (!sesion.user.activo) redirect('/panel/entrar');
  if (sesion.user.debeCambiarContrasena) redirect('/panel/contrasena');
  if (sesion.user.rol !== 'administrador') redirect('/panel/entrar');
  return sesion;
}
