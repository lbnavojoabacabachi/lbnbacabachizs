import Link from 'next/link';
import { IconoExterno, IconoFlecha } from '@/componentes/Iconos';
import { Imagen } from '@/componentes/Imagen';
import { ListaEncuentros } from '@/componentes/ListaEncuentros';
import { Marcador } from '@/componentes/Marcador';
import { PublicacionesFacebook } from '@/componentes/PublicacionesFacebook';
import { PublicacionRed } from '@/componentes/PublicacionRed';
import { TablaPosiciones } from '@/componentes/TablaPosiciones';
import { TarjetaAlbum, TarjetaNoticia } from '@/componentes/Tarjetas';
import {
  obtenerAlbumes,
  obtenerConfiguracion,
  obtenerNoticias,
  obtenerPatrocinadores,
  obtenerProximosEventos,
  obtenerPublicacionesRedes,
  obtenerTransmisiones,
} from '@/lib/consultas/contenido';
import { obtenerCalendario, obtenerEquipos, obtenerTemporadaVigente } from '@/lib/consultas/liga';
import { obtenerPosiciones } from '@/lib/consultas/posiciones';
import { obtenerPublicacionesDeFacebook } from '@/lib/facebook';
import { capitalizar, formatearInstante, hoyEnSonora } from '@/lib/fechas';
import { describirJornada, resumirJornadas } from '@/lib/jornadas';
import { perfilesDeRedes } from '@/lib/redes';
import estilosPortada from './portada.module.css';
import estilos from './publico.module.css';

export default async function Portada() {
  const temporada = await obtenerTemporadaVigente();
  const [
    jornadas,
    posiciones,
    equipos,
    noticias,
    eventos,
    albumes,
    publicaciones,
    deFacebook,
    transmisiones,
    patrocinadores,
    configuracion,
  ] = await Promise.all([
    temporada ? obtenerCalendario(temporada.id) : [],
    temporada ? obtenerPosiciones(temporada.id) : [],
    temporada ? obtenerEquipos(temporada.id) : [],
    obtenerNoticias(3),
    obtenerProximosEventos(),
    obtenerAlbumes(),
    obtenerPublicacionesRedes(3),
    obtenerPublicacionesDeFacebook(),
    obtenerTransmisiones(),
    obtenerPatrocinadores(),
    obtenerConfiguracion(),
  ]);
  const { ultima, siguiente, siguientePorPublicar } = resumirJornadas(jornadas, hoyEnSonora());
  const vivo = transmisiones.enVivo[0];
  const evento = eventos[0];
  const facebook = perfilesDeRedes(configuracion).find((p) => p.red === 'facebook');
  const recientesDeFacebook = deFacebook?.slice(0, 3) ?? [];

  return (
    <>
      <h1 className="solo-lectores">Liga de Beisbol Navojoa Ejidal, Zona Sur Bacabachi</h1>

      {vivo && (
        <section className={estilosPortada.enVivo} aria-labelledby="titulo-vivo">
          <p className={estilosPortada.etiquetaVivo}>
            <span className={estilosPortada.punto} aria-hidden="true" />
            En vivo ahora
          </p>
          <h2 id="titulo-vivo" className={estilosPortada.tituloVivo}>
            {vivo.titulo}
          </h2>
          <Link prefetch={false} href="/en-vivo" className={estilosPortada.botonVivo}>
            Ver la transmisión
            <IconoFlecha />
          </Link>
        </section>
      )}

      {ultima ? (
        <section className={estilosPortada.jornada} aria-labelledby="titulo-ultima">
          <div className={estilosPortada.jornadaCabeza}>
            <p className={estilos.antetitulo}>Última jornada{temporada ? ` · Temporada ${temporada.nombre}` : ''}</p>
            <h2 id="titulo-ultima" className={estilosPortada.jornadaTitulo}>
              Jornada {ultima.numero}
            </h2>
            <p className={estilos.detalleSeccion}>{describirJornada(ultima)}</p>
          </div>
          <Marcador jornada={ultima} />
          {ultima.nota && <p className={estilos.nota}>{ultima.nota}</p>}
          <div className={estilos.acciones}>
            <Link prefetch={false} href={`/jornadas/${ultima.numero}`} className={estilos.boton}>
              Ver la jornada {ultima.numero}
            </Link>
            <Link prefetch={false} href="/calendario" className={estilos.botonSecundario}>
              Calendario completo
            </Link>
          </div>
        </section>
      ) : (
        <section className={estilos.encabezado} aria-labelledby="titulo-inicio">
          <p className={estilos.antetitulo}>{temporada ? `Temporada ${temporada.nombre}` : 'Liga Bacabachi'}</p>
          <h2 id="titulo-inicio" className={estilos.titulo}>
            {temporada && temporada.inicio <= hoyEnSonora() ? 'Ya arrancó la temporada' : 'La temporada todavía no arranca'}
          </h2>
          <p className={estilos.entradilla}>Aquí van a aparecer los resultados de cada jornada.</p>
        </section>
      )}

      <div className={estilos.dos}>
        {siguiente && (
          <section className={estilos.seccion} aria-labelledby="titulo-siguiente">
            <div className={estilos.seccionCabeza}>
              <h2 id="titulo-siguiente" className={estilos.tituloSeccion}>
                {siguientePorPublicar ? `Jornada ${siguiente.numero}` : `Próxima jornada: ${siguiente.numero}`}
              </h2>
              <Link prefetch={false} href={`/jornadas/${siguiente.numero}`} className={estilos.enlaceMas}>
                Detalle
                <IconoFlecha tamano={16} />
              </Link>
            </div>
            <p className={estilos.detalleSeccion}>
              {describirJornada(siguiente)}
              {siguientePorPublicar && (
                <>
                  {' · '}
                  <b className={estilosPortada.porPublicar}>resultados por publicar</b>
                </>
              )}
            </p>
            {siguiente.nota && <p className={estilos.nota}>{siguiente.nota}</p>}
            <ListaEncuentros encuentros={siguiente.encuentros} />
            {siguiente.descansa && (
              <p className={estilos.detalleSeccion}>
                Descansa: <b>{siguiente.descansa.nombre}</b>
              </p>
            )}
          </section>
        )}

        {posiciones.length > 0 && (
          <section className={estilos.seccion} aria-labelledby="titulo-posiciones">
            <div className={estilos.seccionCabeza}>
              <h2 id="titulo-posiciones" className={estilos.tituloSeccion}>
                Posiciones
              </h2>
              <Link prefetch={false} href="/posiciones" className={estilos.enlaceMas}>
                Tabla completa
                <IconoFlecha tamano={16} />
              </Link>
            </div>
            <TablaPosiciones filas={posiciones} equipos={equipos} titulo="Tabla de posiciones resumida" />
            {ultima && <p className={estilos.nota}>Con los resultados publicados hasta la jornada {ultima.numero}.</p>}
          </section>
        )}
      </div>

      {evento && (
        <section className={`${estilos.seccion} ${estilosPortada.evento}`} aria-labelledby="titulo-evento">
          {evento.poster && (
            <Imagen
              imagen={evento.poster}
              alt={`Cartel: ${evento.titulo}`}
              sizes="(min-width: 760px) 340px, calc(100vw - 32px)"
              className={estilosPortada.poster}
            />
          )}
          <div className={estilos.texto}>
            <p className={estilos.antetitulo}>Próximo evento</p>
            <h2 id="titulo-evento" className={estilos.titulo}>
              {evento.titulo}
            </h2>
            <p className={estilosPortada.cuando}>
              {capitalizar(formatearInstante(evento.inicio))}
              {evento.sede ? ` · ${evento.sede}` : ''}
            </p>
            {evento.descripcion && <p>{evento.descripcion}</p>}
          </div>
        </section>
      )}

      {noticias.length > 0 && (
        <section className={estilos.seccion} aria-labelledby="titulo-noticias">
          <div className={estilos.seccionCabeza}>
            <h2 id="titulo-noticias" className={estilos.tituloSeccion}>
              Noticias
            </h2>
            <Link prefetch={false} href="/noticias" className={estilos.enlaceMas}>
              Todas las noticias
              <IconoFlecha tamano={16} />
            </Link>
          </div>
          <ul className={estilos.tarjetas}>
            {noticias.map((n) => (
              <TarjetaNoticia key={n.id} noticia={n} />
            ))}
          </ul>
        </section>
      )}

      {albumes.length > 0 && (
        <section className={estilos.seccion} aria-labelledby="titulo-galeria">
          <div className={estilos.seccionCabeza}>
            <h2 id="titulo-galeria" className={estilos.tituloSeccion}>
              Galería
            </h2>
            <Link prefetch={false} href="/galeria" className={estilos.enlaceMas}>
              Todos los álbumes
              <IconoFlecha tamano={16} />
            </Link>
          </div>
          <ul className={estilos.tarjetas}>
            {albumes.slice(0, 3).map((a) => (
              <TarjetaAlbum key={a.id} album={a} />
            ))}
          </ul>
        </section>
      )}

      <section className={estilos.seccion} aria-labelledby="titulo-redes">
        <div className={estilos.seccionCabeza}>
          <h2 id="titulo-redes" className={estilos.tituloSeccion}>
            En redes
          </h2>
          <Link prefetch={false} href="/redes" className={estilos.enlaceMas}>
            Ver redes
            <IconoFlecha tamano={16} />
          </Link>
        </div>
        {(recientesDeFacebook.length > 0 || publicaciones.length === 0) && (
          <div className={estilosPortada.redesTexto}>
            <p>Los avisos del día, los cambios de horario y las fotos de cada jornada salen primero en la página de Facebook de la liga.</p>
            {facebook && (
              <a href={facebook.url} className={estilos.botonSecundario} target="_blank" rel="noopener">
                Seguir a la liga en Facebook
                <IconoExterno tamano={18} />
                <span className="solo-lectores"> (se abre en otra pestaña)</span>
              </a>
            )}
          </div>
        )}
        {recientesDeFacebook.length > 0 && <PublicacionesFacebook publicaciones={recientesDeFacebook} />}
        {publicaciones.length > 0 && (
          <ul className={`${estilos.tarjetas} ${recientesDeFacebook.length > 0 ? estilosPortada.despuesDeFacebook : ''}`}>
            {publicaciones.map((p) => (
              <PublicacionRed key={p.id} publicacion={p} />
            ))}
          </ul>
        )}
      </section>

      {patrocinadores.length > 0 && (
        <section className={estilos.seccion} aria-labelledby="titulo-patrocinadores">
          <div className={estilos.seccionCabeza}>
            <h2 id="titulo-patrocinadores" className={estilos.tituloSeccion}>
              Patrocinadores
            </h2>
          </div>
          <ul className={estilosPortada.patrocinadores}>
            {patrocinadores.map((p) => {
              const contenido = (
                <>
                  {p.logo && (
                    <Imagen imagen={{ ...p.logo, colorFondo: null }} alt="" sizes="96px" className={estilosPortada.logoPatrocinador} />
                  )}
                  <span>{p.nombre}</span>
                </>
              );
              return (
                <li key={p.id}>
                  {p.enlace ? (
                    <a href={p.enlace} target="_blank" rel="noopener" className={estilosPortada.patrocinador}>
                      {contenido}
                      <span className="solo-lectores"> (se abre en otra pestaña)</span>
                    </a>
                  ) : (
                    <span className={estilosPortada.patrocinador}>{contenido}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}
