'use client';

import { Formulario, useCampo } from '@/app/panel/componentes/Formulario';
import estilosFormulario from '@/app/panel/componentes/formularios.module.css';
import { ESTADOS_CAPTURA } from '@/lib/panel/resultados';
import type { AccionFormulario } from '@/lib/panel/estado';
import estilos from './captura.module.css';

export type JuegoCaptura = {
  id: number;
  numero: number;
  visita: number | null;
  local: number | null;
  estado: string;
  cuenta: boolean;
  nota: string | null;
};

export type EncuentroCaptura = { id: number; local: string; visitante: string; juegos: JuegoCaptura[] };

function Carreras({ juego, lado, equipo }: { juego: JuegoCaptura; lado: 'visita' | 'local'; equipo: string }) {
  const nombre = `j-${juego.id}-${lado}`;
  const { id, error } = useCampo(nombre);
  const estado = useCampo(`j-${juego.id}-estado`);
  return (
    <span className={estilos.celda}>
      <input
        id={id}
        name={nombre}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={2}
        autoComplete="off"
        defaultValue={juego[lado] ?? ''}
        aria-label={`Carreras de ${equipo} en el juego ${juego.numero}`}
        aria-invalid={Boolean(error) || undefined}
        title={error}
        className={estilos.placa}
        onInput={(e) => {
          const selector = document.getElementById(estado.id);
          if (e.currentTarget.value !== '' && selector instanceof HTMLSelectElement && selector.value === 'programado') selector.value = 'jugado';
        }}
      />
    </span>
  );
}

function Estado({ juego }: { juego: JuegoCaptura }) {
  const nombre = `j-${juego.id}-estado`;
  const { id, error } = useCampo(nombre);
  return (
    <div className={estilosFormulario.campo}>
      <label htmlFor={id} className={estilos.etiquetaChica}>
        Juego {juego.numero}
      </label>
      <select id={id} name={nombre} defaultValue={juego.estado} className={estilosFormulario.entrada} aria-invalid={Boolean(error) || undefined}>
        {ESTADOS_CAPTURA.map((e) => (
          <option key={e.valor} value={e.valor}>
            {e.texto}
          </option>
        ))}
      </select>
    </div>
  );
}

function ErroresJuego({ juego }: { juego: JuegoCaptura }) {
  const visita = useCampo(`j-${juego.id}-visita`).error;
  const local = useCampo(`j-${juego.id}-local`).error;
  const estado = useCampo(`j-${juego.id}-estado`).error;
  const nota = useCampo(`j-${juego.id}-nota`).error;
  const errores = [visita, local, estado, nota].filter(Boolean);
  if (errores.length === 0) return null;
  return (
    <p className={estilosFormulario.errorCampo}>
      Juego {juego.numero}: {errores.join(' ')}
    </p>
  );
}

function Opciones({ juego }: { juego: JuegoCaptura }) {
  const cuenta = useCampo(`j-${juego.id}-cuenta`);
  const nota = useCampo(`j-${juego.id}-nota`);
  return (
    <div className={estilos.opcionesJuego}>
      <p className={estilos.etiquetaChica}>Juego {juego.numero}</p>
      <div className={estilosFormulario.casilla}>
        <input id={cuenta.id} name={`j-${juego.id}-cuenta`} type="checkbox" defaultChecked={juego.cuenta} />
        <label htmlFor={cuenta.id}>Cuenta para la tabla</label>
      </div>
      <div className={estilosFormulario.campo}>
        <label htmlFor={nota.id} className={estilos.etiquetaChica}>
          Nota pública
        </label>
        <input
          id={nota.id}
          name={`j-${juego.id}-nota`}
          type="text"
          maxLength={200}
          defaultValue={juego.nota ?? ''}
          placeholder="Por ejemplo: se terminó en la 5.ª entrada por lluvia"
          className={estilosFormulario.entrada}
        />
      </div>
    </div>
  );
}

export function CapturaResultados({
  accion,
  jornadaId,
  encuentros,
}: {
  accion: AccionFormulario;
  jornadaId: number;
  encuentros: EncuentroCaptura[];
}) {
  const columnas = Math.max(1, ...encuentros.map((e) => e.juegos.length));
  return (
    <Formulario accion={accion} boton="Guardar y publicar">
      <input type="hidden" name="jornadaId" value={jornadaId} />
      {encuentros.flatMap((e) => e.juegos).map((j) => (
        <input key={j.id} type="hidden" name="juegos" value={j.id} />
      ))}
      <div className={estilos.encuentros}>
        {encuentros.map((e) => (
          <fieldset key={e.id} className={estilos.encuentro}>
            <legend className={estilos.leyenda}>
              {e.visitante} en {e.local}
            </legend>
            <div className={estilos.marcador} style={{ gridTemplateColumns: `minmax(0, 1fr) repeat(${columnas}, 64px)` }}>
              <span aria-hidden="true" />
              {Array.from({ length: columnas }, (_, i) => (
                <span key={i} className={estilos.columna} aria-hidden="true">
                  J{i + 1}
                </span>
              ))}
              <span className={estilos.equipo}>
                {e.visitante}
                <small>Visita</small>
              </span>
              {Array.from({ length: columnas }, (_, i) => {
                const juego = e.juegos.find((j) => j.numero === i + 1);
                return juego ? <Carreras key={i} juego={juego} lado="visita" equipo={e.visitante} /> : <span key={i} />;
              })}
              <span className={estilos.equipo}>
                {e.local}
                <small>Local</small>
              </span>
              {Array.from({ length: columnas }, (_, i) => {
                const juego = e.juegos.find((j) => j.numero === i + 1);
                return juego ? <Carreras key={i} juego={juego} lado="local" equipo={e.local} /> : <span key={i} />;
              })}
            </div>
            <div className={estilos.estados}>
              {e.juegos.map((j) => (
                <Estado key={j.id} juego={j} />
              ))}
            </div>
            {e.juegos.map((j) => (
              <ErroresJuego key={j.id} juego={j} />
            ))}
            <details className={estilos.mas}>
              <summary>Caso especial: no cuenta para la tabla o nota pública</summary>
              {e.juegos.map((j) => (
                <Opciones key={j.id} juego={j} />
              ))}
            </details>
          </fieldset>
        ))}
      </div>
    </Formulario>
  );
}
