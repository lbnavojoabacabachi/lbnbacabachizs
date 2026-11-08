import type { CSSProperties } from 'react';
import { variantesDeImagen, type ImagenPublica } from '@/lib/imagenes/tamanos';

type Propiedades = {
  imagen: ImagenPublica;
  alt: string;
  sizes: string;
  className?: string;
  prioridad?: boolean;
  sinGrande?: boolean;
};

export function Imagen({ imagen, alt, sizes, className, prioridad = false, sinGrande = false }: Propiedades) {
  const variantes = variantesDeImagen(imagen).slice(0, sinGrande ? 2 : 3);
  const mayor = variantes[variantes.length - 1];
  const estilo: CSSProperties | undefined = imagen.colorFondo ? { backgroundColor: imagen.colorFondo } : undefined;
  return (
    <img
      src={variantes[1].url}
      srcSet={variantes.map((v) => `${v.url} ${v.ancho}w`).join(', ')}
      sizes={sizes}
      width={mayor.ancho}
      height={mayor.alto}
      alt={alt}
      className={className}
      style={estilo}
      loading={prioridad ? 'eager' : 'lazy'}
      fetchPriority={prioridad ? 'high' : undefined}
      decoding="async"
    />
  );
}
