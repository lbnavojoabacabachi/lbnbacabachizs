import { eq, sql } from 'drizzle-orm';
import { db } from '@/db/conexion';
import { albumFotos, albumes, equipos, eventos, imagenes, noticias, patrocinadores } from '@/db/esquema';
import { borrarArchivos } from './almacen';

export async function imagenEnUso(imagenId: number) {
  const usos = await Promise.all([
    db.$count(albumFotos, eq(albumFotos.imagenId, imagenId)),
    db.$count(albumes, eq(albumes.portadaId, imagenId)),
    db.$count(noticias, eq(noticias.imagenId, imagenId)),
    db.$count(eventos, eq(eventos.posterId, imagenId)),
    db.$count(equipos, eq(equipos.logoId, imagenId)),
    db.$count(patrocinadores, eq(patrocinadores.logoId, imagenId)),
  ]);
  return usos.some((n) => n > 0);
}

export async function borrarImagenesSinUso(ids: number[]) {
  let borradas = 0;
  for (const imagenId of [...new Set(ids)]) {
    if (await imagenEnUso(imagenId)) continue;
    const [imagen] = await db.delete(imagenes).where(eq(imagenes.id, imagenId)).returning();
    if (!imagen) continue;
    await borrarArchivos([imagen.urlChica, imagen.urlMediana, imagen.urlGrande]).catch(() => undefined);
    borradas++;
  }
  return borradas;
}

export async function imagenesSinUso() {
  return db
    .select({ id: imagenes.id })
    .from(imagenes)
    .where(
      sql`not exists (select 1 from ${albumFotos} where ${albumFotos.imagenId} = ${imagenes.id})
        and not exists (select 1 from ${albumes} where ${albumes.portadaId} = ${imagenes.id})
        and not exists (select 1 from ${noticias} where ${noticias.imagenId} = ${imagenes.id})
        and not exists (select 1 from ${eventos} where ${eventos.posterId} = ${imagenes.id})
        and not exists (select 1 from ${equipos} where ${equipos.logoId} = ${imagenes.id})
        and not exists (select 1 from ${patrocinadores} where ${patrocinadores.logoId} = ${imagenes.id})
        and ${imagenes.creadaEn} < now() - interval '1 day'`,
    );
}
