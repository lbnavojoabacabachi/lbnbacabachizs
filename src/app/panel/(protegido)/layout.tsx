import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logotipo } from '@/componentes/Logotipo';
import { INICIO_DEL_COMPILADOR, rolDe } from '@/lib/roles';
import { exigirCompilador } from '@/lib/sesion';
import { BotonSalir } from '../BotonSalir';
import marco from '../componentes/panel-marco.module.css';
import estilos from '../panel.module.css';
import { MenuPanel } from './MenuPanel';

export const metadata: Metadata = {
  title: { default: 'Panel', template: '%s · Panel · Liga Bacabachi' },
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const sesion = await exigirCompilador();
  const rol = rolDe(sesion.user.rol) ?? 'compilador';

  return (
    <>
      <a href="#contenido-panel" className={marco.saltar}>
        Saltar al contenido
      </a>
      <header className={estilos.barra}>
        <div className={`envoltura ${estilos.barraInterior} ${marco.ancho}`}>
          <Link prefetch={false} href={rol === 'administrador' ? '/panel' : INICIO_DEL_COMPILADOR} className={estilos.marcaPanel}>
            <Logotipo tamano={40} className={estilos.escudoChico} decorativo />
            <span>Panel</span>
          </Link>
          <div className={estilos.usuario}>
            <span className={estilos.nombreUsuario}>{sesion.user.displayUsername ?? sesion.user.name}</span>
            <Link prefetch={false} href="/panel/contrasena" className={estilos.botonSecundario}>
              Contraseña
            </Link>
            <BotonSalir />
          </div>
        </div>
      </header>
      <div className={estilos.franja} />
      <div className={`envoltura ${marco.marco} ${marco.ancho}`}>
        <MenuPanel rol={rol} />
        <main id="contenido-panel" className={marco.contenido} tabIndex={-1}>
          {children}
        </main>
      </div>
    </>
  );
}
