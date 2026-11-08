'use client';

import { useState } from 'react';
import type { Incrustacion } from '@/lib/incrustar';
import { NOMBRES_RED } from '@/lib/incrustar';
import { IconoReproducir } from './Iconos';
import estilos from './incrustado.module.css';

type Propiedades = {
  incrustacion: Incrustacion;
  titulo: string;
  accion: string;
  detalle?: string;
};

export function Incrustado({ incrustacion, titulo, accion, detalle }: Propiedades) {
  const [activo, setActivo] = useState(false);
  const red = NOMBRES_RED[incrustacion.red];
  return (
    <div className={`${estilos.marco} ${estilos[incrustacion.formato]} ${activo ? estilos.activo : ''}`}>
      {activo ? (
        <iframe
          src={incrustacion.src}
          title={`${titulo} (${red})`}
          className={estilos.iframe}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button type="button" className={estilos.portada} onClick={() => setActivo(true)}>
          <span className={estilos.icono}>
            <IconoReproducir tamano={30} />
          </span>
          <span className={estilos.textos}>
            <span className={estilos.accion}>{accion}</span>
            <span className={estilos.titulo}>{titulo}</span>
            <span className={estilos.detalle}>
              {detalle ? `${detalle} · ` : ''}Se abre {red} aquí mismo
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
