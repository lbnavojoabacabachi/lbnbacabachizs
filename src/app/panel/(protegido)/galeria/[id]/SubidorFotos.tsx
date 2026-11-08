'use client';

import { useState } from 'react';
import estilosFormulario from '@/app/panel/componentes/formularios.module.css';
import { subirImagen } from '@/lib/imagenes/subir-cliente';
import { agregarFotoAlAlbum } from '../acciones';
import estilos from './album.module.css';

type Estado = { nombre: string; estado: 'esperando' | 'subiendo' | 'lista' | 'error'; mensaje?: string };

export function SubidorFotos({ albumId }: { albumId: number }) {
  const [cola, setCola] = useState<Estado[]>([]);
  const [ocupado, setOcupado] = useState(false);

  async function subir(archivos: File[]) {
    if (archivos.length === 0) return;
    setOcupado(true);
    setCola(archivos.map((a) => ({ nombre: a.name, estado: 'esperando' })));
    const cambiar = (i: number, cambio: Partial<Estado>) => setCola((c) => c.map((e, j) => (j === i ? { ...e, ...cambio } : e)));
    for (const [i, archivo] of archivos.entries()) {
      cambiar(i, { estado: 'subiendo' });
      try {
        const imagen = await subirImagen(archivo, 'foto');
        const resultado = await agregarFotoAlAlbum(albumId, imagen.id);
        if (resultado.resultado === 'error') throw new Error(resultado.mensaje);
        cambiar(i, { estado: 'lista' });
      } catch (e) {
        cambiar(i, { estado: 'error', mensaje: e instanceof Error ? e.message : 'No se pudo subir.' });
      }
    }
    setOcupado(false);
  }

  const listas = cola.filter((c) => c.estado === 'lista').length;

  return (
    <div className={estilos.subidor}>
      <label htmlFor="fotos-nuevas" className={estilosFormulario.boton}>
        {ocupado ? 'Subiendo…' : 'Elegir fotos'}
      </label>
      <input
        id="fotos-nuevas"
        type="file"
        accept="image/*"
        multiple
        disabled={ocupado}
        className={estilosFormulario.archivoOculto}
        onChange={(e) => {
          const archivos = [...(e.currentTarget.files ?? [])];
          e.currentTarget.value = '';
          void subir(archivos);
        }}
      />
      <p className={estilosFormulario.ayuda}>
        Puedes elegir varias a la vez. El celular las reduce antes de subirlas y el servidor quita la ubicación y los demás datos de la foto.
      </p>
      {cola.length > 0 && (
        <div role="status" className={estilos.cola}>
          <p>
            {listas} de {cola.length} fotos subidas
          </p>
          <ul>
            {cola.map((c, i) => (
              <li key={i} className={c.estado === 'error' ? estilosFormulario.errorCampo : undefined}>
                {c.nombre}: {c.estado === 'esperando' ? 'en espera' : c.estado === 'subiendo' ? 'subiendo…' : c.estado === 'lista' ? 'lista' : c.mensaje}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
