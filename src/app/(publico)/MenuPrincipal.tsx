'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IconoCerrar, IconoMenu } from '@/componentes/Iconos';
import { PRINCIPALES, SECUNDARIAS, type Enlace } from './navegacion';
import estilos from './cabecera.module.css';
import { SelectorTema } from './SelectorTema';

function esActual(ruta: string, enlace: Enlace) {
  return ruta === enlace.href || ruta.startsWith(`${enlace.href}/`);
}

export function MenuPrincipal({ enVivo }: { enVivo: boolean }) {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [rutaAbierta, setRutaAbierta] = useState(ruta);

  if (ruta !== rutaAbierta) {
    setRutaAbierta(ruta);
    setAbierto(false);
  }

  useEffect(() => {
    if (!abierto) return;
    const cerrarConEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    document.addEventListener('keydown', cerrarConEscape);
    return () => document.removeEventListener('keydown', cerrarConEscape);
  }, [abierto]);

  const enlace = (e: Enlace, secundario = false) => {
    const actual = esActual(ruta, e);
    const vivo = e.href === '/en-vivo' && enVivo;
    return (
      <li key={e.href} className={secundario ? estilos.secundario : undefined}>
        <Link
          prefetch={false}
          href={e.href}
          className={`${estilos.enlace} ${vivo ? estilos.enlaceVivo : ''}`}
          aria-current={actual ? 'page' : undefined}
        >
          {vivo && <span className={estilos.punto} aria-hidden="true" />}
          {e.texto}
          {vivo && <span className="solo-lectores">, transmitiendo ahora</span>}
        </Link>
      </li>
    );
  };

  return (
    <nav className={estilos.nav} aria-label="Principal">
      <button
        type="button"
        className={estilos.botonMenu}
        aria-expanded={abierto}
        aria-controls="menu-principal"
        onClick={() => setAbierto((a) => !a)}
      >
        {abierto ? <IconoCerrar /> : <IconoMenu />}
        {abierto ? 'Cerrar' : 'Menú'}
        {enVivo && !abierto && <span className={estilos.punto} aria-hidden="true" />}
      </button>
      <div id="menu-principal" className={`${estilos.desplegable} ${abierto ? estilos.abierto : ''}`}>
        <ul className={estilos.lista}>
          {PRINCIPALES.map((e) => enlace(e))}
          {SECUNDARIAS.map((e) => enlace(e, true))}
        </ul>
        <SelectorTema />
      </div>
    </nav>
  );
}
