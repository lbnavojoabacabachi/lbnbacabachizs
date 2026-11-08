import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const TAMANO_IMAGEN_COMPARTIR = { width: 1200, height: 630 };

export const COLORES_COMPARTIR = {
  pizarra: '#1b2c55',
  placa: '#24386a',
  texto: '#ffffff',
  suave: '#b9c3d8',
  rojo: '#c8202f',
  logo: '#ffffff',
};

export async function fuentesCompartir() {
  const [display, texto, negrita] = await Promise.all([
    readFile(join(process.cwd(), 'assets/fuentes/BigShoulders-ExtraBold.ttf')),
    readFile(join(process.cwd(), 'assets/fuentes/SofiaSansSemiCondensed-Regular.ttf')),
    readFile(join(process.cwd(), 'assets/fuentes/SofiaSansSemiCondensed-Bold.ttf')),
  ]);
  return [
    { name: 'Big Shoulders', data: display, weight: 800 as const, style: 'normal' as const },
    { name: 'Sofia Sans Semi Condensed', data: texto, weight: 400 as const, style: 'normal' as const },
    { name: 'Sofia Sans Semi Condensed', data: negrita, weight: 700 as const, style: 'normal' as const },
  ];
}

export async function logoCompartir() {
  const datos = await readFile(join(process.cwd(), 'assets/og/logo-liga-192.png'));
  return `data:image/png;base64,${datos.toString('base64')}`;
}
