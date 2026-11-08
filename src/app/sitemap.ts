import type { MetadataRoute } from 'next';
import { obtenerAlbumes, obtenerNoticias } from '@/lib/consultas/contenido';
import { obtenerCalendario, obtenerEquipos, obtenerTemporadaVigente } from '@/lib/consultas/liga';
import { urlDelSitio } from '@/lib/sitio';

export const revalidate = 3600;

const FIJAS = [
  '/',
  '/calendario',
  '/posiciones',
  '/equipos',
  '/estadisticas',
  '/noticias',
  '/galeria',
  '/redes',
  '/en-vivo',
  '/altas-y-bajas',
  '/documentos',
  '/contacto',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const temporada = await obtenerTemporadaVigente();
  const [equipos, jornadas, noticias, albumes] = await Promise.all([
    temporada ? obtenerEquipos(temporada.id) : [],
    temporada ? obtenerCalendario(temporada.id) : [],
    obtenerNoticias(),
    obtenerAlbumes(),
  ]);
  return [
    ...FIJAS.map((ruta) => ({ url: urlDelSitio(ruta) })),
    ...jornadas.map((j) => ({ url: urlDelSitio(`/jornadas/${j.numero}`) })),
    ...equipos.map((e) => ({ url: urlDelSitio(`/equipos/${e.slug}`) })),
    ...noticias.map((n) => ({ url: urlDelSitio(`/noticias/${n.slug}`), lastModified: n.publicadaEn ?? undefined })),
    ...albumes.map((a) => ({ url: urlDelSitio(`/galeria/${a.slug}`) })),
  ];
}
