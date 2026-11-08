import type { ImagenPublica } from '@/lib/imagenes/tamanos';
import { Imagen } from './Imagen';
import estilos from './escudo.module.css';

type Propiedades = {
  logo: ImagenPublica | null;
  nombre: string;
  tamano: number;
  className?: string;
  prioridad?: boolean;
};

export function Escudo({ logo, nombre, tamano, className, prioridad }: Propiedades) {
  const clases = [estilos.escudo, className].filter(Boolean).join(' ');
  if (!logo) {
    return (
      <span className={`${clases} ${estilos.sinLogo}`} style={{ width: tamano, height: tamano }} aria-hidden="true">
        {nombre.charAt(0)}
      </span>
    );
  }
  return (
    <Imagen
      imagen={{ ...logo, colorFondo: null }}
      alt=""
      sizes={`${tamano}px`}
      className={clases}
      prioridad={prioridad}
    />
  );
}
