import { IconoExterno, IconoReproducir } from '@/componentes/Iconos';
import type { PublicacionFacebook } from '@/lib/facebook';
import { formatearFecha, partesEnSonora } from '@/lib/fechas';
import estilos from './publicaciones-facebook.module.css';

export function PublicacionesFacebook({ publicaciones }: { publicaciones: PublicacionFacebook[] }) {
  return (
    <ul className={estilos.lista}>
      {publicaciones.map((p) => {
        const fecha = formatearFecha(partesEnSonora(new Date(p.fecha)).fecha);
        return (
          <li key={p.id} className={estilos.publicacion}>
            <p className={estilos.fecha}>
              <time dateTime={p.fecha}>{fecha}</time>
            </p>
            {p.imagen && (
              <div className={estilos.marco}>
                <img
                  src={p.imagen.url}
                  alt=""
                  width={p.imagen.ancho ?? undefined}
                  height={p.imagen.alto ?? undefined}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className={estilos.imagen}
                />
                {p.esVideo && (
                  <span className={estilos.video}>
                    <IconoReproducir tamano={14} />
                    Video
                  </span>
                )}
              </div>
            )}
            {p.texto && <p className={estilos.texto}>{p.texto}</p>}
            <a href={p.enlace} target="_blank" rel="noopener" className={estilos.enlace}>
              Ver en Facebook
              <IconoExterno tamano={16} />
              <span className="solo-lectores"> la publicación del {fecha} (se abre en otra pestaña)</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
