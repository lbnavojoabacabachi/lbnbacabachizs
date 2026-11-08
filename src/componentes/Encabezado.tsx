import type { ReactNode } from 'react';
import estilos from '@/app/(publico)/publico.module.css';

type Propiedades = { antetitulo?: string | null; titulo: string; children?: ReactNode };

export function Encabezado({ antetitulo, titulo, children }: Propiedades) {
  return (
    <header className={estilos.encabezado}>
      {antetitulo && <p className={estilos.antetitulo}>{antetitulo}</p>}
      <h1 className={estilos.titulo}>{titulo}</h1>
      {children && <div className={estilos.entradilla}>{children}</div>}
    </header>
  );
}

export function Vacio({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className={estilos.vacio}>
      <b>{titulo}</b>
      {children}
    </div>
  );
}
