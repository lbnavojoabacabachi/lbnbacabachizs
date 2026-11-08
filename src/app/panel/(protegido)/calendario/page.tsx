import type { Metadata } from 'next';
import Link from 'next/link';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { Seleccion, Texto } from '@/app/panel/componentes/Entradas';
import { obtenerCalendario, obtenerEquipos, obtenerTemporadaVigente } from '@/lib/consultas/liga';
import { formatearFecha } from '@/lib/fechas';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../panel.module.css';
import { CabeceraPagina } from '../componentes';
import { crearJornada } from './acciones';

export const metadata: Metadata = { title: 'Calendario' };

const NOMBRES_ESTADO: Record<string, string> = {
  preparacion: 'En preparación',
  regular: 'Temporada regular',
  postemporada: 'Postemporada',
  terminada: 'Terminada',
};

export default async function CalendarioPanel() {
  await exigirAdministrador();
  const temporada = await obtenerTemporadaVigente();
  if (!temporada) {
    return (
      <>
        <CabeceraPagina titulo="Calendario" />
        <p className={estilos.aviso}>
          No hay temporada vigente.{' '}
          <Link prefetch={false} href="/panel/calendario/temporadas">
            Crea una temporada
          </Link>{' '}
          para empezar a capturar el calendario.
        </p>
      </>
    );
  }
  const [jornadas, equipos] = await Promise.all([obtenerCalendario(temporada.id), obtenerEquipos(temporada.id)]);
  const siguiente = Math.max(0, ...jornadas.map((j) => j.numero)) + 1;
  const ultimaVuelta = jornadas.at(-1)?.vuelta ?? 1;

  return (
    <>
      <CabeceraPagina
        antetitulo={`Temporada ${temporada.nombre} · ${NOMBRES_ESTADO[temporada.estado]}`}
        titulo="Calendario"
        accion={
          <Link prefetch={false} href="/panel/calendario/temporadas" className={estilos.enlaceVolver}>
            Temporadas y equipos participantes
          </Link>
        }
      >
        <p>
          {jornadas.length} jornadas · {equipos.length} equipos. Toca una jornada para cambiar su fecha, quién descansa o sus encuentros.
        </p>
      </CabeceraPagina>

      <ul className={estilos.filas}>
        {jornadas.map((j) => (
          <li key={j.id} className={estilos.fila}>
            <div className={estilos.filaPrincipal}>
              <span className={estilos.filaTitulo}>
                <Link prefetch={false} href={`/panel/calendario/${j.numero}`}>
                  Jornada {j.numero}
                </Link>
              </span>
              <span className={estilos.filaDetalle}>
                {[
                  j.fecha ? formatearFecha(j.fecha) : 'Sin fecha',
                  `${j.encuentros.length} encuentros`,
                  j.descansa ? `descansa ${j.descansa.nombre}` : null,
                  j.nota,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <section className={estilos.seccion} aria-labelledby="titulo-nueva-jornada">
        <h2 id="titulo-nueva-jornada" className={estilos.subtitulo}>
          Agregar jornada
        </h2>
        <Formulario accion={crearJornada} boton="Agregar jornada" columnas reiniciar>
          <input type="hidden" name="temporadaId" value={temporada.id} />
          <Texto nombre="numero" etiqueta="Número" tipo="number" valor={siguiente} minimo={1} maximoNumero={99} requerido ancho="corto" />
          <Texto nombre="fecha" etiqueta="Fecha" tipo="date" ancho="corto" />
          <Texto nombre="vuelta" etiqueta="Vuelta" tipo="number" valor={ultimaVuelta} minimo={1} maximoNumero={9} ancho="corto" />
          <Seleccion
            nombre="descansaId"
            etiqueta="Descansa"
            vacio="Nadie"
            opciones={equipos.map((e) => ({ valor: String(e.id), texto: e.nombre }))}
            ancho="medio"
          />
          <Texto nombre="nota" etiqueta="Nota pública" maximo={200} ancho="medio" marcador="Por ejemplo: recorrida por lluvia" />
        </Formulario>
      </section>
    </>
  );
}
