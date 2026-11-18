import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BotonAccion } from '@/app/panel/componentes/BotonAccion';
import formularios from '@/app/panel/componentes/formularios.module.css';
import { hojaGuardada, juegoParaHoja, modoDeEstadisticas, plantillaParaHoja } from '@/lib/consultas/hojas';
import { capitalizar, formatearFecha, formatearInstante } from '@/lib/fechas';
import { celdasDe, celdasVacias } from '@/lib/hojas';
import { rolDe } from '@/lib/roles';
import { exigirCompilador } from '@/lib/sesion';
import estilos from '../../../../../panel.module.css';
import { CabeceraPagina, Volver } from '../../../../componentes';
import { borrarHoja, guardarHoja, marcarSinHoja } from '../../../acciones';
import estilosHoja from '../../../hojas.module.css';
import { CapturaHoja } from './CapturaHoja';

export const metadata: Metadata = { title: 'Hoja del juego' };

const ID = /^\d{1,9}$/;

export default async function HojaDelJuego({ params }: { params: Promise<{ juego: string; equipo: string }> }) {
  const sesion = await exigirCompilador();
  const { juego: juegoTexto, equipo: equipoTexto } = await params;
  if (!ID.test(juegoTexto) || !ID.test(equipoTexto)) notFound();
  const juego = await juegoParaHoja(Number(juegoTexto), Number(equipoTexto));
  if (!juego) notFound();
  const [plantilla, hoja, modo] = await Promise.all([
    plantillaParaHoja(juego.temporadaId, juego.equipo.id),
    hojaGuardada(juego.juegoId, juego.equipo.id),
    modoDeEstadisticas(juego.temporadaId),
  ]);
  const esAdministrador = rolDe(sesion.user.rol) === 'administrador';
  const volver = `/panel/estadisticas?temporada=${juego.temporadaId}#jornada-${juego.jornada}` as Route;
  const estado = !hoja
    ? 'Todavía no se captura.'
    : hoja.sinNumeros
      ? 'Marcada sin hoja de anotación: no suma a los acumulados.'
      : `Capturada; último cambio: ${formatearInstante(hoja.actualizadoEn, { diaSemana: false })}.`;

  return (
    <>
      <Volver href={volver} texto="Estadísticas" />
      <CabeceraPagina
        antetitulo={`Jornada ${juego.jornada} · juego ${juego.numero}${juego.fecha ? ` · ${capitalizar(formatearFecha(juego.fecha))}` : ''}`}
        titulo={juego.equipo.nombre}
        accion={
          <Link prefetch={false} href={`/panel/estadisticas/juegos/${juego.juegoId}/${juego.rival.id}` as Route} className={formularios.botonChico}>
            Hoja de {juego.rival.nombre}
          </Link>
        }
      >
        <p>
          {juego.equipo.nombre} {juego.equipo.carreras}, {juego.rival.nombre} {juego.rival.carreras}. {estado}
        </p>
        <p>
          Llena solo a quienes jugaron y deja en blanco a los demás. Si dejas vacío HC o H1, se calcula con los otros hits. Con Enter bajas al siguiente
          jugador.
        </p>
      </CabeceraPagina>

      {modo === 'totales' ? (
        <p className={estilos.aviso}>
          La temporada {juego.temporada} se lleva con los totales pegados por equipo, así que aquí no se captura juego por juego.
        </p>
      ) : plantilla.length === 0 ? (
        <p className={estilos.aviso}>
          {juego.equipo.nombre} todavía no tiene plantilla en la temporada {juego.temporada}.{' '}
          {esAdministrador ? (
            <>
              Captúrala o cópiala de la temporada anterior en{' '}
              <Link prefetch={false} href={`/panel/equipos/${juego.equipo.id}` as Route}>
                Equipos
              </Link>
              .
            </>
          ) : (
            'Pide a un administrador que la capture en Equipos; después aparecerán aquí los jugadores.'
          )}
        </p>
      ) : (
        <>
          <CapturaHoja
            key={`${juego.juegoId}-${juego.equipo.id}`}
            accion={guardarHoja}
            juegoId={juego.juegoId}
            equipoId={juego.equipo.id}
            version={hoja ? String(hoja.actualizadoEn.getTime()) : 'pendiente'}
            jugadores={plantilla.map((j) => {
              const conteos = hoja?.bateo.get(j.jugadorId);
              return {
                jugadorId: j.jugadorId,
                nombre: j.nombre,
                numero: j.numero,
                baja: j.baja !== null,
                celdas: conteos ? celdasDe(conteos) : celdasVacias(),
                pitcheo: hoja?.pitcheo.get(j.jugadorId) ?? '',
              };
            })}
          />
          <section className={estilos.seccion} aria-labelledby="titulo-otras">
            <h2 id="titulo-otras" className={estilos.subtitulo}>
              Otras opciones
            </h2>
            <p className={formularios.ayuda}>
              {esAdministrador
                ? 'Si falta un jugador, dalo de alta en Equipos y vuelve a esta hoja.'
                : 'Si falta un jugador, pide a un administrador que lo dé de alta en Equipos.'}{' '}
              Si de este juego no existe hoja de anotación, márcalo para que deje de aparecer como pendiente.
            </p>
            <div className={estilosHoja.otras}>
              {!hoja?.sinNumeros && (
                <BotonAccion
                  accion={marcarSinHoja.bind(null, juego.juegoId, juego.equipo.id)}
                  texto="No hay hoja de este juego"
                  confirmar={
                    hoja
                      ? `¿Marcar que no hay hoja de ${juego.equipo.nombre} en este juego? Se borra lo capturado.`
                      : `¿Marcar que no hay hoja de ${juego.equipo.nombre} en este juego?`
                  }
                  destino={volver}
                />
              )}
              {hoja && (
                <BotonAccion
                  accion={borrarHoja.bind(null, juego.juegoId, juego.equipo.id)}
                  texto={hoja.sinNumeros ? 'Volver a dejarla pendiente' : 'Borrar esta hoja'}
                  confirmar={hoja.sinNumeros ? undefined : `¿Borrar lo capturado de ${juego.equipo.nombre} en este juego? Vuelve a quedar pendiente.`}
                  peligro={!hoja.sinNumeros}
                  destino={volver}
                />
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}
