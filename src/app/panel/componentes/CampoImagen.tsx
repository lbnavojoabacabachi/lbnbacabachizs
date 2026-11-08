'use client';

import { useState } from 'react';
import { subirImagen, type ImagenSubida } from '@/lib/imagenes/subir-cliente';
import { useCampo } from './Formulario';
import estilos from './formularios.module.css';

type Vista = { id: number; urlChica: string };

type Propiedades = {
  nombre: string;
  etiqueta: string;
  tipo: 'foto' | 'logo' | 'poster' | 'noticia' | 'patrocinador';
  actual?: Vista | null;
  ayuda?: string;
};

export function CampoImagen({ nombre, etiqueta, tipo, actual = null, ayuda }: Propiedades) {
  const { id, error } = useCampo(nombre);
  const [imagen, setImagen] = useState<Vista | null>(actual);
  const [estado, setEstado] = useState<'listo' | 'subiendo' | 'error'>('listo');
  const [mensaje, setMensaje] = useState('');

  async function elegir(archivo: File | undefined) {
    if (!archivo) return;
    setEstado('subiendo');
    setMensaje('Preparando y subiendo la imagen…');
    try {
      const subida: ImagenSubida = await subirImagen(archivo, tipo);
      setImagen({ id: subida.id, urlChica: subida.urlChica });
      setEstado('listo');
      setMensaje('Imagen lista. Guarda el formulario para usarla.');
    } catch (e) {
      setEstado('error');
      setMensaje(e instanceof Error ? e.message : 'No se pudo subir la imagen.');
    }
  }

  return (
    <div className={`${estilos.campo} ${estilos.completo}`}>
      <span className={estilos.etiqueta} id={`${id}-etiqueta`}>
        {etiqueta}
      </span>
      {ayuda && <span className={estilos.ayuda}>{ayuda}</span>}
      <div className={estilos.imagenCampo}>
        {imagen ? (
          <img src={imagen.urlChica} alt="" className={`${estilos.vistaImagen} ${tipo === 'logo' || tipo === 'patrocinador' ? estilos.vistaLogo : ''}`} />
        ) : (
          <span className={estilos.sinImagen}>Sin imagen</span>
        )}
        <div className={estilos.imagenAcciones}>
          <label htmlFor={id} className={estilos.botonChico}>
            {imagen ? 'Cambiar imagen' : 'Elegir imagen'}
          </label>
          <input
            id={id}
            type="file"
            accept="image/*"
            className={estilos.archivoOculto}
            aria-labelledby={`${id}-etiqueta`}
            disabled={estado === 'subiendo'}
            onChange={(e) => {
              void elegir(e.currentTarget.files?.[0]);
              e.currentTarget.value = '';
            }}
          />
          {imagen && (
            <button
              type="button"
              className={estilos.botonChico}
              onClick={() => {
                setImagen(null);
                setMensaje('Se quitará la imagen al guardar.');
              }}
            >
              Quitar
            </button>
          )}
        </div>
      </div>
      <input type="hidden" name={nombre} value={imagen?.id ?? ''} />
      {mensaje && (
        <span className={estado === 'error' ? estilos.errorCampo : estilos.ayuda} role={estado === 'error' ? 'alert' : 'status'}>
          {mensaje}
        </span>
      )}
      {error && <span className={estilos.errorCampo}>{error}</span>}
    </div>
  );
}
