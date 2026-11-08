import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { borrarArchivos, guardarArchivo, rutaLocalSegura } from '@/lib/imagenes/almacen';
import { procesarImagen } from '@/lib/imagenes/procesar';

const foto = (ancho: number, alto: number, orientacion?: number) =>
  sharp({ create: { width: ancho, height: alto, channels: 3, background: { r: 200, g: 40, b: 50 } } })
    .jpeg({ quality: 90 })
    .withMetadata({ orientation: orientacion })
    .withExif({ IFD0: { Copyright: 'Liga', Artist: 'Celular de prueba' } })
    .toBuffer();

describe('procesarImagen', () => {
  it('crea tres tamaños WebP sin metadatos', async () => {
    const r = await procesarImagen(await foto(3000, 2000), 'foto');
    expect(r.variantes.map((v) => [v.ancho, v.alto])).toEqual([
      [480, 320],
      [960, 640],
      [1600, 1067],
    ]);
    for (const v of r.variantes) {
      const meta = await sharp(v.datos).metadata();
      expect(meta.format).toBe('webp');
      expect(meta.exif).toBeUndefined();
      expect(meta.xmp).toBeUndefined();
    }
    expect(r.colorFondo).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('endereza según la orientación del celular y limita el lado más largo', async () => {
    const r = await procesarImagen(await foto(2400, 1600, 6), 'foto');
    expect(r.variantes.map((v) => [v.ancho, v.alto])).toEqual([
      [320, 480],
      [640, 960],
      [1067, 1600],
    ]);
  });

  it('no agranda fotos pequeñas', async () => {
    const r = await procesarImagen(await foto(300, 200), 'noticia');
    expect(r.variantes.every((v) => v.ancho === 300)).toBe(true);
  });

  it('los logotipos quedan cuadrados', async () => {
    const r = await procesarImagen(await foto(893, 1170), 'logo');
    expect(r.variantes.map((v) => [v.ancho, v.alto])).toEqual([
      [128, 128],
      [256, 256],
      [512, 512],
    ]);
  });

  it('un logotipo vertical se completa a cuadrado sin recortarse', async () => {
    const vertical = await sharp({ create: { width: 400, height: 800, channels: 3, background: '#ffffff' } })
      .composite([{ input: await sharp({ create: { width: 400, height: 60, channels: 3, background: '#d01020' } }).png().toBuffer(), top: 0, left: 0 }])
      .jpeg()
      .toBuffer();
    const r = await procesarImagen(vertical, 'logo');
    const { data } = await sharp(r.variantes[0].datos).raw().toBuffer({ resolveWithObject: true });
    const pixel = (x: number, y: number) => [...data.subarray((y * 128 + x) * 3, (y * 128 + x) * 3 + 3)];
    const [rojo, verde] = pixel(64, 3);
    expect(rojo).toBeGreaterThan(150);
    expect(verde).toBeLessThan(90);
  });

  it('rechaza lo que no es imagen', async () => {
    await expect(procesarImagen(Buffer.from('no soy una foto'), 'foto')).rejects.toThrow();
  });
});

describe('almacén local', () => {
  let carpeta: string;
  beforeAll(() => {
    carpeta = mkdtempSync(join(tmpdir(), 'liga-'));
    vi.spyOn(process, 'cwd').mockReturnValue(carpeta);
    delete process.env.BLOB_READ_WRITE_TOKEN;
  });
  afterAll(() => {
    vi.restoreAllMocks();
    rmSync(carpeta, { recursive: true, force: true });
  });

  it('guarda, sirve por /medios y borra', async () => {
    const url = await guardarArchivo('imagenes/foto/2026/11/abc-c.webp', Buffer.from('x'), 'image/webp');
    expect(url).toBe('/medios/imagenes/foto/2026/11/abc-c.webp');
    const ruta = rutaLocalSegura('imagenes/foto/2026/11/abc-c.webp');
    expect(existsSync(ruta)).toBe(true);
    await borrarArchivos([url]);
    expect(existsSync(ruta)).toBe(false);
  });

  it('no deja salir de la carpeta de medios', () => {
    expect(() => rutaLocalSegura('../.env.local')).toThrow();
    expect(() => rutaLocalSegura('imagenes/../../secreto')).toThrow();
  });
});
