'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { IconoAutomatico, IconoLuna, IconoSol } from '@/componentes/Iconos';
import { CLAVE_TEMA, temaGuardado, type Tema } from '@/lib/tema';
import estilos from './cabecera.module.css';

const OPCIONES: { tema: Tema; texto: string; icono: ReactNode }[] = [
  { tema: 'auto', texto: 'Automático', icono: <IconoAutomatico tamano={18} /> },
  { tema: 'claro', texto: 'Claro', icono: <IconoSol tamano={18} /> },
  { tema: 'oscuro', texto: 'Oscuro', icono: <IconoLuna tamano={18} /> },
];

const oyentes = new Set<() => void>();

function aplicarTema(tema: Tema) {
  const raiz = document.documentElement;
  if (tema === 'auto') delete raiz.dataset.tema;
  else raiz.dataset.tema = tema;
  oyentes.forEach((oyente) => oyente());
}

function guardarTema(tema: Tema) {
  try {
    if (tema === 'auto') localStorage.removeItem(CLAVE_TEMA);
    else localStorage.setItem(CLAVE_TEMA, tema);
  } catch {
    return;
  }
}

function suscribir(oyente: () => void) {
  const alCambiarEnOtraPestana = (evento: StorageEvent) => {
    if (evento.key === CLAVE_TEMA) aplicarTema(temaGuardado(evento.newValue));
  };
  oyentes.add(oyente);
  window.addEventListener('storage', alCambiarEnOtraPestana);
  return () => {
    oyentes.delete(oyente);
    window.removeEventListener('storage', alCambiarEnOtraPestana);
  };
}

const temaDeLaPagina = () => temaGuardado(document.documentElement.dataset.tema);
const temaDelServidor = (): Tema => 'auto';

export function SelectorTema() {
  const tema = useSyncExternalStore(suscribir, temaDeLaPagina, temaDelServidor);

  const elegir = (nuevo: Tema) => {
    guardarTema(nuevo);
    aplicarTema(nuevo);
  };

  return (
    <fieldset className={estilos.tema}>
      <legend className={estilos.temaTitulo}>Tema</legend>
      <div className={estilos.temaOpciones}>
        {OPCIONES.map((o) => (
          <label key={o.tema} className={estilos.temaOpcion} title={o.texto}>
            <input
              type="radio"
              name="tema"
              value={o.tema}
              checked={tema === o.tema}
              onChange={() => elegir(o.tema)}
              className={estilos.temaRadio}
            />
            <span className={estilos.temaCaja}>
              {o.icono}
              <span className={estilos.temaTexto}>{o.texto}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
