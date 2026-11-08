import { randomBytes } from 'node:crypto';
import { db } from '@/db/conexion';
import { imagenes } from '@/db/esquema';
import { borrarArchivos, guardarArchivo } from './almacen';
import { procesarImagen } from './procesar';
import type { TipoImagen } from './tamanos';

const SUFIJOS = ['c', 'm', 'g'] as const;

export type NuevaImagen = {
  datos: Buffer;
  tipo: TipoImagen;
  nombreOriginal: string | null;
  usuarioId: string | null;
};

export async function registrarImagen({ datos, tipo, nombreOriginal, usuarioId }: NuevaImagen) {
  const procesada = await procesarImagen(datos, tipo);
  const hoy = new Date();
  const carpeta = `imagenes/${tipo}/${hoy.getUTCFullYear()}/${String(hoy.getUTCMonth() + 1).padStart(2, '0')}`;
  const clave = randomBytes(9).toString('base64url');
  const urls: string[] = [];
  try {
    for (const [i, variante] of procesada.variantes.entries()) {
      urls.push(await guardarArchivo(`${carpeta}/${clave}-${SUFIJOS[i]}.webp`, variante.datos, 'image/webp'));
    }
    const [fila] = await db
      .insert(imagenes)
      .values({
        tipo,
        urlChica: urls[0],
        urlMediana: urls[1],
        urlGrande: urls[2],
        ancho: procesada.ancho,
        alto: procesada.alto,
        colorFondo: procesada.colorFondo,
        nombreOriginal,
        bytesOriginal: datos.length,
        creadaPorId: usuarioId,
      })
      .returning();
    return { ...fila, bytesVariantes: procesada.variantes.reduce((suma, v) => suma + v.datos.length, 0) };
  } catch (error) {
    await borrarArchivos(urls);
    throw error;
  }
}
