'use server';

import { borrarImagenesSinUso, imagenesSinUso } from '@/lib/imagenes/limpiar';
import { accionDirecta, anotar } from '@/lib/panel/acciones';

export async function limpiarImagenes() {
  return accionDirecta(async (contexto) => {
    const candidatas = await imagenesSinUso();
    const borradas = await borrarImagenesSinUso(candidatas.map((c) => c.id));
    await anotar(contexto, 'limpiar', 'imagen', null, `Borró ${borradas} imágenes que no se usaban`);
    return `${borradas} imágenes borradas.`;
  });
}
