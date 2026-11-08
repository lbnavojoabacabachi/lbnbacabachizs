import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { registrarEnBitacora } from '@/lib/bitacora';
import { esTipoImagen } from '@/lib/imagenes/procesar';
import { registrarImagen } from '@/lib/imagenes/registrar';

const FORMATOS = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAXIMO_BYTES = 8 * 1024 * 1024;

function error(mensaje: string, estado: number) {
  return NextResponse.json({ error: mensaje }, { status: estado });
}

export async function POST(peticion: Request) {
  const sesion = await auth.api.getSession({ headers: peticion.headers });
  if (!sesion || sesion.user.debeCambiarContrasena || sesion.user.rol !== 'administrador' || !sesion.user.activo) {
    return error('Necesitas entrar al panel para subir imágenes.', 401);
  }

  const formulario = await peticion.formData().catch(() => null);
  const archivo = formulario?.get('archivo');
  const tipo = String(formulario?.get('tipo') ?? 'foto');
  if (!(archivo instanceof File) || archivo.size === 0) return error('Falta la imagen.', 400);
  if (!esTipoImagen(tipo)) return error('Tipo de imagen desconocido.', 400);
  if (!FORMATOS.has(archivo.type)) return error('Formato no permitido. Sube una imagen JPG, PNG o WebP.', 415);
  if (archivo.size > MAXIMO_BYTES) return error('La imagen pesa más de 8 MB.', 413);

  let imagen;
  try {
    imagen = await registrarImagen({
      datos: Buffer.from(await archivo.arrayBuffer()),
      tipo,
      nombreOriginal: archivo.name,
      usuarioId: sesion.user.id,
    });
  } catch {
    return error('No se pudo leer la imagen. Prueba con otra foto.', 422);
  }

  await registrarEnBitacora({
    usuarioId: sesion.user.id,
    accion: 'subir',
    entidad: 'imagen',
    entidadId: String(imagen.id),
    resumen: `Subió una imagen (${tipo})`,
  });

  return NextResponse.json(
    {
      id: imagen.id,
      urlChica: imagen.urlChica,
      urlMediana: imagen.urlMediana,
      urlGrande: imagen.urlGrande,
      ancho: imagen.ancho,
      alto: imagen.alto,
      colorFondo: imagen.colorFondo,
    },
    { status: 201 },
  );
}
