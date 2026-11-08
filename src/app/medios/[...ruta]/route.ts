import { readFile } from 'node:fs/promises';
import { rutaLocalSegura, usaBlob } from '@/lib/imagenes/almacen';

const TIPOS: Record<string, string> = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', pdf: 'application/pdf' };

export async function GET(_peticion: Request, { params }: { params: Promise<{ ruta: string[] }> }) {
  if (usaBlob()) return new Response(null, { status: 404 });
  const { ruta } = await params;
  const extension = ruta.at(-1)?.split('.').pop() ?? '';
  try {
    const datos = await readFile(rutaLocalSegura(ruta.join('/')));
    return new Response(new Uint8Array(datos), {
      headers: {
        'content-type': TIPOS[extension] ?? 'application/octet-stream',
        'cache-control': 'public, max-age=31536000, immutable',
        'x-content-type-options': 'nosniff',
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
