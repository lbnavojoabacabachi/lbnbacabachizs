import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CompartirEnFacebook } from '@/componentes/Compartir';
import { IconoAnterior } from '@/componentes/Iconos';
import { Imagen } from '@/componentes/Imagen';
import { obtenerNoticia, obtenerNoticias } from '@/lib/consultas/contenido';
import { formatearFecha, partesEnSonora } from '@/lib/fechas';
import { imagenParaCompartir } from '@/lib/imagenes/tamanos';
import { OPEN_GRAPH_BASE } from '@/lib/sitio';
import estilos from '../../publico.module.css';
import estilosNoticia from './noticia.module.css';

type Parametros = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await obtenerNoticias()).map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const noticia = await obtenerNoticia((await params).slug);
  if (!noticia) return {};
  return {
    title: noticia.titulo,
    description: noticia.resumen ?? noticia.cuerpo.slice(0, 160),
    alternates: { canonical: `/noticias/${noticia.slug}` },
    openGraph: {
      ...OPEN_GRAPH_BASE,
      type: 'article',
      publishedTime: noticia.publicadaEn?.toISOString(),
      images: noticia.imagen
        ? [imagenParaCompartir(noticia.imagen)]
        : undefined,
    },
  };
}

export default async function PaginaNoticia({ params }: Parametros) {
  const noticia = await obtenerNoticia((await params).slug);
  if (!noticia) notFound();
  const fecha = noticia.publicadaEn ? partesEnSonora(noticia.publicadaEn).fecha : null;
  const parrafos = noticia.cuerpo.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <article className={estilosNoticia.articulo}>
      <header className={estilos.encabezado}>
        {fecha && (
          <p className={estilos.antetitulo}>
            <time dateTime={fecha}>{formatearFecha(fecha)}</time>
          </p>
        )}
        <h1 className={estilos.titulo}>{noticia.titulo}</h1>
        {noticia.resumen && <p className={estilos.entradilla}>{noticia.resumen}</p>}
      </header>
      <div className={estilosNoticia.cuerpo}>
        {noticia.imagen && (
          <Imagen
            imagen={noticia.imagen}
            alt={`Imagen de la noticia: ${noticia.titulo}`}
            sizes="(min-width: 900px) 420px, calc(100vw - 32px)"
            className={estilosNoticia.imagen}
            prioridad
          />
        )}
        <div className={estilos.texto}>
          {parrafos.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className={estilos.acciones}>
            <CompartirEnFacebook ruta={`/noticias/${noticia.slug}`} />
          </div>
        </div>
      </div>
      <Link prefetch={false} href="/noticias" className={estilos.enlaceMas}>
        <IconoAnterior tamano={16} />
        Todas las noticias
      </Link>
    </article>
  );
}
