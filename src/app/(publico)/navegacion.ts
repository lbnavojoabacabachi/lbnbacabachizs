import type { Route } from 'next';

export type Enlace = { href: Route; texto: string };

export const PRINCIPALES: Enlace[] = [
  { href: '/calendario', texto: 'Calendario' },
  { href: '/posiciones', texto: 'Posiciones' },
  { href: '/equipos', texto: 'Equipos' },
  { href: '/estadisticas', texto: 'Estadísticas' },
  { href: '/noticias', texto: 'Noticias' },
  { href: '/galeria', texto: 'Galería' },
  { href: '/redes', texto: 'Redes' },
  { href: '/en-vivo', texto: 'En vivo' },
];

export const SECUNDARIAS: Enlace[] = [
  { href: '/altas-y-bajas', texto: 'Altas y bajas' },
  { href: '/documentos', texto: 'Documentos' },
  { href: '/contacto', texto: 'Contacto' },
];
