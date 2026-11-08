import type { Metadata } from 'next';
import Link from 'next/link';
import { Encabezado, Vacio } from '@/componentes/Encabezado';
import { IconoFlecha } from '@/componentes/Iconos';
import { ListaEncuentros } from '@/componentes/ListaEncuentros';
import { Marcador } from '@/componentes/Marcador';
import { obtenerCalendario, obtenerTemporadaVigente } from '@/lib/consultas/liga';
import { hoyEnSonora } from '@/lib/fechas';
import { describirJornada, jornadaConResultados, resumirJornadas } from '@/lib/jornadas';
import estilos from '../publico.module.css';
import estilosCalendario from './calendario.module.css';

export const metadata: Metadata = {
  title: 'Calendario',
  description: 'Rol de juegos de la temporada por jornada, con resultados, fechas recorridas y el equipo que descansa.',
  alternates: { canonical: '/calendario' },
};

const NOMBRES_VUELTA: Record<number, string> = { 1: 'Primera vuelta', 2: 'Segunda vuelta' };

export default async function Calendario() {
  const temporada = await obtenerTemporadaVigente();
  const jornadas = temporada ? await obtenerCalendario(temporada.id) : [];
  const { ultima, siguiente } = resumirJornadas(jornadas, hoyEnSonora());
  const vueltas = [...new Set(jornadas.map((j) => j.vuelta ?? 0))];

  return (
    <>
      <Encabezado antetitulo={temporada ? `Temporada ${temporada.nombre}` : null} titulo="Calendario">
        <p>
          {jornadas.length} jornadas. En cada encuentro la visita va arriba y el local abajo; la raya roja marca al ganador.
        </p>
      </Encabezado>

      {jornadas.length === 0 ? (
        <Vacio titulo="Todavía no hay calendario publicado">
          <p>El rol de juegos aparece aquí en cuanto la liga lo capture.</p>
        </Vacio>
      ) : (
        <>
          <nav aria-label="Ir a una jornada" className={estilosCalendario.saltos}>
            <ol>
              {jornadas.map((j) => {
                const marca =
                  j.numero === ultima?.numero ? estilosCalendario.ultima : j.numero === siguiente?.numero ? estilosCalendario.siguiente : '';
                return (
                  <li key={j.id}>
                    <a href={`#jornada-${j.numero}`} className={`${estilosCalendario.salto} ${marca}`}>
                      <span className="solo-lectores">Jornada </span>
                      {j.numero}
                      {j.numero === ultima?.numero && <span className="solo-lectores">, la más reciente con resultados</span>}
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>

          {vueltas.map((vuelta) => (
            <section key={vuelta} className={estilos.seccion} aria-labelledby={`vuelta-${vuelta}`}>
              <div className={estilos.seccionCabeza}>
                <h2 id={`vuelta-${vuelta}`} className={estilos.tituloSeccion}>
                  {NOMBRES_VUELTA[vuelta] ?? 'Jornadas'}
                </h2>
              </div>
              <div className={estilosCalendario.jornadas}>
                {jornadas
                  .filter((j) => (j.vuelta ?? 0) === vuelta)
                  .map((j) => (
                    <section key={j.id} id={`jornada-${j.numero}`} className={estilosCalendario.jornada} aria-labelledby={`titulo-jornada-${j.numero}`}>
                      <div className={estilosCalendario.cabeza}>
                        <h3 id={`titulo-jornada-${j.numero}`} className={estilosCalendario.numero}>
                          Jornada {j.numero}
                        </h3>
                        <p className={estilos.detalleSeccion}>{describirJornada({ fecha: j.fecha, vuelta: null })}</p>
                        <Link prefetch={false} href={`/jornadas/${j.numero}`} className={estilos.enlaceMas}>
                          Ver detalle
                          <span className="solo-lectores"> de la jornada {j.numero}</span>
                          <IconoFlecha tamano={16} />
                        </Link>
                      </div>
                      {j.nota && <p className={estilosCalendario.nota}>{j.nota}</p>}
                      {jornadaConResultados(j) ? (
                        <Marcador jornada={j} variante="cal" />
                      ) : (
                        <>
                          <ListaEncuentros encuentros={j.encuentros} />
                          {j.descansa && (
                            <p className={estilos.detalleSeccion}>
                              Descansa: <b>{j.descansa.nombre}</b>
                            </p>
                          )}
                        </>
                      )}
                    </section>
                  ))}
              </div>
            </section>
          ))}
        </>
      )}
    </>
  );
}
