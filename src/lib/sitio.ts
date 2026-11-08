export const NOMBRE_SITIO = 'Liga de Beisbol Navojoa Ejidal, Zona Sur Bacabachi';

export const URL_SITIO = new URL(process.env.SITIO_URL ?? 'https://ligabeisbolbacabachi.com');

export function urlDelSitio(ruta: string) {
  return new URL(ruta, URL_SITIO).toString();
}

export const OPEN_GRAPH_BASE = { siteName: NOMBRE_SITIO, locale: 'es_MX' };
