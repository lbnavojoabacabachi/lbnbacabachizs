'use server';

import { APIError } from 'better-auth/api';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/db/conexion';
import { user } from '@/db/esquema';
import { auth } from '@/lib/auth';
import { registrarEnBitacora } from '@/lib/bitacora';

const esquema = z
  .object({
    actual: z.string().min(1, 'Escribe tu contraseña actual.'),
    nueva: z
      .string()
      .min(10, 'La contraseña nueva debe tener al menos 10 caracteres.')
      .max(128, 'La contraseña nueva puede tener hasta 128 caracteres.'),
    confirmacion: z.string(),
  })
  .refine((d) => d.nueva === d.confirmacion, { message: 'Las dos contraseñas nuevas no coinciden.' })
  .refine((d) => d.nueva !== d.actual, { message: 'La contraseña nueva debe ser distinta de la actual.' });

export type EstadoContrasena = { error: string };

export async function cambiarContrasena(_previo: EstadoContrasena, formulario: FormData): Promise<EstadoContrasena> {
  const encabezados = await headers();
  const sesion = await auth.api.getSession({ headers: encabezados });
  if (!sesion) redirect('/panel/entrar');

  const datos = esquema.safeParse({
    actual: formulario.get('actual'),
    nueva: formulario.get('nueva'),
    confirmacion: formulario.get('confirmacion'),
  });
  if (!datos.success) return { error: datos.error.issues[0]?.message ?? 'Revisa los datos.' };

  try {
    await auth.api.changePassword({
      body: { currentPassword: datos.data.actual, newPassword: datos.data.nueva, revokeOtherSessions: true },
      headers: encabezados,
    });
  } catch (error) {
    if (error instanceof APIError) return { error: 'La contraseña actual no es correcta.' };
    throw error;
  }

  await db.update(user).set({ debeCambiarContrasena: false }).where(eq(user.id, sesion.user.id));
  await registrarEnBitacora({
    usuarioId: sesion.user.id,
    accion: 'cambiar_contrasena',
    entidad: 'usuario',
    entidadId: sesion.user.id,
    resumen: 'Cambió su contraseña',
  });
  redirect('/panel');
}
