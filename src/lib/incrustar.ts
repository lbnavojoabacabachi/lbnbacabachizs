export type RedSocial = 'facebook' | 'instagram' | 'youtube' | 'tiktok' | 'x';
export type Formato = 'horizontal' | 'vertical' | 'publicacion';

export type Incrustacion = {
  red: Exclude<RedSocial, 'x'>;
  src: string;
  formato: Formato;
};

const HOSTS: Record<RedSocial, string[]> = {
  youtube: ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com'],
  facebook: ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'web.facebook.com', 'fb.watch'],
  instagram: ['instagram.com', 'www.instagram.com'],
  tiktok: ['tiktok.com', 'www.tiktok.com', 'm.tiktok.com'],
  x: ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com', 'mobile.twitter.com'],
};

export const NOMBRES_RED: Record<RedSocial, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  x: 'X',
};

const ID_YOUTUBE = /^[A-Za-z0-9_-]{11}$/;

export function leerUrl(texto: string) {
  try {
    const url = new URL(texto.trim());
    return url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

export function redDeUrl(texto: string): RedSocial | null {
  const url = leerUrl(texto);
  if (!url) return null;
  const host = url.hostname.toLowerCase();
  const red = (Object.keys(HOSTS) as RedSocial[]).find((r) => HOSTS[r].includes(host));
  return red ?? null;
}

function incrustarYoutube(url: URL): Incrustacion | null {
  const partes = url.pathname.split('/').filter(Boolean);
  let id: string | null = null;
  let formato: Formato = 'horizontal';
  if (url.hostname === 'youtu.be') id = partes[0] ?? null;
  else if (partes[0] === 'watch') id = url.searchParams.get('v');
  else if (['live', 'embed', 'shorts'].includes(partes[0] ?? '')) {
    id = partes[1] ?? null;
    if (partes[0] === 'shorts') formato = 'vertical';
  }
  if (!id || !ID_YOUTUBE.test(id)) return null;
  return { red: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`, formato };
}

function incrustarFacebook(url: URL, comoVideo: boolean): Incrustacion | null {
  const ruta = url.pathname.toLowerCase();
  const esVideo =
    url.hostname === 'fb.watch' || ruta.includes('/videos/') || ruta.startsWith('/watch') || ruta.startsWith('/reel/');
  const esPublicacion = ruta.includes('/posts/') || ruta.startsWith('/permalink.php') || ruta.startsWith('/photo');
  if (comoVideo && !esVideo) return null;
  if (!esVideo && !esPublicacion && !ruta.startsWith('/share/')) return null;
  const direccion = encodeURIComponent(url.toString());
  if (esVideo) {
    return {
      red: 'facebook',
      src: `https://www.facebook.com/plugins/video.php?href=${direccion}&show_text=false&autoplay=true`,
      formato: ruta.startsWith('/reel/') ? 'vertical' : 'horizontal',
    };
  }
  return {
    red: 'facebook',
    src: `https://www.facebook.com/plugins/post.php?href=${direccion}&show_text=true&width=500`,
    formato: 'publicacion',
  };
}

function incrustarInstagram(url: URL): Incrustacion | null {
  const [tipo, id] = url.pathname.split('/').filter(Boolean);
  if (!['p', 'reel', 'tv'].includes(tipo ?? '') || !id || !/^[A-Za-z0-9_-]+$/.test(id)) return null;
  return { red: 'instagram', src: `https://www.instagram.com/${tipo}/${id}/embed`, formato: 'publicacion' };
}

function incrustarTiktok(url: URL): Incrustacion | null {
  const coincidencia = url.pathname.match(/\/video\/(\d{8,25})/);
  if (!coincidencia) return null;
  return { red: 'tiktok', src: `https://www.tiktok.com/embed/v2/${coincidencia[1]}`, formato: 'vertical' };
}

export function incrustacionDeTransmision(texto: string): Incrustacion | null {
  const url = leerUrl(texto);
  const red = redDeUrl(texto);
  if (!url) return null;
  if (red === 'youtube') return incrustarYoutube(url);
  if (red === 'facebook') return incrustarFacebook(url, true);
  return null;
}

export function incrustacionDePublicacion(texto: string): Incrustacion | null {
  const url = leerUrl(texto);
  const red = redDeUrl(texto);
  if (!url || !red) return null;
  if (red === 'youtube') return incrustarYoutube(url);
  if (red === 'facebook') return incrustarFacebook(url, false);
  if (red === 'instagram') return incrustarInstagram(url);
  if (red === 'tiktok') return incrustarTiktok(url);
  return null;
}
