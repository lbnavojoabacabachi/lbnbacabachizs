import type { Metadata } from 'next';
import Link from 'next/link';
import { Encabezado, Vacio } from '@/componentes/Encabezado';
import { Escudo } from '@/componentes/Escudo';
import { COLUMNAS_DE_BATEO, COLUMNAS_DE_PITCHEO, PORCENTAJES_DE_BATEO, TablaBateo, TablaPitcheo } from '@/componentes/TablasEstadisticas';
import { obtenerEstadisticas, obtenerTemporadaConEstadisticas } from '@/lib/consultas/estadisticas';
import { obtenerTemporadaVigente } from '@/lib/consultas/liga';
import { calcularLideres, formatearPorcentaje, porcentajesDeBateo } from '@/lib/estadisticas';
import estilos from '../publico.module.css';
import estilosEstadisticas from './estadisticas.module.css';

export const metadata: Metadata = {
  title: 'Estadísticas',
  description: 'Líderes de bateo y pitcheo de la temporada y la tabla de bateo y pitcheo de cada equipo.',
  alternates: { canonical: '/estadisticas' },
};

const LIDERES = ['Promedio de bateo', 'Jonrones', 'Hits', 'Juegos ganados como pitcher'];

type Lider = { nombre: string; equipoId: number; valor: number; texto: string };

function ListaDeLideres({ id, titulo, nota, lideres, equipos }: { id: string; titulo: string; nota?: string; lideres: Lider[]; equipos: Map<number, string> }) {
  return (
    <section className={estilosEstadisticas.lider} aria-labelledby={id}>
      <h3 id={id} className={estilos.subtitulo}>
        {titulo}
      </h3>
      {nota && <p className={estilos.nota}>{nota}</p>}
      <ol className={estilosEstadisticas.lista}>
        {lideres.map((l) => {
          const lugar = lideres.findIndex((x) => x.valor === l.valor) + 1;
          return (
            <li key={`${l.nombre}-${l.equipoId}`} className={lugar === 1 ? estilosEstadisticas.primero : undefined}>
              <span className={estilosEstadisticas.lugar} aria-hidden="true">
                {lugar}
              </span>
              <span className={estilosEstadisticas.quien}>
                <span className={estilosEstadisticas.nombre}>{l.nombre}</span>
                <span className={estilosEstadisticas.equipo}>{equipos.get(l.equipoId)}</span>
              </span>
              <span className={estilosEstadisticas.valor}>{l.texto}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default async function Estadisticas() {
  const temporada = await obtenerTemporadaConEstadisticas();
  if (!temporada) {
    const vigente = await obtenerTemporadaVigente();
    return (
      <>
        <Encabezado antetitulo={vigente ? `Temporada ${vigente.nombre}` : null} titulo="Estadísticas" />
        <Vacio titulo="Las estadísticas de la temporada se publican pronto">
          <p>Cuando la liga las capture, aquí vas a encontrar a los líderes en:</p>
          <ul className={estilos.lista}>
            {LIDERES.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p>
            Y la tabla de bateo y pitcheo de cada equipo. Mientras tanto, la{' '}
            <Link prefetch={false} href="/posiciones">
              tabla de posiciones
            </Link>{' '}
            ya está al día.
          </p>
        </Vacio>
      </>
    );
  }

  const datos = await obtenerEstadisticas(temporada.id);
  const lideres = calcularLideres(datos.bateo, datos.pitcheo, datos.minimoApariciones);
  const equipos = new Map(datos.equipos.map((e) => [e.id, e.nombre]));
  const promedio = (f: (typeof datos.bateo)[number]) => porcentajesDeBateo(f).promedio ?? 0;

  return (
    <>
      <Encabezado antetitulo={`Temporada ${temporada.nombre}`} titulo="Estadísticas">
        <p>
          {temporada.vigente
            ? 'Números de la temporada en curso, como los entrega el anotador oficial de la liga.'
            : 'Números finales de la temporada, como los entregó el anotador oficial de la liga.'}
        </p>
      </Encabezado>

      <section className={estilos.seccion} aria-labelledby="titulo-lideres">
        <div className={estilos.seccionCabeza}>
          <h2 id="titulo-lideres" className={estilos.tituloSeccion}>
            Líderes
          </h2>
        </div>
        <div className={estilosEstadisticas.lideres}>
          <ListaDeLideres
            id="lideres-promedio"
            titulo="Promedio de bateo"
            nota={`Con ${datos.minimoApariciones} apariciones al bat o más.`}
            equipos={equipos}
            lideres={lideres.promedio.map((f) => ({ ...f, valor: promedio(f), texto: formatearPorcentaje(promedio(f)) }))}
          />
          <ListaDeLideres
            id="lideres-jonrones"
            titulo="Jonrones"
            equipos={equipos}
            lideres={lideres.jonrones.map((f) => ({ ...f, valor: f.jonrones, texto: String(f.jonrones) }))}
          />
          <ListaDeLideres
            id="lideres-hits"
            titulo="Hits"
            equipos={equipos}
            lideres={lideres.hits.map((f) => ({ ...f, valor: f.hits, texto: String(f.hits) }))}
          />
          <ListaDeLideres
            id="lideres-ganados"
            titulo="Juegos ganados"
            nota="Como pitcher, con sus perdidos."
            equipos={equipos}
            lideres={lideres.ganados.map((p) => ({ ...p, valor: p.ganados, texto: `${p.ganados}-${p.perdidos}` }))}
          />
        </div>
      </section>

      <section className={estilos.seccion} aria-labelledby="titulo-equipos">
        <div className={estilos.seccionCabeza}>
          <h2 id="titulo-equipos" className={estilos.tituloSeccion}>
            Por equipo
          </h2>
        </div>
        <nav aria-label="Ir a un equipo">
          <ul className={estilosEstadisticas.equipos}>
            {datos.equipos.map((e) => (
              <li key={e.id}>
                <a href={`#${e.slug}`}>
                  <Escudo logo={e.logo} nombre={e.nombre} tamano={24} />
                  {e.nombre}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className={estilos.nota}>Desliza las tablas a los lados para ver todas las columnas. Las filas «(total)» suman lo de un jugador que cambió de equipo.</p>
      </section>

      {datos.equipos.map((e) => (
        <section key={e.id} id={e.slug} className={`${estilos.seccion} ${estilosEstadisticas.porEquipo}`} aria-labelledby={`titulo-${e.slug}`}>
          <div className={estilos.seccionCabeza}>
            <h2 id={`titulo-${e.slug}`} className={`${estilos.tituloSeccion} ${estilosEstadisticas.tituloEquipo}`}>
              <Escudo logo={e.logo} nombre={e.nombre} tamano={36} />
              {e.nombre}
            </h2>
          </div>
          {e.bateo.length > 0 && (
            <div className={estilosEstadisticas.bloque}>
              <h3 className={estilos.subtitulo}>Bateo</h3>
              <TablaBateo equipo={e.nombre} filas={e.bateo} />
            </div>
          )}
          {e.pitcheo.length > 0 && (
            <div className={`${estilosEstadisticas.bloque} ${estilosEstadisticas.pitcheo}`}>
              <h3 className={estilos.subtitulo}>Pitcheo</h3>
              <TablaPitcheo equipo={e.nombre} filas={e.pitcheo} />
            </div>
          )}
        </section>
      ))}

      <section className={estilos.seccion} aria-labelledby="titulo-abreviaturas">
        <div className={estilos.seccionCabeza}>
          <h2 id="titulo-abreviaturas" className={estilos.tituloSeccion}>
            Qué significa cada columna
          </h2>
        </div>
        <div className={estilos.dos}>
          <div>
            <h3 className={estilos.subtitulo}>Bateo</h3>
            <dl className={estilosEstadisticas.abreviaturas}>
              {[...COLUMNAS_DE_BATEO.map(([, sigla, nombre]) => [sigla, nombre]), ...PORCENTAJES_DE_BATEO].map(([sigla, nombre]) => (
                <div key={sigla}>
                  <dt>{sigla}</dt>
                  <dd>{nombre}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h3 className={estilos.subtitulo}>Pitcheo</h3>
            <dl className={estilosEstadisticas.abreviaturas}>
              {COLUMNAS_DE_PITCHEO.map(([clave, sigla, nombre]) => (
                <div key={clave}>
                  <dt>{sigla}</dt>
                  <dd>{nombre}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
