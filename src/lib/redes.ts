import { NOMBRES_RED, type RedSocial } from './incrustar';

type Perfiles = {
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  tiktok: string | null;
} | null;

const ORDEN: Exclude<RedSocial, 'x'>[] = ['facebook', 'instagram', 'youtube', 'tiktok'];

export function perfilesDeRedes(configuracion: Perfiles) {
  if (!configuracion) return [];
  return ORDEN.flatMap((red) => {
    const url = configuracion[red];
    return url ? [{ red, url, nombre: NOMBRES_RED[red] }] : [];
  });
}
