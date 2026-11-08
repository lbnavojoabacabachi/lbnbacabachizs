'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/conexion';
import { user } from '@/db/esquema';
import { accionConFormulario, accionDirecta, anotar, ErrorPanel } from '@/lib/panel/acciones';
import { buscarUsuario, cambiarActivo, crearAdministrador, restablecerClave, USUARIO_VALIDO } from '@/lib/usuarios';

const esquemaUsuario = z.object({
  usuario: z
    .string({ error: 'Escribe el nombre de usuario.' })
    .trim()
    .regex(USUARIO_VALIDO, 'El usuario lleva de 3 a 30 letras sin acentos, números, puntos o guiones bajos.'),
});

export const crearUsuario = accionConFormulario(esquemaUsuario, async (datos, contexto) => {
  if (await buscarUsuario(datos.usuario)) throw new ErrorPanel('Ya existe ese usuario.', { usuario: 'Ya existe ese usuario.' });
  const creado = await crearAdministrador(datos.usuario);
  await anotar(contexto, 'crear', 'usuario', creado.id, `Creó al administrador ${datos.usuario}`);
  return `Usuario ${datos.usuario} creado. Su clave temporal es ${creado.clave}. Anótala y entrégala en persona: no se vuelve a mostrar y se le pedirá cambiarla al entrar.`;
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
    if (!activo) {
      const activos = await db.$count(user, eq(user.activo, true));
      if (activos <= 1) throw new ErrorPanel('Debe quedar al menos un administrador activo.');
    }
    await cambiarActivo(registro.id, activo);
    const nombre = registro.displayUsername ?? registro.name;
    await anotar(contexto, activo ? 'activar' : 'desactivar', 'usuario', registro.id, `${activo ? 'Activó' : 'Desactivó'} a ${nombre}`);
    return activo ? `${nombre} puede volver a entrar.` : `${nombre} ya no puede entrar; se cerraron sus sesiones.`;
  });
}
