import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Vacio } from '@/componentes/Encabezado';
import { Escudo } from '@/componentes/Escudo';
import {
  type Encuentro,
  type Jornada,
  obtenerCalendario,
  obtenerCuerpoTecnico,
  obtenerEquipos,
  obtenerPlantilla,
  obtenerTemporadaVigente,
} from '@/lib/consultas/liga';
import { obtenerPosiciones } from '@/lib/consultas/posiciones';
import { formatearFechaCorta } from '@/lib/fechas';
import type { Lado, ResultadoJuego } from '@/lib/jornadas';
import { formatearAve } from '@/lib/posiciones';
import { imagenParaCompartir } from '@/lib/imagenes/tamanos';
import { OPEN_GRAPH_BASE } from '@/lib/sitio';
import estilos from '../../publico.module.css';
import estilosEquipos from '../equipos.module.css';

type Parametros = { params: Promise<{ slug: string }> };

const CATEGORIAS: Record<string, string> = {
  local: 'Local',
  novato: 'Novato',
  nuevo_valor: 'Nuevo valor',
  refuerzo: 'Refuerzo',
};

const PUESTOS: Record<string, string> = { delegado: 'Delegado', manager: 'Mánager', coach: 'Coach' };
const ORDEN_PUESTOS = ['delegado', 'manager', 'coach'];

async function buscarEquipo(slug: string) {
  const temporada = await obtenerTemporadaVigente();
  if (!temporada) return null;
  const equipos = await obtenerEquipos(temporada.id);
  const equipo = equipos.find((e) => e.slug === slug);
  return equipo ? { temporada, equipo } : null;
}

export async function generateStaticParams() {
  const temporada = await obtenerTemporadaVigente();
  if (!temporada) return [];
  return (await obtenerEquipos(temporada.id)).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const encontrado = await buscarEquipo((await params).slug);
  if (!encontrado) return {};
  const { equipo, temporada } = encontrado;
  return {
    title: equipo.nombre,
    description: `${equipo.nombre} en la temporada ${temporada.nombre}: plantilla, cuerpo técnico y resultados.`,
    alternates: { canonical: `/equipos/${equipo.slug}` },
    openGraph: equipo.logo ? { ...OPEN_GRAPH_BASE, images: [imagenParaCompartir(equipo.logo)] } : undefined,
  };
}

function CeldaResultado({ juego, lado }: { juego: ResultadoJuego | undefined; lado: Lado }) {
  if (!juego || juego.ganador === null) {
    const estado = juego && juego.estado !== 'programado' ? juego.estado : null;
    return <td className={estilosEquipos.resultado}>{estado ?? '–'}</td>;
  }
  const rival: Lado = lado === 'local' ? 'visitante' : 'local';
  const letra = juego.ganador === 'empate' ? 'E' : juego.ganador === lado ? 'G' : 'P';
  const nombre = { G: 'Ganado', P: 'Perdido', E: 'Empate' }[letra];
  const clase = letra === 'G' ? estilosEquipos.ganado : letra === 'P' ? estilosEquipos.perdido : '';
  return (
    <td className={estilosEquipos.resultado}>
      <abbr title={nombre} className={`${estilosEquipos.letra} ${clase}`}>
        {letra}
      </abbr>
      {juego[lado]}-{juego[rival]}
      {juego.forfeitDe && ' (forfeit)'}
    </td>
  );
}

export default async function PaginaEquipo({ params }: Parametros) {
  const encontrado = await buscarEquipo((await params).slug);
  if (!encontrado) notFound();
  const { equipo, temporada } = encontrado;
  const [plantilla, cuerpo, posiciones, jornadas] = await Promise.all([
    obtenerPlantilla(temporada.id, equipo.id),
    obtenerCuerpoTecnico(temporada.id, equipo.id),
    obtenerPosiciones(temporada.id),
    obtenerCalendario(temporada.id),
  ]);
  const fila = posiciones.find((f) => f.equipoId === equipo.id);
  const activos = plantilla.filter((j) => !j.baja);
  const bajas = plantilla.filter((j) => j.baja);
  const cuerpoOrdenado = [...cuerpo].sort((a, b) => ORDEN_PUESTOS.indexOf(a.puesto) - ORDEN_PUESTOS.indexOf(b.puesto));
  const partidos: { jornada: Jornada; encuentro: Encuentro | null }[] = jornadas.flatMap((j) => {
    const encuentro = j.encuentros.find((e) => e.local.id === equipo.id || e.visitante.id === equipo.id) ?? null;
    return encuentro || j.descansa?.id === equipo.id ? [{ jornada: j, encuentro }] : [];
  });
  const columnas = Math.max(1, ...partidos.map((p) => p.encuentro?.juegos.length ?? 0));

  return (
    <>
      <header className={estilosEquipos.cabecera}>
        <Escudo logo={equipo.logo} nombre={equipo.nombre} tamano={132} className={estilosEquipos.escudoGrande} prioridad />
        <div className={estilos.encabezado}>
          <p className={estilos.antetitulo}>
            Temporada {temporada.nombre}
            {equipo.poblado ? ` · ${equipo.poblado}` : ''}
          </p>
          <h1 className={estilos.titulo}>{equipo.nombre}</h1>
        </div>
      </header>

      {fila && (
        <dl className={estilos.datos}>
          <div>
            <dt>Lugar</dt>
            <dd>{fila.posicion}.º</dd>
          </div>
          <div>
            <dt>Ganados</dt>
            <dd>{fila.jg}</dd>
          </div>
          <div>
            <dt>Perdidos</dt>
            <dd>{fila.jp}</dd>
          </div>
          {fila.je > 0 && (
            <div>
              <dt>Empates</dt>
              <dd>{fila.je}</dd>
            </div>
          )}
          <div>
            <dt>AVE</dt>
            <dd>{formatearAve(fila.ave)}</dd>
          </div>
          <div>
            <dt>Diferencia</dt>
            <dd>{fila.dif > 0 ? `+${fila.dif}` : fila.dif < 0 ? `−${Math.abs(fila.dif)}` : '0'}</dd>
          </div>
        </dl>
      )}

      <div className={estilos.dos}>
        <section className={estilos.seccion} aria-labelledby="titulo-plantilla">
          <div className={estilos.seccionCabeza}>
            <h2 id="titulo-plantilla" className={estilos.tituloSeccion}>
              Plantilla
            </h2>
            <span className={estilos.detalleSeccion}>{activos.length} jugadores</span>
          </div>
          {activos.length === 0 ? (
            <Vacio titulo="Plantilla por publicar" />
          ) : (
            <ul className={estilosEquipos.plantilla}>
              {activos.map((j) => (
                <li key={j.id} className={estilosEquipos.jugador}>
                  <span className={estilosEquipos.dorsal}>
                    {j.numero ?? ''}
                    {j.numero !== null && <span className="solo-lectores">, número</span>}
                  </span>
                  <span>{j.nombre}</span>
                  {j.categoria !== 'local' && (
                    <span className={`${estilosEquipos.categoria} ${estilosEquipos[j.categoria]}`}>{CATEGORIAS[j.categoria]}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {bajas.length > 0 && (
            <p className={estilos.nota}>
              Bajas: {bajas.map((j) => j.nombre).join(', ')}. <Link prefetch={false} href="/altas-y-bajas">Ver movimientos</Link>
            </p>
          )}
        </section>

        <div className={estilos.seccion}>
          <section className={estilos.seccion} aria-labelledby="titulo-cuerpo">
            <div className={estilos.seccionCabeza}>
              <h2 id="titulo-cuerpo" className={estilos.tituloSeccion}>
                Cuerpo técnico
              </h2>
            </div>
            {cuerpoOrdenado.length === 0 ? (
              <Vacio titulo="Por confirmar" />
            ) : (
              <dl className={estilosEquipos.cuerpo}>
                {cuerpoOrdenado.map((c) => (
                  <div key={c.id}>
                    <dt>{PUESTOS[c.puesto]}</dt>
                    <dd>{c.nombre}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
          <section className={estilos.seccion} aria-labelledby="titulo-estadisticas">
            <div className={estilos.seccionCabeza}>
              <h2 id="titulo-estadisticas" className={estilos.tituloSeccion}>
                Estadísticas
              </h2>
            </div>
            <Vacio titulo="Por publicar">
              <p>Los números de bateo y pitcheo de cada jugador aparecen aquí cuando la liga los capture.</p>
            </Vacio>
          </section>
        </div>
      </div>

      <section className={estilos.seccion} aria-labelledby="titulo-resultados">
        <div className={estilos.seccionCabeza}>
          <h2 id="titulo-resultados" className={estilos.tituloSeccion}>
            Juegos
          </h2>
        </div>
        <div className={estilosEquipos.resultados} tabIndex={0} role="region" aria-label={`Juegos de ${equipo.nombre}, se desplaza a los lados`}>
          <table>
            <caption className="solo-lectores">Juegos de {equipo.nombre} por jornada</caption>
            <thead>
              <tr>
                <th scope="col">Jornada</th>
                <th scope="col">Rival</th>
                {Array.from({ length: columnas }, (_, i) => (
                  <th key={i} scope="col">
                    <abbr title={`Juego ${i + 1}`}>J{i + 1}</abbr>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {partidos.map(({ jornada, encuentro }) => {
                const lado: Lado | null = encuentro ? (encuentro.local.id === equipo.id ? 'local' : 'visitante') : null;
                const rival = encuentro && lado ? encuentro[lado === 'local' ? 'visitante' : 'local'] : null;
                return (
                  <tr key={jornada.id}>
                    <th scope="row">
                      <Link prefetch={false} href={`/jornadas/${jornada.numero}`}>{jornada.numero}</Link>
                      {jornada.fecha && <span className={estilos.detalleSeccion}> · {formatearFechaCorta(jornada.fecha, { anio: false })}</span>}
                    </th>
                    {encuentro && lado && rival ? (
                      <>
                        <td>
                          {lado === 'local' ? 'Recibe a ' : 'Visita a '}
                          <Link prefetch={false} href={`/equipos/${rival.slug}`}>{rival.nombre}</Link>
                        </td>
                        {Array.from({ length: columnas }, (_, i) => (
                          <CeldaResultado key={i} juego={encuentro.juegos.find((g) => g.numero === i + 1)} lado={lado} />
                        ))}
                      </>
                    ) : (
                      <td colSpan={columnas + 1}>Descansa</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
