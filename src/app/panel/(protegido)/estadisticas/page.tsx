import { count, desc, eq } from 'drizzle-orm';
import type { Metadata, Route } from 'next';
import Link from 'next/link';
import formularios from '@/app/panel/componentes/formularios.module.css';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { Texto } from '@/app/panel/componentes/Entradas';
import { db } from '@/db/conexion';
import { estadisticasBateo, estadisticasPitcheo, temporadas } from '@/db/esquema';
import { obtenerMinimoApariciones } from '@/lib/consultas/estadisticas';
import { hojasEsperadasAlCierre, juegosConHojas } from '@/lib/consultas/hojas';
import { obtenerEquipos } from '@/lib/consultas/liga';
import { minimoProrrateado } from '@/lib/estadisticas';
import { capitalizar, formatearFecha } from '@/lib/fechas';
import { avanceDeHojas, avancePorJornada, type EstadoHoja } from '@/lib/hojas';
import { exigirCompilador } from '@/lib/sesion';
import estilos from '../../panel.module.css';
import { CabeceraPagina, SinTemporada } from '../componentes';
import { guardarMinimoApariciones } from './acciones';
import estilosHoja from './hojas.module.css';

export const metadata: Metadata = { title: 'Estadísticas' };

function plural(cantidad: number, singular: string, varios: string) {
  return `${cantidad} ${cantidad === 1 ? singular : varios}`;
}

const ETIQUETA: Record<EstadoHoja, { texto: string; clase: string }> = {
  pendiente: { texto: 'Pendiente', clase: estilos.etiquetaPendiente },
  capturada: { texto: 'Capturada', clase: estilos.etiquetaOk },
  sin_numeros: { texto: 'Sin hoja', clase: estilos.etiquetaNeutra },
};

function EnlaceHoja({ juegoId, equipoId, equipo, estado }: { juegoId: number; equipoId: number; equipo: string; estado: EstadoHoja }) {
  return (
    <Link
      prefetch={false}
      href={`/panel/estadisticas/juegos/${juegoId}/${equipoId}` as Route}
      className={`${estilosHoja.hoja} ${estado === 'pendiente' ? estilosHoja.hojaPendiente : ''}`}
    >
      {equipo}
      <span className={ETIQUETA[estado].clase}>{ETIQUETA[estado].texto}</span>
    </Link>
  );
}

export default async function EstadisticasPanel({ searchParams }: { searchParams: Promise<{ temporada?: string; contrasena?: string }> }) {
  await exigirCompilador();
  const { temporada: pedida, contrasena } = await searchParams;
  const lista = await db.select({ id: temporadas.id, nombre: temporadas.nombre, vigente: temporadas.vigente }).from(temporadas).orderBy(desc(temporadas.inicio));
  const elegida = lista.find((t) => String(t.id) === pedida) ?? lista.find((t) => t.vigente) ?? lista[0];
  if (!elegida) {
    return (
      <>
        <CabeceraPagina titulo="Estadísticas" />
        <SinTemporada />
      </>
    );
  }
  const [equiposTemporada, bateo, pitcheo, minimo, jugados, esperadasAlCierre] = await Promise.all([
    obtenerEquipos(elegida.id),
    db
      .select({ equipoId: estadisticasBateo.equipoId, total: count() })
      .from(estadisticasBateo)
      .where(eq(estadisticasBateo.temporadaId, elegida.id))
      .groupBy(estadisticasBateo.equipoId),
    db
      .select({ equipoId: estadisticasPitcheo.equipoId, total: count() })
      .from(estadisticasPitcheo)
      .where(eq(estadisticasPitcheo.temporadaId, elegida.id))
      .groupBy(estadisticasPitcheo.equipoId),
    obtenerMinimoApariciones(elegida.id),
    juegosConHojas(elegida.id),
    hojasEsperadasAlCierre(elegida.id),
  ]);
  const bateadores = new Map(bateo.map((f) => [f.equipoId, f.total]));
  const pitchers = new Map(pitcheo.map((f) => [f.equipoId, f.total]));
  const conTotales = bateo.length + pitcheo.length > 0;
  const avance = avanceDeHojas(jugados);
  const jornadas = avancePorJornada(jugados);
  const conHojas = jugados.some((j) => j.hojaLocal !== 'pendiente' || j.hojaVisitante !== 'pendiente');
  const siguiente = jugados.find((j) => j.hojaLocal === 'pendiente' || j.hojaVisitante === 'pendiente');
  const minimoHoy = minimoProrrateado(minimo, avance.capturadas, esperadasAlCierre);

  const totalesPorEquipo = (
    <ul className={estilos.filas}>
      {equiposTemporada.map((e) => {
        const b = bateadores.get(e.id) ?? 0;
        const p = pitchers.get(e.id) ?? 0;
        return (
          <li key={e.id} className={estilos.fila}>
            <div className={estilos.filaPrincipal}>
              <span className={estilos.filaTitulo}>
                <Link prefetch={false} href={`/panel/estadisticas/${elegida.id}/${e.id}` as Route}>
                  {e.nombre}
                </Link>
              </span>
              <span className={estilos.filaDetalle}>
                {b + p > 0 ? `${plural(b, 'fila de bateo', 'filas de bateo')} · ${plural(p, 'pitcher', 'pitchers')}` : 'Sin números todavía'}
              </span>
            </div>
            <span className={b + p > 0 ? estilos.etiquetaOk : estilos.etiquetaPendiente}>{b + p > 0 ? 'Con números' : 'Pendiente'}</span>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <CabeceraPagina
        antetitulo={`Temporada ${elegida.nombre}`}
        titulo="Estadísticas"
        accion={
          !conTotales && siguiente ? (
            <Link
              prefetch={false}
              href={`/panel/estadisticas/juegos/${siguiente.juegoId}/${siguiente.hojaVisitante === 'pendiente' ? siguiente.visitanteId : siguiente.localId}` as Route}
              className={estilos.enlaceBoton}
            >
              Capturar la siguiente
            </Link>
          ) : undefined
        }
      >
        <p>
          {conTotales
            ? 'Esta temporada se lleva con los totales de bateo y pitcheo de cada equipo, tal como los entregó el anotador.'
            : 'Captura los numeritos de cada juego: una hoja por equipo. Los acumulados, los porcentajes y los líderes del sitio se calculan solos.'}
        </p>
      </CabeceraPagina>

      {contrasena === 'cambiada' && (
        <p className={estilos.aviso} role="status">
          Tu contraseña quedó cambiada. Si tenías el panel abierto en otro aparato, ahí tendrás que entrar de nuevo.
        </p>
      )}

      {lista.length > 1 && (
        <nav aria-label="Temporadas" className={estilos.temporadas}>
          {lista.map((t) => (
            <Link
              key={t.id}
              prefetch={false}
              href={`/panel/estadisticas?temporada=${t.id}` as Route}
              aria-current={t.id === elegida.id ? 'page' : undefined}
              className={estilos.temporada}
            >
              {t.nombre}
              {t.vigente ? ' (vigente)' : ''}
            </Link>
          ))}
        </nav>
      )}

      {conTotales ? (
        totalesPorEquipo
      ) : (
        <section className={estilos.seccion} aria-labelledby="titulo-juegos">
          <h2 id="titulo-juegos" className={estilos.subtitulo}>
            Hojas por juego
          </h2>
          {jugados.length === 0 ? (
            <p className={estilos.vacio}>Todavía no hay juegos con resultado en esta temporada. Cuando se capture el marcador de un juego, aquí aparecen sus dos hojas.</p>
          ) : (
            <>
              <p>
                {avance.pendientes === 0
                  ? `Las ${avance.capturadas} hojas de los juegos jugados están capturadas.`
                  : `${plural(avance.pendientes, 'hoja pendiente', 'hojas pendientes')}; van ${avance.capturadas} de ${avance.esperadas} capturadas.`}
              </p>
              <div className={estilosHoja.jornadas}>
                {jornadas.map((jornada) => (
                  <details key={jornada.numero} id={`jornada-${jornada.numero}`} className={estilosHoja.jornada} open={jornada.pendientes > 0}>
                    <summary>
                      Jornada {jornada.numero}
                      <span className={estilosHoja.avance}>
                        {jornada.juegos[0].fecha ? `${capitalizar(formatearFecha(jornada.juegos[0].fecha, { diaSemana: false }))} · ` : ''}
                        {jornada.pendientes === 0 ? 'completa' : plural(jornada.pendientes, 'hoja pendiente', 'hojas pendientes')}
                      </span>
                    </summary>
                    <ul className={estilosHoja.juegos}>
                      {jornada.juegos.map((j) => (
                        <li key={j.juegoId} className={estilosHoja.juego}>
                          <span className={estilosHoja.marcador}>
                            {j.visitante} {j.carrerasVisitante}, {j.local} {j.carrerasLocal}
                            <small>Juego {j.numero}</small>
                          </span>
                          <span className={estilosHoja.hojas}>
                            <EnlaceHoja juegoId={j.juegoId} equipoId={j.visitanteId} equipo={j.visitante} estado={j.hojaVisitante} />
                            <EnlaceHoja juegoId={j.juegoId} equipoId={j.localId} equipo={j.local} estado={j.hojaLocal} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </>
          )}
          {!conHojas && (
            <details>
              <summary className={estilos.desplegable}>¿Solo tienes los totales de la temporada? Pégalos por equipo</summary>
              <p className={formularios.ayuda}>
                Sirve para una temporada que ya terminó. Al pegar totales, la temporada deja de llevarse juego por juego y ya no marca hojas pendientes.
              </p>
              {totalesPorEquipo}
            </details>
          )}
        </section>
      )}

      <section className={estilos.seccion} aria-labelledby="titulo-minimo">
        <h2 id="titulo-minimo" className={estilos.subtitulo}>
          Título de bateo
        </h2>
        <Formulario accion={guardarMinimoApariciones} boton="Guardar mínimo" columnas>
          <input type="hidden" name="temporadaId" value={elegida.id} />
          <Texto
            nombre="minimoApariciones"
            etiqueta="Mínimo de apariciones al bat (AB) al cierre"
            tipo="number"
            valor={minimo}
            minimo={0}
            maximoNumero={999}
            requerido
            ancho="medio"
            ayuda={
              conTotales
                ? 'Para entrar a los líderes de promedio. El anotador usó 70 al cierre de la temporada 2025-2026.'
                : `Para entrar a los líderes de promedio. Mientras avanza la temporada se pide la parte proporcional a las hojas capturadas: hoy ${minimoHoy === 1 ? 'es 1' : `son ${minimoHoy}`}.`
            }
          />
        </Formulario>
      </section>

      {(conTotales || avance.capturadas > 0) && (
        <section className={estilos.seccion} aria-labelledby="titulo-descargar">
          <h2 id="titulo-descargar" className={estilos.subtitulo}>
            Descargar para Excel
          </h2>
          <p className={formularios.ayuda}>Los acumulados de la temporada {elegida.nombre}, con una fila por jugador y equipo.</p>
          <div className={estilosHoja.descargas}>
            <a href={`/api/estadisticas/${elegida.id}/bateo`} download className={formularios.botonChico}>
              Bateo
            </a>
            <a href={`/api/estadisticas/${elegida.id}/pitcheo`} download className={formularios.botonChico}>
              Pitcheo
            </a>
          </div>
        </section>
      )}
    </>
  );
}
