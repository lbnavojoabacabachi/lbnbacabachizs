import sharp from 'sharp';
import { LADOS, TIPOS_IMAGEN, type TipoImagen } from './tamanos';

export const MAXIMO_PIXELES_ENTRADA = 60_000_000;

const CALIDAD: Record<TipoImagen, number> = { foto: 74, noticia: 74, poster: 80, logo: 82, patrocinador: 82 };

const CUADRADAS = new Set<TipoImagen>(['logo', 'patrocinador']);

export type Variante = { ancho: number; alto: number; datos: Buffer };

export type ImagenProcesada = {
  variantes: Variante[];
  ancho: number;
  alto: number;
  colorFondo: string;
};

function leer(entrada: Buffer) {
  return sharp(entrada, { failOn: 'error', limitInputPixels: MAXIMO_PIXELES_ENTRADA }).rotate();
}

const TOLERANCIA_CUADRADO = 0.03;

export function esTipoImagen(valor: string): valor is TipoImagen {
  return (TIPOS_IMAGEN as readonly string[]).includes(valor);
}

async function ajusteCuadrado(entrada: Buffer): Promise<sharp.ResizeOptions> {
  const { data: base, info } = await leer(entrada).toBuffer({ resolveWithObject: true });
  if (Math.abs(info.width / info.height - 1) <= TOLERANCIA_CUADRADO) return { fit: 'cover', position: 'centre' };
  if (info.channels === 4) return { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } };
  const vertical = info.height > info.width;
  const grosor = Math.max(1, Math.round((vertical ? info.width : info.height) * 0.02));
  const franjas = vertical
    ? [
        { left: 0, top: 0, width: grosor, height: info.height },
        { left: info.width - grosor, top: 0, width: grosor, height: info.height },
      ]
    : [
        { left: 0, top: 0, width: info.width, height: grosor },
        { left: 0, top: info.height - grosor, width: info.width, height: grosor },
      ];
  const medias = await Promise.all(franjas.map(async (f) => (await sharp(base).extract(f).stats()).channels.map((c) => c.mean)));
  const canal = (i: number) => Math.round((medias[0][i] + medias[1][i]) / 2);
  return { fit: 'contain', background: { r: canal(0), g: canal(1), b: canal(2), alpha: 1 } };
}

export async function procesarImagen(entrada: Buffer, tipo: TipoImagen): Promise<ImagenProcesada> {
  const ajuste = CUADRADAS.has(tipo) ? await ajusteCuadrado(entrada) : null;
  const variantes = await Promise.all(
    LADOS[tipo].map(async (ancho) => {
      const { data, info } = await leer(entrada)
        .resize(
          ajuste
            ? { width: ancho, height: ancho, ...ajuste }
            : { width: ancho, height: ancho, fit: 'inside', withoutEnlargement: true },
        )
        .webp({ quality: CALIDAD[tipo], effort: 5 })
        .toBuffer({ resolveWithObject: true });
      return { ancho: info.width, alto: info.height, datos: data };
    }),
  );
  const { dominant } = await sharp(await leer(entrada).resize(64, 64, { fit: 'inside' }).toBuffer()).stats();
  const colorFondo = `#${[dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  const grande = variantes[variantes.length - 1];
  return { variantes, ancho: grande.ancho, alto: grande.alto, colorFondo };
}
