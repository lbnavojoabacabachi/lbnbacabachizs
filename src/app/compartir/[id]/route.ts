import { eq } from 'drizzle-orm';
import sharp from 'sharp';
import { db } from '@/db/conexion';
import { imagenes } from '@/db/esquema';
import { leerArchivo } from '@/lib/imagenes/almacen';

const UN_ANIO = 60 * 60 * 24 * 365;

export async function GET(_solicitud: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d{1,9}$/.test(id)) return new Response('No encontrada', { status: 404 });
  const [imagen] = await db.select({ url: imagenes.urlGrande }).from(imagenes).where(eq(imagenes.id, Number(id)));
  if (!imagen) return new Response('No encontrada', { status: 404 });
  const jpeg = await sharp(await leerArchivo(imagen.url))
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': `public, max-age=${UN_ANIO}, immutable`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
