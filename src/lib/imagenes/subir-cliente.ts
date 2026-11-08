export const LADO_MAXIMO_SUBIDA = 2400;

const PNG_PEQUENO = 3 * 1024 * 1024;

export type ImagenSubida = {
  id: number;
  urlChica: string;
  urlMediana: string;
  urlGrande: string;
  ancho: number;
  alto: number;
  colorFondo: string | null;
};

export async function reducirImagen(archivo: File): Promise<File> {
  let mapa: ImageBitmap;
  try {
    mapa = await createImageBitmap(archivo, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('No se pudo leer la imagen. Súbela como JPG o PNG.');
  }
  const escala = Math.min(1, LADO_MAXIMO_SUBIDA / Math.max(mapa.width, mapa.height));
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.round(mapa.width * escala);
  lienzo.height = Math.round(mapa.height * escala);
  const contexto = lienzo.getContext('2d');
  if (!contexto) throw new Error('Este navegador no puede preparar la imagen.');
  contexto.drawImage(mapa, 0, 0, lienzo.width, lienzo.height);
  mapa.close();
  const tipo = archivo.type === 'image/png' && archivo.size <= PNG_PEQUENO ? 'image/png' : 'image/jpeg';
  const reducida = await new Promise<Blob>((resolver, rechazar) =>
    lienzo.toBlob((b) => (b ? resolver(b) : rechazar(new Error('No se pudo preparar la imagen.'))), tipo, 0.9),
  );
  const nombre = `${archivo.name.replace(/\.[^.]+$/, '')}.${tipo === 'image/png' ? 'png' : 'jpg'}`;
  return new File([reducida], nombre, { type: tipo });
}

export async function subirImagen(archivo: File, tipo: string): Promise<ImagenSubida> {
  const formulario = new FormData();
  formulario.append('archivo', await reducirImagen(archivo));
  formulario.append('tipo', tipo);
  const respuesta = await fetch('/api/imagenes', { method: 'POST', body: formulario });
  const cuerpo = (await respuesta.json().catch(() => ({}))) as Partial<ImagenSubida> & { error?: string };
  if (!respuesta.ok) throw new Error(cuerpo.error ?? 'No se pudo subir la imagen. Intenta de nuevo.');
  return cuerpo as ImagenSubida;
}
