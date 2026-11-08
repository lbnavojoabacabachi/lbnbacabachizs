import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logotipo } from '@/componentes/Logotipo';
import { obtenerConfiguracion, obtenerTransmisiones } from '@/lib/consultas/contenido';
import { obtenerTemporadaVigente } from '@/lib/consultas/liga';
import estilosCabecera from './cabecera.module.css';
import { MenuPrincipal } from './MenuPrincipal';
import { Pie } from './Pie';
import estilos from './publico.module.css';

export const revalidate = 3600;

export default async function PublicoLayout({ children }: { children: ReactNode }) {
  const [configuracion, transmisiones, temporada] = await Promise.all([
    obtenerConfiguracion(),
    obtenerTransmisiones(),
    obtenerTemporadaVigente(),
  ]);
  return (
    <>
      <a href="#contenido" className={estilosCabecera.saltar}>
        Saltar al contenido
      </a>
      <header className={estilosCabecera.cabecera}>
        <div className={`envoltura ${estilosCabecera.cabeceraInterior}`}>
          <Link prefetch={false} href="/" className={estilosCabecera.marca}>
            <Logotipo tamano={60} className={estilosCabecera.escudo} decorativo />
            <span className={estilosCabecera.nombre}>
              <span className={estilosCabecera.nombreLiga}>Liga de Beisbol Navojoa Ejidal</span>
              <span className={estilosCabecera.nombreZona}>Zona Sur Bacabachi</span>
            </span>
          </Link>
          <MenuPrincipal enVivo={transmisiones.enVivo.length > 0} />
        </div>
      </header>
      <div className={estilos.franja} />
      <main id="contenido" className={`envoltura ${estilos.principal}`} tabIndex={-1}>
        {children}
      </main>
      <Pie configuracion={configuracion} temporada={temporada?.nombre ?? null} />
    </>
  );
}
