'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authCliente } from '@/lib/auth-cliente';
import estilos from './panel.module.css';

export function BotonSalir() {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);

  async function salir() {
    setSaliendo(true);
    await authCliente.signOut();
    router.replace('/panel/entrar');
    router.refresh();
  }

  return (
    <button type="button" className={estilos.botonSecundario} onClick={salir} disabled={saliendo}>
      {saliendo ? 'Saliendo…' : 'Salir'}
    </button>
  );
}
