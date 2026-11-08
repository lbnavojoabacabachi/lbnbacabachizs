import { imagenes } from '@/db/esquema';

export const columnasImagen = {
  id: imagenes.id,
  tipo: imagenes.tipo,
  urlChica: imagenes.urlChica,
  urlMediana: imagenes.urlMediana,
  urlGrande: imagenes.urlGrande,
  ancho: imagenes.ancho,
  alto: imagenes.alto,
  colorFondo: imagenes.colorFondo,
};
