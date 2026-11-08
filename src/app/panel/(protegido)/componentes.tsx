import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import { IconoAnterior } from '@/componentes/Iconos';
import estilos from '../panel.module.css';

export function CabeceraPagina({
  antetitulo,
  titulo,
  children,
  accion,
}: {
  antetitulo?: string;
  titulo: string;
  children?: ReactNode;
  accion?: ReactNode;
}) {
  return (
    <header className={estilos.cabeceraPagina}>
      <div>
        {antetitulo && <p className={estilos.antetitulo}>{antetitulo}</p>}
        <h1 className={estilos.tituloPagina}>{titulo}</h1>
        {children}
      </div>
      {accion}
    </header>
  );
}

export function Volver<T extends string>({ href, texto }: { href: Route<T>; texto: string }) {
  return (
    <Link prefetch={false} href={href} className={estilos.enlaceVolver}>
      <IconoAnterior tamano={16} />
      {texto}
    </Link>
  );
}

export function SinTemporada() {
  return (
    <p className={estilos.aviso}>
      No hay una temporada vigente. Créala en{' '}
      <Link prefetch={false} href="/panel/calendario">
        Calendario
      </Link>
      .
    </p>
  );
}
