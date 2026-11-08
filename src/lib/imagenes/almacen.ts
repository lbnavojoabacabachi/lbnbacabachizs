import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, sep } from 'node:path';
import { del, put } from '@vercel/blob';

export const PREFIJO_LOCAL = '/medios/';

const UN_ANIO = 60 * 60 * 24 * 365;

export function usaBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function carpetaLocal() {
  return join(process.cwd(), '.medios');
}

export function rutaLocalSegura(relativa: string) {
  const base = carpetaLocal();
  const destino = join(process.cwd(), '.medios', relativa);
  if (!destino.startsWith(base + sep)) throw new Error('Ruta fuera de la carpeta de medios.');
  return destino;
}

export async function guardarArchivo(ruta: string, datos: Buffer, tipoContenido: string) {
  if (usaBlob()) {
    const { url } = await put(ruta, datos, {
      access: 'public',
      contentType: tipoContenido,
      addRandomSuffix: false,
      cacheControlMaxAge: UN_ANIO,
    });
    return url;
  }
  const destino = rutaLocalSegura(ruta);
  await mkdir(dirname(destino), { recursive: true });
  await writeFile(destino, datos);
  return `${PREFIJO_LOCAL}${ruta}`;
}

export async function borrarArchivos(urls: string[]) {
  const remotas = urls.filter((u) => /^https?:\/\//.test(u));
  if (remotas.length > 0) await del(remotas);
  for (const url of urls.filter((u) => u.startsWith(PREFIJO_LOCAL))) {
    await rm(rutaLocalSegura(url.slice(PREFIJO_LOCAL.length)), { force: true });
  }
}

export async function leerArchivo(url: string) {
  if (url.startsWith(PREFIJO_LOCAL)) return readFile(rutaLocalSegura(url.slice(PREFIJO_LOCAL.length)));
  const direccion = new URL(url);
  if (direccion.protocol !== 'https:' || !direccion.hostname.endsWith('.public.blob.vercel-storage.com')) {
    throw new Error('El archivo no está en el almacén de la liga.');
  }
  const respuesta = await fetch(direccion);
  if (!respuesta.ok) throw new Error(`No se pudo leer el archivo (${respuesta.status}).`);
  return Buffer.from(await respuesta.arrayBuffer());
}
