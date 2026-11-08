import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { obtenerTemporadaVigente } from '@/lib/consultas/liga';
import { jornadaParaCaptura } from '@/lib/consultas/panel';
import { describirJornada } from '@/lib/jornadas';
import { estadoParaCaptura } from '@/lib/panel/resultados';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../../panel.module.css';
import { CabeceraPagina, Volver } from '../../componentes';
import { guardarResultados } from '../acciones';
import { CapturaResultados } from './CapturaResultados';

type Parametros = { params: Promise<{ numero: string }> };

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  return { title: `Resultados de la jornada ${(await params).numero}` };
}

export default async function CapturarJornada({ params }: Parametros) {
  await exigirAdministrador();
  const { numero } = await params;
  const temporada = await obtenerTemporadaVigente();
  if (!temporada || !/^\d{1,3}$/.test(numero)) notFound();
  const datos = await jornadaParaCaptura(temporada.id, Number(numero));
  if (!datos) notFound();
  const { jornada, encuentros } = datos;

  return (
    <>
      <Volver href="/panel/resultados" texto="Todas las jornadas" />
      <CabeceraPagina antetitulo={`Temporada ${temporada.nombre}`} titulo={`Jornada ${jornada.numero}`}>
        <p>{describirJornada(jornada)}</p>
        {jornada.nota && <p className={estilos.aviso}>{jornada.nota}</p>}
      </CabeceraPagina>
      <p className={estilos.aviso}>
        Escribe las carreras de cada juego. Si un equipo no se presentó, elige el forfeit y deja las carreras vacías: el marcador lo
        pone la regla de la temporada. Para cambiar equipos, fechas o el número de juegos, usa{' '}
        <Link prefetch={false} href="/panel/calendario">
          Calendario
        </Link>
        .
      </p>
      {encuentros.length === 0 ? (
        <p className={estilos.vacio}>Esta jornada todavía no tiene encuentros.</p>
      ) : (
        <CapturaResultados
          accion={guardarResultados}
          jornadaId={jornada.id}
          encuentros={encuentros.map((e) => ({
            id: e.id,
            local: e.local,
            visitante: e.visitante,
            juegos: e.juegos.map((g) => ({
              id: g.id,
              numero: g.numero,
              visita: g.carrerasVisitante,
              local: g.carrerasLocal,
              estado: estadoParaCaptura(g, e.localId),
              cuenta: g.cuentaParaTabla,
              nota: g.notaPublica,
            })),
          }))}
        />
      )}
      <Link prefetch={false} href={`/jornadas/${jornada.numero}`} className={estilos.enlaceVolver}>
        Ver la jornada {jornada.numero} en el sitio
      </Link>
    </>
  );
}
