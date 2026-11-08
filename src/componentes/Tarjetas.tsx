import Link from 'next/link';
import estilos from '@/app/(publico)/publico.module.css';
import { formatearFecha, partesEnSonora } from '@/lib/fechas';
import type { ImagenPublica } from '@/lib/imagenes/tamanos';
import { Imagen } from './Imagen';

const TAMANOS_TARJETA = '(min-width: 1120px) 350px, (min-width: 640px) 45vw, calc(100vw - 32px)';

type Noticia = {
  id: number;
  titulo: string;
  slug: string;
  resumen: string | null;
  publicadaEn: Date | null;
  imagen: ImagenPublica | null;
};

export function TarjetaNoticia({ noticia, prioridad = false }: { noticia: Noticia; prioridad?: boolean }) {
  const fecha = noticia.publicadaEn ? partesEnSonora(noticia.publicadaEn).fecha : null;
  return (
    <li className={estilos.tarjeta}>
      <Link prefetch={false} href={`/noticias/${noticia.slug}`}>
        {noticia.imagen && (
          <Imagen imagen={noticia.imagen} alt="" sizes={TAMANOS_TARJETA} className={estilos.tarjetaCartel} prioridad={prioridad} sinGrande />
        )}
        {fecha && (
          <time dateTime={fecha} className={estilos.tarjetaDetalle}>
            {formatearFecha(fecha, { diaSemana: false })}
          </time>
        )}
        <h3 className={estilos.tarjetaTitulo}>{noticia.titulo}</h3>
      </Link>
      {noticia.resumen && <p>{noticia.resumen}</p>}
    </li>
  );
}

type Album = {
  id: number;
  titulo: string;
  slug: string;
  fecha: string | null;
  portada: ImagenPublica | null;
  fotos: number;
};

export function TarjetaAlbum({ album }: { album: Album }) {
  return (
    <li className={estilos.tarjeta}>
      <Link prefetch={false} href={`/galeria/${album.slug}`}>
        {album.portada && <Imagen imagen={album.portada} alt="" sizes={TAMANOS_TARJETA} className={estilos.tarjetaImagen} sinGrande />}
        <h3 className={estilos.tarjetaTitulo}>{album.titulo}</h3>
        <span className={estilos.tarjetaDetalle}>
          {[album.fecha ? formatearFecha(album.fecha, { diaSemana: false }) : null, `${album.fotos} ${album.fotos === 1 ? 'foto' : 'fotos'}`]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </Link>
    </li>
  );
}
