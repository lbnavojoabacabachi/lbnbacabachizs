import type { Metadata } from 'next';
import Link from 'next/link';
import { jornadasConAvance } from '@/lib/consultas/panel';
import { obtenerTemporadaVigente } from '@/lib/consultas/liga';
import { formatearFecha, hoyEnSonora } from '@/lib/fechas';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../panel.module.css';
import { CabeceraPagina, SinTemporada } from '../componentes';

export const metadata: Metadata = { title: 'Resultados' };

export default async function Resultados() {
  await exigirAdministrador();
  const temporada = await obtenerTemporadaVigente();
  if (!temporada) {
    return (
      <>
        <CabeceraPagina titulo="Resultados" />
        <SinTemporada />
      </>
    );
  }
  const jornadas = await jornadasConAvance(temporada.id);
  const hoy = hoyEnSonora();
  const porCapturar = jornadas.find((j) => j.capturados < j.juegos && j.fecha !== null && j.fecha <= hoy);

  return (
    <>
      <CabeceraPagina
        antetitulo={`Temporada ${temporada.nombre}`}
        titulo="Resultados"
        accion={
          porCapturar ? (
            <Link prefetch={false} href={`/panel/resultados/${porCapturar.numero}`} className={estilos.enlaceBoton}>
              Capturar jornada {porCapturar.numero}
            </Link>
          ) : undefined
        }
      >
        <p>Elige la jornada. Al guardar, el marcador y la tabla de posiciones se actualizan en el sitio.</p>
      </CabeceraPagina>
      <ul className={estilos.filas}>
        {jornadas.map((j) => {
          const completa = j.juegos > 0 && j.capturados === j.juegos;
          const atrasada = !completa && j.fecha !== null && j.fecha <= hoy;
          return (
            <li key={j.id} className={estilos.fila}>
              <div className={estilos.filaPrincipal}>
                <span className={estilos.filaTitulo}>
                  <Link prefetch={false} href={`/panel/resultados/${j.numero}`}>
                    Jornada {j.numero}
                  </Link>
                </span>
                <span className={estilos.filaDetalle}>
                  {j.fecha ? formatearFecha(j.fecha) : 'Sin fecha'} · {j.capturados} de {j.juegos} juegos capturados
                </span>
              </div>
              <span className={completa ? estilos.etiquetaOk : atrasada ? estilos.etiquetaPendiente : estilos.etiquetaNeutra}>
                {completa ? 'Completa' : atrasada ? 'Por capturar' : j.capturados > 0 ? 'Incompleta' : 'Próxima'}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
