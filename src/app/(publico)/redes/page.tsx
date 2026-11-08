import type { Metadata } from 'next';
import { Encabezado, Vacio } from '@/componentes/Encabezado';
import { IconoExterno } from '@/componentes/Iconos';
import { PublicacionRed } from '@/componentes/PublicacionRed';
import { obtenerConfiguracion, obtenerPublicacionesRedes } from '@/lib/consultas/contenido';
import { perfilesDeRedes } from '@/lib/redes';
import estilos from '../publico.module.css';
import estilosRedes from './redes.module.css';

export const metadata: Metadata = {
  title: 'Redes',
  description: 'Publicaciones de la liga en Facebook, Instagram, YouTube y TikTok, y enlaces a sus perfiles.',
  alternates: { canonical: '/redes' },
};

export default async function Redes() {
  const [publicaciones, configuracion] = await Promise.all([obtenerPublicacionesRedes(), obtenerConfiguracion()]);
  const perfiles = perfilesDeRedes(configuracion);

  return (
    <>
      <Encabezado titulo="Redes">
        <p>Lo más reciente de la liga en redes sociales. Cada publicación carga hasta que la tocas.</p>
      </Encabezado>

      {perfiles.length > 0 && (
        <section className={estilos.seccion} aria-labelledby="titulo-perfiles">
          <h2 id="titulo-perfiles" className={estilos.subtitulo}>
            Sigue a la liga
          </h2>
          <ul className={estilosRedes.perfiles}>
            {perfiles.map((p) => (
              <li key={p.red}>
                <a href={p.url} target="_blank" rel="noopener" className={estilosRedes.perfil}>
                  <span className={estilosRedes.red}>{p.nombre}</span>
                  <span className={estilosRedes.abrir}>
                    Abrir perfil
                    <IconoExterno tamano={16} />
                  </span>
                  <span className="solo-lectores"> (se abre en otra pestaña)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={estilos.seccion} aria-labelledby="titulo-publicaciones">
        <div className={estilos.seccionCabeza}>
          <h2 id="titulo-publicaciones" className={estilos.tituloSeccion}>
            Publicaciones
          </h2>
        </div>
        {publicaciones.length === 0 ? (
          <Vacio titulo="Todavía no hay publicaciones elegidas">
            <p>La liga elige desde su panel qué publicaciones se muestran aquí. Mientras tanto, todo está en sus perfiles.</p>
          </Vacio>
        ) : (
          <ul className={estilosRedes.publicaciones}>
            {publicaciones.map((p) => (
              <PublicacionRed key={p.id} publicacion={p} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
