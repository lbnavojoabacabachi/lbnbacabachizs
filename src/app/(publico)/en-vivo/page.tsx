import type { Metadata } from 'next';
import { Encabezado, Vacio } from '@/componentes/Encabezado';
import { IconoExterno } from '@/componentes/Iconos';
import { Incrustado } from '@/componentes/Incrustado';
import { obtenerConfiguracion, obtenerTransmisiones, type Transmision } from '@/lib/consultas/contenido';
import { capitalizar, formatearInstante } from '@/lib/fechas';
import { incrustacionDeTransmision, NOMBRES_RED } from '@/lib/incrustar';
import { perfilesDeRedes } from '@/lib/redes';
import estilos from '../publico.module.css';
import estilosVivo from './en-vivo.module.css';

export const metadata: Metadata = {
  title: 'En vivo',
  description: 'Transmisiones en vivo de la liga por YouTube y Facebook, y las próximas programadas.',
  alternates: { canonical: '/en-vivo' },
};

function EnlaceExterno({ transmision, texto }: { transmision: Transmision; texto: string }) {
  return (
    <a href={transmision.url} target="_blank" rel="noopener" className={estilosVivo.externo}>
      {texto} en {NOMBRES_RED[transmision.plataforma]}
      <IconoExterno tamano={16} />
      <span className="solo-lectores"> (se abre en otra pestaña)</span>
    </a>
  );
}

export default async function EnVivo() {
  const [{ enVivo, proximas, anteriores }, configuracion] = await Promise.all([obtenerTransmisiones(), obtenerConfiguracion()]);
  const perfiles = perfilesDeRedes(configuracion).filter((p) => p.red === 'facebook' || p.red === 'youtube');

  return (
    <>
      <Encabezado titulo="En vivo">
        <p>Juegos y eventos de la liga transmitidos por YouTube o Facebook. El video carga hasta que lo tocas, para no gastar tus datos.</p>
      </Encabezado>

      {enVivo.length > 0 ? (
        enVivo.map((t) => {
          const incrustacion = incrustacionDeTransmision(t.url);
          return (
            <section key={t.id} className={estilos.seccion} aria-labelledby={`vivo-${t.id}`}>
              <p className={estilosVivo.etiqueta}>
                <span className={estilosVivo.punto} aria-hidden="true" />
                Transmitiendo ahora
              </p>
              <h2 id={`vivo-${t.id}`} className={estilos.tituloSeccion}>
                {t.titulo}
              </h2>
              {incrustacion ? (
                <Incrustado incrustacion={incrustacion} titulo={t.titulo} accion="Ver en vivo" />
              ) : null}
              <EnlaceExterno transmision={t} texto="Abrir la transmisión" />
            </section>
          );
        })
      ) : (
        <Vacio titulo="No hay transmisión en este momento">
          <p>
            Cuando la liga transmita un juego, el video aparece aquí y en la portada.
            {perfiles.length > 0 ? ' Los avisos de cada transmisión también salen en:' : ''}
          </p>
          {perfiles.length > 0 && (
            <ul className={estilosVivo.perfiles}>
              {perfiles.map((p) => (
                <li key={p.red}>
                  <a href={p.url} target="_blank" rel="noopener" className={estilos.botonSecundario}>
                    {p.nombre}
                    <IconoExterno tamano={18} />
                    <span className="solo-lectores"> (se abre en otra pestaña)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Vacio>
      )}

      {proximas.length > 0 && (
        <section className={estilos.seccion} aria-labelledby="titulo-proximas">
          <div className={estilos.seccionCabeza}>
            <h2 id="titulo-proximas" className={estilos.tituloSeccion}>
              Próximas transmisiones
            </h2>
          </div>
          <ul className={estilos.lista}>
            {proximas.map((t) => (
              <li key={t.id} className={estilosVivo.renglon}>
                <time dateTime={t.inicio.toISOString()} className={estilosVivo.cuando}>
                  {capitalizar(formatearInstante(t.inicio))}
                </time>
                <b>{t.titulo}</b>
                <EnlaceExterno transmision={t} texto="Recordatorio" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {anteriores.length > 0 && (
        <section className={estilos.seccion} aria-labelledby="titulo-anteriores">
          <div className={estilos.seccionCabeza}>
            <h2 id="titulo-anteriores" className={estilos.tituloSeccion}>
              Transmisiones anteriores
            </h2>
          </div>
          <ul className={estilos.lista}>
            {anteriores.map((t) => (
              <li key={t.id} className={estilosVivo.renglon}>
                <time dateTime={t.inicio.toISOString()} className={estilosVivo.cuando}>
                  {capitalizar(formatearInstante(t.inicio, { diaSemana: false }))}
                </time>
                <b>{t.titulo}</b>
                <EnlaceExterno transmision={t} texto="Ver repetición" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
