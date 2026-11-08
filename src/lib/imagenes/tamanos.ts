export const TIPOS_IMAGEN = ['foto', 'logo', 'poster', 'noticia', 'patrocinador'] as const;
export type TipoImagen = (typeof TIPOS_IMAGEN)[number];

export const LADOS: Record<TipoImagen, readonly [number, number, number]> = {
  foto: [480, 960, 1600],
  noticia: [480, 960, 1600],
  poster: [480, 960, 1600],
  logo: [128, 256, 512],
  patrocinador: [128, 256, 512],
};

export type ImagenPublica = {
  id: number;
  tipo: TipoImagen;
  urlChica: string;
  urlMediana: string;
  urlGrande: string;
  ancho: number;
  alto: number;
  colorFondo: string | null;
};

export function variantesDeImagen(imagen: ImagenPublica) {
  const ladoMayor = Math.max(imagen.ancho, imagen.alto);
  const urls = [imagen.urlChica, imagen.urlMediana, imagen.urlGrande];
  return LADOS[imagen.tipo].map((lado, i) => {
    const escala = Math.min(1, lado / ladoMayor);
    return { url: urls[i], ancho: Math.round(imagen.ancho * escala), alto: Math.round(imagen.alto * escala) };
  });
}

export function imagenParaCompartir(imagen: Pick<ImagenPublica, 'id' | 'ancho' | 'alto'>) {
  const escala = Math.min(1, 1200 / Math.max(imagen.ancho, imagen.alto));
  return { url: `/compartir/${imagen.id}`, width: Math.round(imagen.ancho * escala), height: Math.round(imagen.alto * escala) };
}
