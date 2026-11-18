'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { IconoCerrar, IconoMenu } from '@/componentes/Iconos';
import estilos from '../componentes/panel-marco.module.css';
import type { Rol } from '@/lib/roles';
import { seccionesDe } from './secciones';

const GRUPOS = ['Juegos', 'Liga', 'Contenido', 'Sitio'] as const;

export function MenuPanel({ rol }: { rol: Rol }) {
  const ruta = usePathname();
  const secciones = seccionesDe(rol);
  const [abierto, setAbierto] = useState(false);
  const [rutaAbierta, setRutaAbierta] = useState(ruta);
  if (ruta !== rutaAbierta) {
    setRutaAbierta(ruta);
    setAbierto(false);
  }
  const actual = secciones.find((s) => ruta === s.href || ruta.startsWith(`${s.href}/`));

  return (
    <nav className={estilos.menu} aria-label="Secciones del panel">
      <button
        type="button"
        className={estilos.botonMenu}
        aria-expanded={abierto}
        aria-controls="secciones-panel"
        onClick={() => setAbierto((a) => !a)}
      >
        {abierto ? <IconoCerrar /> : <IconoMenu />}
        <span>{abierto ? 'Cerrar' : actual ? actual.texto : 'Secciones'}</span>
      </button>
      <div id="secciones-panel" className={`${estilos.listaMenu} ${abierto ? estilos.abierto : ''}`}>
        {rol === 'administrador' && (
          <Link prefetch={false} href="/panel" className={estilos.enlaceMenu} aria-current={ruta === '/panel' ? 'page' : undefined}>
            Inicio
          </Link>
        )}
        {GRUPOS.filter((grupo) => secciones.some((s) => s.grupo === grupo)).map((grupo) => (
          <div key={grupo} className={estilos.grupoMenu}>
            <p className={estilos.tituloGrupo}>{grupo}</p>
            <ul>
              {secciones.filter((s) => s.grupo === grupo).map((s) => (
                <li key={s.href}>
                  <Link
                    prefetch={false}
                    href={s.href}
                    className={estilos.enlaceMenu}
                    aria-current={actual?.href === s.href ? 'page' : undefined}
                  >
                    {s.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Link prefetch={false} href="/" className={`${estilos.enlaceMenu} ${estilos.verSitio}`}>
          Ver el sitio público
        </Link>
      </div>
    </nav>
  );
}
