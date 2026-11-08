import type { Metadata } from 'next';
import { Encabezado, Vacio } from '@/componentes/Encabezado';
import { FeedFacebook } from '@/componentes/FeedFacebook';
import { IconoExterno } from '@/componentes/Iconos';
import { PublicacionRed } from '@/componentes/PublicacionRed';
import { obtenerConfiguracion, obtenerPublicacionesRedes } from '@/lib/consultas/contenido';
import { paginaDeFacebook, perfilesDeRedes } from '@/lib/redes';
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
  const feedFacebook = paginaDeFacebook(configuracion);

  return (
    <>
      <Encabezado titulo="Redes">
        <p>Lo más reciente de la liga en redes sociales.</p>
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

      {feedFacebook && (
        <section className={estilos.seccion} aria-labelledby="titulo-facebook">
          <div className={estilos.seccionCabeza}>
            <h2 id="titulo-facebook" className={estilos.tituloSeccion}>
              En Facebook
            </h2>
          </div>
          <FeedFacebook pagina={feedFacebook} />
        </section>
      )}

      {(publicaciones.length > 0 || !feedFacebook) && (
        <section className={estilos.seccion} aria-labelledby="titulo-publicaciones">
          <div className={estilos.seccionCabeza}>
            <h2 id="titulo-publicaciones" className={estilos.tituloSeccion}>
              Publicaciones destacadas
            </h2>
          </div>
          {publicaciones.length === 0 ? (
            <Vacio titulo="Todavía no hay publicaciones destacadas">
              <p>La liga elige desde su panel qué publicaciones se destacan aquí. Mientras tanto, todo está en sus perfiles.</p>
            </Vacio>
          ) : (
            <>
              <p className={estilosRedes.nota}>Cada publicación carga hasta que la tocas.</p>
              <ul className={estilosRedes.publicaciones}>
                {publicaciones.map((p) => (
                  <PublicacionRed key={p.id} publicacion={p} />
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </>
  );
}
