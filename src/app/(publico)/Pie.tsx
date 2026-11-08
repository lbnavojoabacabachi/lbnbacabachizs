import Link from 'next/link';
import { Logotipo } from '@/componentes/Logotipo';
import type { obtenerConfiguracion } from '@/lib/consultas/contenido';
import { perfilesDeRedes } from '@/lib/redes';
import { PRINCIPALES, SECUNDARIAS } from './navegacion';
import estilos from './publico.module.css';

type Configuracion = Awaited<ReturnType<typeof obtenerConfiguracion>>;

export function Pie({ configuracion, temporada }: { configuracion: Configuracion; temporada: string | null }) {
  const anio = new Date().getFullYear();
  const perfiles = perfilesDeRedes(configuracion);
  return (
    <footer className={estilos.pie}>
      <div className={`envoltura ${estilos.pieInterior}`}>
        <div className={estilos.pieMarca}>
          <Logotipo tamano={56} className={estilos.pieEscudo} decorativo />
          <p>
            <b>Liga de Beisbol Navojoa Ejidal</b>
            <span>Zona Sur Bacabachi</span>
            {temporada && <span>Temporada {temporada}</span>}
          </p>
        </div>
        <nav aria-label="Secciones del sitio" className={estilos.pieNav}>
          <ul>
            {[...PRINCIPALES, ...SECUNDARIAS].map((e) => (
              <li key={e.href}>
                <Link prefetch={false} href={e.href}>{e.texto}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={estilos.pieContacto}>
          <h2 className={estilos.pieTitulo}>Contacto</h2>
          {configuracion?.telefonoContacto && (
            <p>
              <a href={`tel:${configuracion.telefonoContacto.replace(/[^\d+]/g, '')}`}>{configuracion.telefonoContacto}</a>
            </p>
          )}
          {configuracion?.correoContacto && (
            <p>
              <a href={`mailto:${configuracion.correoContacto}`}>{configuracion.correoContacto}</a>
            </p>
          )}
          {configuracion?.direccion && <p>{configuracion.direccion}</p>}
          {perfiles.length > 0 && (
            <ul className={estilos.pieRedes}>
              {perfiles.map((p) => (
                <li key={p.red}>
                  <a href={p.url} rel="noopener" target="_blank">
                    {p.nombre}
                    <span className="solo-lectores"> (se abre en otra pestaña)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className={`envoltura ${estilos.pieFinal}`}>
        <p>© {anio} Liga de Beisbol Navojoa Ejidal, Zona Sur Bacabachi</p>
      </div>
    </footer>
  );
}
