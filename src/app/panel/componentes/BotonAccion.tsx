'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { AccionDirecta } from '@/lib/panel/estado';
import estilos from './formularios.module.css';

type Propiedades<T extends string> = {
  accion: AccionDirecta;
  texto: string;
  confirmar?: string;
  peligro?: boolean;
  etiqueta?: string;
  destino?: Route<T>;
  mostrarResultado?: boolean;
};

export function BotonAccion<T extends string>({ accion, texto, confirmar, peligro = false, etiqueta, destino, mostrarResultado = false }: Propiedades<T>) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  return (
    <span className={estilos.accionEnLinea}>
      <button
        type="button"
        className={peligro ? estilos.botonPeligro : estilos.botonChico}
        disabled={pendiente}
        aria-label={etiqueta}
        onClick={() => {
          if (confirmar && !window.confirm(confirmar)) return;
          setError('');
          setAviso('');
          iniciar(async () => {
            const estado = await accion();
            if (estado.resultado === 'error') setError(estado.mensaje);
            else if (destino) router.push(destino);
            else if (mostrarResultado) setAviso(estado.mensaje);
          });
        }}
      >
        {pendiente ? 'Un momento…' : texto}
      </button>
      {error && (
        <span className={estilos.errorCampo} role="alert">
          {error}
        </span>
      )}
      {aviso && (
        <span className={estilos.ok} role="status">
          {aviso}
        </span>
      )}
    </span>
  );
}
