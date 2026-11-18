'use server';

import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/conexion';
import { user } from '@/db/esquema';
import { accionConFormulario, accionDirecta, anotar, ErrorPanel } from '@/lib/panel/acciones';
import { NOMBRE_ROL, ROLES, rolDe } from '@/lib/roles';
import { buscarUsuario, cambiarActivo, crearCuenta, restablecerClave, USUARIO_VALIDO } from '@/lib/usuarios';

const esquemaUsuario = z.object({
  usuario: z
    .string({ error: 'Escribe el nombre de usuario.' })
    .trim()
    .regex(USUARIO_VALIDO, 'El usuario lleva de 3 a 30 letras sin acentos, números, puntos o guiones bajos.'),
  rol: z.enum(ROLES, { error: 'Elige qué puede hacer.' }),
});

export const crearUsuario = accionConFormulario(esquemaUsuario, async (datos, contexto) => {
  if (await buscarUsuario(datos.usuario)) throw new ErrorPanel('Ya existe ese usuario.', { usuario: 'Ya existe ese usuario.' });
  const creado = await crearCuenta(datos.usuario, datos.rol);
  await anotar(contexto, 'crear', 'usuario', creado.id, `Creó al ${NOMBRE_ROL[datos.rol].toLowerCase()} ${datos.usuario}`);
  return `${NOMBRE_ROL[datos.rol]} ${datos.usuario} creado. Su clave temporal es ${creado.clave}. Anótala y entrégala en persona: no se vuelve a mostrar y se le pedirá cambiarla al entrar.`;
});

async function buscar(usuarioId: string) {
  const [registro] = await db.select().from(user).where(eq(user.id, z.string().min(1).max(64).parse(usuarioId)));
  if (!registro) throw new ErrorPanel('El usuario ya no existe.');
  return registro;
}

export async function restablecerUsuario(usuarioId: string) {
  return accionDirecta(async (contexto) => {
    const registro = await buscar(usuarioId);
    if (registro.id === contexto.usuarioId) throw new ErrorPanel('Para cambiar tu propia contraseña usa «Cambiar mi contraseña».');
    const clave = await restablecerClave(registro.id);
    await anotar(contexto, 'restablecer_contrasena', 'usuario', registro.id, `Restableció la contraseña de ${registro.displayUsername ?? registro.name}`);
    return `Clave temporal nueva de ${registro.displayUsername ?? registro.name}: ${clave}. Entrégala en persona; no se vuelve a mostrar.`;
  });
}

export async function activarUsuario(usuarioId: string, activo: boolean) {
  return accionDirecta(async (contexto) => {
    const registro = await buscar(usuarioId);
    if (registro.id === contexto.usuarioId) throw new ErrorPanel('No puedes desactivar tu propia cuenta.');
    if (!activo && rolDe(registro.rol) === 'administrador') {
      const activos = await db.$count(user, and(eq(user.activo, true), eq(user.rol, 'administrador')));
      if (activos <= 1) throw new ErrorPanel('Debe quedar al menos un administrador activo.');
    }
    await cambiarActivo(registro.id, activo);
    const nombre = registro.displayUsername ?? registro.name;
    await anotar(contexto, activo ? 'activar' : 'desactivar', 'usuario', registro.id, `${activo ? 'Activó' : 'Desactivó'} a ${nombre}`);
    return activo ? `${nombre} puede volver a entrar.` : `${nombre} ya no puede entrar; se cerraron sus sesiones.`;
  });
}
