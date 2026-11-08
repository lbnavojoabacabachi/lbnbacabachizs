import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { db } from '@/db/conexion';
import { documentos } from '@/db/esquema';
import { auth } from '@/lib/auth';
import { registrarEnBitacora } from '@/lib/bitacora';
import { borrarArchivos, guardarArchivo } from '@/lib/imagenes/almacen';
import { crearSlug } from '@/lib/nombres';

const MAXIMO_BYTES = 4 * 1024 * 1024;

function error(mensaje: string, estado: number) {
  return NextResponse.json({ error: mensaje }, { status: estado });
}

export async function POST(peticion: Request) {
  const sesion = await auth.api.getSession({ headers: peticion.headers });
  if (!sesion || sesion.user.debeCambiarContrasena || sesion.user.rol !== 'administrador' || !sesion.user.activo) {
    return error('Necesitas entrar al panel para subir documentos.', 401);
  }
  const formulario = await peticion.formData().catch(() => null);
  const archivo = formulario?.get('archivo');
  const titulo = String(formulario?.get('titulo') ?? '').trim();
  if (titulo.length === 0 || titulo.length > 140) return error('Escribe el título del documento (hasta 140 caracteres).', 400);
  if (!(archivo instanceof File) || archivo.size === 0) return error('Falta el archivo.', 400);
  if (archivo.size > MAXIMO_BYTES) return error('El PDF pesa más de 4 MB. Redúcelo antes de subirlo.', 413);
  const datos = Buffer.from(await archivo.arrayBuffer());
  if (datos.subarray(0, 5).toString('latin1') !== '%PDF-') return error('El archivo no es un PDF.', 415);

  const hoy = new Date();
  const ruta = `documentos/${hoy.getUTCFullYear()}/${crearSlug(titulo).slice(0, 60) || 'documento'}-${randomBytes(6).toString('base64url')}.pdf`;
  const url = await guardarArchivo(ruta, datos, 'application/pdf');
  try {
    const [creado] = await db
      .insert(documentos)
      .values({ titulo, url, bytes: datos.length, publicadoEn: hoy })
      .returning();
    await registrarEnBitacora({
      usuarioId: sesion.user.id,
      accion: 'subir',
      entidad: 'documento',
      entidadId: String(creado.id),
      resumen: `Subió el documento «${titulo}»`,
    });
  } catch (e) {
    await borrarArchivos([url]);
    throw e;
  }
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true }, { status: 201 });
}
