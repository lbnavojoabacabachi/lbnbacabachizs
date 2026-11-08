import { cache } from 'react';

const API_FACEBOOK = process.env.FACEBOOK_API_URL ?? 'https://graph.facebook.com/v26.0';
const CAMPOS = 'message,created_time,permalink_url,full_picture,attachments{media_type,media}';
const SEGUNDOS_ENTRE_ACTUALIZACIONES = 1800;
const ESPERA_MAXIMA_MS = 8000;

export const MAXIMO_PUBLICACIONES_FACEBOOK = 9;

export type PublicacionFacebook = {
  id: string;
  texto: string | null;
  fecha: string;
  enlace: string;
  imagen: { url: string; ancho: number | null; alto: number | null } | null;
  esVideo: boolean;
};

type AdjuntoApi = {
  media_type?: unknown;
  media?: { image?: { src?: unknown; width?: unknown; height?: unknown } };
};

type PublicacionApi = {
  id?: unknown;
  message?: unknown;
  created_time?: unknown;
  permalink_url?: unknown;
  full_picture?: unknown;
  attachments?: { data?: AdjuntoApi[] };
};

function urlSegura(valor: unknown) {
  if (typeof valor !== 'string') return null;
  try {
    const url = new URL(valor);
    return url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

function esDeFacebook(url: URL) {
  return url.hostname === 'facebook.com' || url.hostname.endsWith('.facebook.com');
}

function dimension(valor: unknown) {
  return typeof valor === 'number' && Number.isInteger(valor) && valor > 0 ? valor : null;
}

function imagenDe(publicacion: PublicacionApi, adjunto: AdjuntoApi | undefined) {
  const imagen = adjunto?.media?.image;
  const delAdjunto = urlSegura(imagen?.src);
  if (delAdjunto) return { url: delAdjunto.href, ancho: dimension(imagen?.width), alto: dimension(imagen?.height) };
  const completa = urlSegura(publicacion.full_picture);
  return completa ? { url: completa.href, ancho: null, alto: null } : null;
}

function publicacionDe(publicacion: PublicacionApi): PublicacionFacebook[] {
  const enlace = urlSegura(publicacion.permalink_url);
  const fecha = typeof publicacion.created_time === 'string' ? new Date(publicacion.created_time) : null;
  if (typeof publicacion.id !== 'string' || !enlace || !esDeFacebook(enlace) || !fecha || Number.isNaN(fecha.getTime())) return [];
  const texto = typeof publicacion.message === 'string' && publicacion.message.trim() ? publicacion.message.trim() : null;
  const adjunto = publicacion.attachments?.data?.[0];
  const imagen = imagenDe(publicacion, adjunto);
  if (!texto && !imagen) return [];
  return [{ id: publicacion.id, texto, fecha: fecha.toISOString(), enlace: enlace.href, imagen, esVideo: adjunto?.media_type === 'video' }];
}

export function publicacionesDeRespuesta(respuesta: unknown, maximo = MAXIMO_PUBLICACIONES_FACEBOOK) {
  const datos = typeof respuesta === 'object' && respuesta !== null ? (respuesta as { data?: unknown }).data : null;
  if (!Array.isArray(datos)) return [];
  return datos.flatMap((p) => (typeof p === 'object' && p !== null ? publicacionDe(p as PublicacionApi) : [])).slice(0, maximo);
}

export const obtenerPublicacionesDeFacebook = cache(async (): Promise<PublicacionFacebook[] | null> => {
  const token = process.env.FACEBOOK_TOKEN_PAGINA;
  if (!token) return null;
  const parametros = new URLSearchParams({ fields: CAMPOS, limit: String(MAXIMO_PUBLICACIONES_FACEBOOK + 3) });
  try {
    const respuesta = await fetch(`${API_FACEBOOK}/me/posts?${parametros}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(ESPERA_MAXIMA_MS),
      next: { revalidate: SEGUNDOS_ENTRE_ACTUALIZACIONES },
    });
    const cuerpo = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
      console.error(`Facebook respondió ${respuesta.status}: ${cuerpo?.error?.message ?? 'sin detalle'}`);
      return null;
    }
    return publicacionesDeRespuesta(cuerpo);
  } catch (error) {
    console.error('No se pudieron traer las publicaciones de Facebook:', error instanceof Error ? error.message : error);
    return null;
  }
});
