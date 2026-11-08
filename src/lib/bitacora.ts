import { db } from '@/db/conexion';
import { bitacora } from '@/db/esquema';

export type RegistroBitacora = {
  usuarioId: string | null;
  accion: string;
  entidad: string;
  entidadId?: string | null;
  resumen: string;
  cambios?: unknown;
};

export async function registrarEnBitacora(registro: RegistroBitacora) {
  await db.insert(bitacora).values({
    usuarioId: registro.usuarioId,
    accion: registro.accion,
    entidad: registro.entidad,
    entidadId: registro.entidadId ?? null,
    resumen: registro.resumen,
    cambios: registro.cambios ?? null,
  });
}
