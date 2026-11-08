import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Encabezado } from '@/componentes/Encabezado';
import { Galeria } from '@/componentes/Galeria';
import { IconoAnterior } from '@/componentes/Iconos';
import { obtenerAlbum, obtenerAlbumes } from '@/lib/consultas/contenido';
import { capitalizar, formatearFecha } from '@/lib/fechas';
import { imagenParaCompartir } from '@/lib/imagenes/tamanos';
import { OPEN_GRAPH_BASE } from '@/lib/sitio';
import estilos from '../../publico.module.css';

type Parametros = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await obtenerAlbumes()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const album = await obtenerAlbum((await params).slug);
  if (!album) return {};
  return {
    title: album.titulo,
    description: album.descripcion ?? `${album.fotos.length} fotos: ${album.titulo}.`,
    alternates: { canonical: `/galeria/${album.slug}` },
    openGraph: album.portada
      ? { ...OPEN_GRAPH_BASE, images: [imagenParaCompartir(album.portada)] }
      : undefined,
  };
}

export default async function PaginaAlbum({ params }: Parametros) {
  const album = await obtenerAlbum((await params).slug);
  if (!album) notFound();
  return (
    <>
      <Encabezado antetitulo="Galería" titulo={album.titulo}>
        <p>
          {[album.fecha ? capitalizar(formatearFecha(album.fecha)) : null, `${album.fotos.length} fotos`].filter(Boolean).join(' · ')}
        </p>
        {album.descripcion && <p>{album.descripcion}</p>}
      </Encabezado>
      <Galeria fotos={album.fotos} titulo={album.titulo} />
      <Link prefetch={false} href="/galeria" className={estilos.enlaceMas}>
        <IconoAnterior tamano={16} />
        Todos los álbumes
      </Link>
    </>
  );
}
