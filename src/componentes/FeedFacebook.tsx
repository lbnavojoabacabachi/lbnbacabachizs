'use client';

import { useEffect, useRef, useState } from 'react';
import estilos from './feed-facebook.module.css';

const ANCHO_MINIMO = 180;
const ANCHO_MAXIMO = 500;
const ALTO = 600;

function direccionDelFeed(pagina: string, ancho: number) {
  const parametros = new URLSearchParams({
    href: pagina,
    tabs: 'timeline',
    width: String(ancho),
    height: String(ALTO),
    small_header: 'true',
    adapt_container_width: 'true',
    hide_cover: 'false',
    show_facepile: 'false',
    locale: 'es_LA',
  });
  return `https://www.facebook.com/plugins/page.php?${parametros}`;
}

export function FeedFacebook({ pagina }: { pagina: string }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState<number | null>(null);

  useEffect(() => {
    const elemento = contenedor.current;
    if (!elemento) return;
    const observador = new ResizeObserver(([entrada]) => {
      const disponible = Math.floor(entrada.contentRect.width);
      setAncho(Math.min(ANCHO_MAXIMO, Math.max(ANCHO_MINIMO, disponible)));
    });
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <div ref={contenedor} className={estilos.feed} style={{ height: ALTO }}>
      {ancho !== null && (
        <iframe
          src={direccionDelFeed(pagina, ancho)}
          title="Publicaciones de la liga en Facebook"
          width={ancho}
          height={ALTO}
          loading="lazy"
          className={estilos.iframe}
          allow="encrypted-media; clipboard-write"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
    </div>
  );
}
