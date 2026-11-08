'use client';

import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import estilos from '@/app/panel/componentes/formularios.module.css';

export function SubirDocumento() {
  const router = useRouter();
  const prefijo = useId().replace(/:/g, '');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  async function enviar(formulario: HTMLFormElement) {
    setEnviando(true);
    setMensaje(null);
    try {
      const respuesta = await fetch('/api/documentos', { method: 'POST', body: new FormData(formulario) });
      const cuerpo = (await respuesta.json().catch(() => ({}))) as { error?: string };
      if (!respuesta.ok) throw new Error(cuerpo.error ?? 'No se pudo subir el documento.');
      formulario.reset();
      setMensaje({ ok: true, texto: 'Documento publicado.' });
      router.refresh();
    } catch (e) {
      setMensaje({ ok: false, texto: e instanceof Error ? e.message : 'No se pudo subir el documento.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      className={estilos.formulario}
      onSubmit={(e) => {
        e.preventDefault();
        void enviar(e.currentTarget);
      }}
    >
      <div className={estilos.campo}>
        <label htmlFor={`${prefijo}-titulo`} className={estilos.etiqueta}>
          Título
        </label>
        <input id={`${prefijo}-titulo`} name="titulo" required maxLength={140} className={estilos.entrada} placeholder="Reglamento 2025-2026" />
      </div>
      <div className={estilos.campo}>
        <label htmlFor={`${prefijo}-archivo`} className={estilos.etiqueta}>
          Archivo PDF
        </label>
        <span id={`${prefijo}-ayuda`} className={estilos.ayuda}>
          Hasta 4 MB.
        </span>
        <input
          id={`${prefijo}-archivo`}
          name="archivo"
          type="file"
          accept="application/pdf"
          required
          aria-describedby={`${prefijo}-ayuda`}
          className={estilos.entrada}
        />
      </div>
      <div className={estilos.pieFormulario}>
        <button type="submit" className={estilos.boton} disabled={enviando}>
          {enviando ? 'Subiendo…' : 'Subir y publicar'}
        </button>
        {mensaje && (
          <p className={mensaje.ok ? estilos.ok : estilos.error} role={mensaje.ok ? 'status' : 'alert'}>
            {mensaje.texto}
          </p>
        )}
      </div>
    </form>
  );
}
