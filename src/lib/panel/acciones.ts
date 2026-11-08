import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import { z } from 'zod';
import { registrarEnBitacora } from '@/lib/bitacora';
import { exigirAdministrador } from '@/lib/sesion';
import { leerFormulario } from './campos';
import type { EstadoFormulario } from './estado';

export class ErrorPanel extends Error {
  constructor(
    mensaje: string,
    readonly errores: Record<string, string> = {},
  ) {
    super(mensaje);
  }
}

export type Contexto = { usuarioId: string; usuario: string };

type Resultado = string | { mensaje: string; datos?: Record<string, string> };

function erroresDeZod(error: z.ZodError) {
  const errores: Record<string, string> = {};
  for (const problema of error.issues) {
    const clave = problema.path.join('.') || '$general';
    if (!errores[clave]) errores[clave] = problema.message;
  }
  return errores;
}

export function publicarCambios() {
  revalidatePath('/', 'layout');
}

export async function anotar(
  contexto: Contexto,
  accion: string,
  entidad: string,
  entidadId: string | number | null,
  resumen: string,
  cambios?: unknown,
) {
  await registrarEnBitacora({
    usuarioId: contexto.usuarioId,
    accion,
    entidad,
    entidadId: entidadId === null ? null : String(entidadId),
    resumen,
    cambios,
  });
}

async function correr<T>(
  obtenerDatos: () => T,
  trabajo: (datos: T, contexto: Contexto) => Promise<Resultado>,
  previo: number,
): Promise<EstadoFormulario> {
  const sesion = await exigirAdministrador();
  const contexto = { usuarioId: sesion.user.id, usuario: sesion.user.displayUsername ?? sesion.user.name };
  const vez = previo + 1;
  try {
    const datos = obtenerDatos();
    const resultado = await trabajo(datos, contexto);
    publicarCambios();
    const mensaje = typeof resultado === 'string' ? resultado : resultado.mensaje;
    return { resultado: 'ok', mensaje, errores: {}, vez, datos: typeof resultado === 'string' ? undefined : resultado.datos };
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof z.ZodError) {
      const errores = erroresDeZod(error);
      const primero = Object.values(errores)[0] ?? 'Revisa los datos.';
      return { resultado: 'error', mensaje: `Revisa el formulario: ${primero}`, errores, vez };
    }
    if (error instanceof ErrorPanel) return { resultado: 'error', mensaje: error.message, errores: error.errores, vez };
    console.error(error);
    return { resultado: 'error', mensaje: 'No se pudo guardar. Intenta de nuevo en un momento.', errores: {}, vez };
  }
}

export function accionConFormulario<T>(
  esquema: z.ZodType<T>,
  trabajo: (datos: T, contexto: Contexto, formulario: FormData) => Promise<Resultado>,
) {
  return async (previo: EstadoFormulario, formulario: FormData) =>
    correr(
      () => esquema.parse(leerFormulario(formulario)),
      (datos, contexto) => trabajo(datos, contexto, formulario),
      previo.vez,
    );
}

export async function accionDirecta(trabajo: (contexto: Contexto) => Promise<Resultado>) {
  return correr(
    () => null,
    (_datos, contexto) => trabajo(contexto),
    0,
  );
}
