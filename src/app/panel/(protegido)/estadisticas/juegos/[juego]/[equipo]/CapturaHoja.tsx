'use client';

import { Fragment, useRef, useState, type KeyboardEvent } from 'react';
import { Formulario, useCampo } from '@/app/panel/componentes/Formulario';
import formularios from '@/app/panel/componentes/formularios.module.css';
import { NOMBRES_BATEO } from '@/lib/estadisticas';
import {
  campoBateo,
  campoPitcheo,
  COLUMNAS_HOJA,
  interpretarPegado,
  MAXIMO_POR_JUEGO,
  OPCIONES_PITCHEO,
  SIGLAS_HOJA,
  type CeldasHoja,
  type ColumnaHoja,
} from '@/lib/hojas';
import type { AccionFormulario } from '@/lib/panel/estado';
import estilos from '../../../hojas.module.css';

export type JugadorCaptura = {
  jugadorId: number;
  nombre: string;
  numero: number | null;
  baja: boolean;
  celdas: CeldasHoja;
  pitcheo: string;
};

function Celda({ jugador, columna, fila }: { jugador: JugadorCaptura; columna: ColumnaHoja; fila: number }) {
  const nombre = campoBateo(jugador.jugadorId, columna);
  const { id, error } = useCampo(nombre);
  return (
    <label className={estilos.celda} htmlFor={id}>
      <span className={estilos.sigla} aria-hidden="true">
        {SIGLAS_HOJA[columna]}
      </span>
      <input
        id={id}
        name={nombre}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={2}
        autoComplete="off"
        defaultValue={jugador.celdas[columna]}
        aria-label={`${SIGLAS_HOJA[columna]}, ${NOMBRES_BATEO[columna].toLowerCase()} de ${jugador.nombre}`}
        aria-invalid={Boolean(error) || undefined}
        title={error}
        data-fila={fila}
        data-columna={columna}
        className={estilos.numero}
      />
    </label>
  );
}

function Lanzador({ jugador }: { jugador: JugadorCaptura }) {
  const nombre = campoPitcheo(jugador.jugadorId);
  const { id, error } = useCampo(nombre);
  return (
    <label className={estilos.pitcheo} htmlFor={id}>
      <span className={estilos.sigla} aria-hidden="true">
        Pitcheo
      </span>
      <select
        id={id}
        name={nombre}
        defaultValue={jugador.pitcheo}
        aria-label={`Pitcheo de ${jugador.nombre}`}
        aria-invalid={Boolean(error) || undefined}
        title={error}
        className={estilos.lanzador}
      >
        {OPCIONES_PITCHEO.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
    </label>
  );
}

function ErroresDeJugador({ jugador }: { jugador: JugadorCaptura }) {
  const { error: pitcheo } = useCampo(campoPitcheo(jugador.jugadorId));
  const apariciones = useCampo(campoBateo(jugador.jugadorId, 'apariciones')).error;
  const vecesAlBat = useCampo(campoBateo(jugador.jugadorId, 'vecesAlBat')).error;
  const hits = useCampo(campoBateo(jugador.jugadorId, 'hits')).error;
  const sencillos = useCampo(campoBateo(jugador.jugadorId, 'sencillos')).error;
  const dobles = useCampo(campoBateo(jugador.jugadorId, 'dobles')).error;
  const triples = useCampo(campoBateo(jugador.jugadorId, 'triples')).error;
  const jonrones = useCampo(campoBateo(jugador.jugadorId, 'jonrones')).error;
  const ponches = useCampo(campoBateo(jugador.jugadorId, 'ponches')).error;
  const basesPorBolas = useCampo(campoBateo(jugador.jugadorId, 'basesPorBolas')).error;
  const intencionales = useCampo(campoBateo(jugador.jugadorId, 'intencionales')).error;
  const golpeados = useCampo(campoBateo(jugador.jugadorId, 'golpeados')).error;
  const errores = [apariciones, vecesAlBat, hits, sencillos, dobles, triples, jonrones, ponches, basesPorBolas, intencionales, golpeados, pitcheo].filter(
    (e): e is string => Boolean(e),
  );
  if (errores.length === 0) return null;
  return <p className={estilos.errores}>{errores.map((e) => `${e.charAt(0).toUpperCase()}${e.slice(1)}`).join(' ')}</p>;
}

function moverEntreFilas(evento: KeyboardEvent<HTMLDivElement>) {
  const celda = evento.target;
  if (!(celda instanceof HTMLInputElement) || celda.dataset.fila === undefined) return;
  const paso = evento.key === 'Enter' || evento.key === 'ArrowDown' ? 1 : evento.key === 'ArrowUp' ? -1 : 0;
  if (paso === 0) return;
  evento.preventDefault();
  const destino = evento.currentTarget.querySelector<HTMLInputElement>(
    `input[data-fila="${Number(celda.dataset.fila) + paso}"][data-columna="${celda.dataset.columna}"]`,
  );
  if (!destino) return;
  destino.focus();
  destino.select();
}

export function CapturaHoja({
  accion,
  juegoId,
  equipoId,
  version,
  jugadores,
}: {
  accion: AccionFormulario;
  juegoId: number;
  equipoId: number;
  version: string;
  jugadores: JugadorCaptura[];
}) {
  const tabla = useRef<HTMLDivElement>(null);
  const pegado = useRef<HTMLTextAreaElement>(null);
  const [resultado, setResultado] = useState<{ llenados: number; errores: string[] } | null>(null);

  function llenar() {
    const { celdas, errores } = interpretarPegado(pegado.current?.value ?? '', jugadores);
    for (const [jugadorId, fila] of celdas) {
      for (const columna of COLUMNAS_HOJA) {
        const entrada = tabla.current?.querySelector<HTMLInputElement>(`input[name="${campoBateo(jugadorId, columna)}"]`);
        if (entrada) entrada.value = fila[columna];
      }
    }
    setResultado({ llenados: celdas.size, errores });
  }

  return (
    <div className={estilos.captura}>
      <details className={estilos.pegar}>
        <summary>Pegar desde Excel</summary>
        <label htmlFor="pegado-hoja" className={formularios.etiqueta}>
          Filas copiadas
        </label>
        <span id="pegado-hoja-ayuda" className={formularios.ayuda}>
          Una fila por jugador: nombre, AB, VB, HC, H1, H2, H3, HR, K, BB, BI y BG. Si copias también la fila de encabezados, las columnas se acomodan
          solas. Después revisa la hoja y guarda.
        </span>
        <textarea id="pegado-hoja" ref={pegado} rows={6} maxLength={20000} aria-describedby="pegado-hoja-ayuda" className={formularios.entrada} />
        <div>
          <button type="button" className={formularios.botonChico} onClick={llenar}>
            Llenar la hoja
          </button>
        </div>
        {resultado && (
          <div className={estilos.pegado} role="status">
            <p>
              {resultado.llenados === 1 ? 'Se llenó 1 jugador.' : `Se llenaron ${resultado.llenados} jugadores.`} Todavía no se guarda nada.
            </p>
            {resultado.errores.length > 0 && (
              <ul>
                {resultado.errores.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </details>

      <Formulario accion={accion} boton="Guardar y publicar" amplio>
        <input type="hidden" name="juegoId" value={juegoId} />
        <input type="hidden" name="equipoId" value={equipoId} />
        <div ref={tabla} className={estilos.tabla} onKeyDown={moverEntreFilas}>
          <div className={estilos.encabezado} aria-hidden="true">
            <span>Jugador</span>
            {COLUMNAS_HOJA.map((c) => (
              <span key={c} title={NOMBRES_BATEO[c]}>
                {SIGLAS_HOJA[c]}
              </span>
            ))}
            <span>Pitcheo</span>
          </div>
          <Fragment key={version}>
            {jugadores.map((jugador, fila) => (
              <div key={jugador.jugadorId} className={estilos.jugador} role="group" aria-label={jugador.nombre}>
                <span className={estilos.nombre}>
                  {jugador.nombre}
                  {(jugador.numero !== null || jugador.baja) && (
                    <small>{[jugador.numero !== null ? `#${jugador.numero}` : null, jugador.baja ? 'baja' : null].filter(Boolean).join(' · ')}</small>
                  )}
                </span>
                {COLUMNAS_HOJA.map((c) => (
                  <Celda key={c} jugador={jugador} columna={c} fila={fila} />
                ))}
                <Lanzador jugador={jugador} />
                <ErroresDeJugador jugador={jugador} />
              </div>
            ))}
          </Fragment>
        </div>
        <p className={formularios.ayuda}>
          Números de 0 a {MAXIMO_POR_JUEGO}. Al guardar se reemplaza lo que había de este equipo en este juego y los acumulados del sitio se actualizan.
        </p>
      </Formulario>
    </div>
  );
}
