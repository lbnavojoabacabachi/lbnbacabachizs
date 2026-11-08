'use client';

import { useRef, useState } from 'react';
import type { ImagenPublica } from '@/lib/imagenes/tamanos';
import { IconoAnterior, IconoCerrar, IconoFlecha } from './Iconos';
import { Imagen } from './Imagen';
import estilos from './galeria.module.css';

export type FotoGaleria = { id: number; pie: string | null; imagen: ImagenPublica };

export function Galeria({ fotos, titulo }: { fotos: FotoGaleria[]; titulo: string }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [indice, setIndice] = useState<number | null>(null);
  const total = fotos.length;
  const descripcion = (i: number) => fotos[i].pie ?? `Foto ${i + 1} de ${total}, ${titulo}`;

  const abrir = (i: number) => {
    setIndice(i);
    dialogo.current?.showModal();
  };
  const mover = (paso: number) => setIndice((actual) => (actual === null ? null : (actual + paso + total) % total));
  const actual = indice === null ? null : fotos[indice];

  return (
    <>
      <ul className={estilos.cuadricula}>
        {fotos.map((foto, i) => (
          <li key={foto.id}>
            <button type="button" className={estilos.miniatura} onClick={() => abrir(i)} aria-label={`Ampliar: ${descripcion(i)}`}>
              <Imagen
                imagen={foto.imagen}
                alt=""
                sizes="(min-width: 1120px) 270px, (min-width: 720px) 33vw, 50vw"
                className={estilos.imagenMiniatura}
                prioridad={i < 4}
              />
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialogo}
        className={estilos.dialogo}
        aria-label={actual && indice !== null ? descripcion(indice) : titulo}
        onClose={() => setIndice(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') mover(1);
          if (e.key === 'ArrowLeft') mover(-1);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogo.current?.close();
        }}
      >
        {actual && indice !== null && (
          <figure className={estilos.ampliada}>
            <Imagen key={actual.id} imagen={actual.imagen} alt={descripcion(indice)} sizes="100vw" className={estilos.imagenAmpliada} prioridad />
            <figcaption className={estilos.pie}>
              <span>{actual.pie ?? titulo}</span>
              <span className={estilos.contador}>
                {indice + 1} de {total}
              </span>
            </figcaption>
            <div className={estilos.controles}>
              <button type="button" className={estilos.control} onClick={() => mover(-1)}>
                <IconoAnterior />
                Anterior
              </button>
              <button type="button" className={estilos.control} onClick={() => mover(1)}>
                Siguiente
                <IconoFlecha />
              </button>
              <a className={estilos.control} href={actual.imagen.urlGrande} target="_blank" rel="noopener">
                Tamaño completo
              </a>
              <button type="button" className={`${estilos.control} ${estilos.cerrar}`} onClick={() => dialogo.current?.close()} autoFocus>
                <IconoCerrar />
                Cerrar
              </button>
            </div>
          </figure>
        )}
      </dialog>
    </>
  );
}
