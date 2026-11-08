import { randomInt } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/db/conexion';
import { account, session, user } from '@/db/esquema';
import { auth } from '@/lib/auth';

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

export const USUARIO_VALIDO = /^[A-Za-z0-9._]{3,30}$/;

export function claveTemporal(longitud = 14) {
  return Array.from({ length: longitud }, () => ALFABETO[randomInt(ALFABETO.length)]).join('');
}

export async function buscarUsuario(nombre: string) {
  const [existente] = await db.select({ id: user.id }).from(user).where(eq(user.username, nombre.toLowerCase()));
  return existente ?? null;
}

export async function crearAdministrador(nombre: string) {
  const usuario = nombre.toLowerCase();
  const contexto = await auth.$context;
  const clave = claveTemporal();
  const hash = await contexto.password.hash(clave);
  const creado = await contexto.internalAdapter.createUser(
    {
      name: nombre,
      email: `${usuario}@usuarios.invalid`,
      emailVerified: true,
      username: usuario,
      displayUsername: nombre,
      rol: 'administrador',
      debeCambiarContrasena: true,
      activo: true,
    },
    { method: 'admin' },
  );
  await contexto.internalAdapter.linkAccount({ userId: creado.id, providerId: 'credential', accountId: creado.id, password: hash });
  return { id: creado.id, clave };
}

export async function restablecerClave(usuarioId: string) {
  const contexto = await auth.$context;
  const clave = claveTemporal();
  const hash = await contexto.password.hash(clave);
  await db.transaction(async (tx) => {
    await tx.update(account).set({ password: hash }).where(eq(account.userId, usuarioId));
    await tx.update(user).set({ debeCambiarContrasena: true }).where(eq(user.id, usuarioId));
    await tx.delete(session).where(eq(session.userId, usuarioId));
  });
  return clave;
}

export async function cambiarActivo(usuarioId: string, activo: boolean) {
  await db.transaction(async (tx) => {
    await tx.update(user).set({ activo }).where(eq(user.id, usuarioId));
    if (!activo) await tx.delete(session).where(eq(session.userId, usuarioId));
  });
}
