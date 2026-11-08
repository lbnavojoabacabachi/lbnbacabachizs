'use client';

import type { ReactNode } from 'react';
import { useCampo } from './Formulario';
import estilos from './formularios.module.css';

type Base = {
  nombre: string;
  etiqueta: string;
  ayuda?: string;
  ancho?: 'corto' | 'medio' | 'completo';
};

function Envoltura({ nombre, etiqueta, ayuda, ancho = 'completo', children }: Base & { children: (ids: { id: string; describe?: string; invalido: boolean }) => ReactNode }) {
  const { id, error } = useCampo(nombre);
  const describe = [ayuda ? `${id}-ayuda` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`${estilos.campo} ${estilos[ancho]}`}>
      <label htmlFor={id} className={estilos.etiqueta}>
        {etiqueta}
      </label>
      {ayuda && (
        <span id={`${id}-ayuda`} className={estilos.ayuda}>
          {ayuda}
        </span>
      )}
      {children({ id, describe, invalido: Boolean(error) })}
      {error && (
        <span id={`${id}-error`} className={estilos.errorCampo}>
          {error}
        </span>
      )}
    </div>
  );
}

type PropiedadesTexto = Base & {
  valor?: string | number | null;
  tipo?: 'text' | 'date' | 'time' | 'url' | 'email' | 'tel' | 'number' | 'password';
  requerido?: boolean;
  maximo?: number;
  minimo?: number;
  maximoNumero?: number;
  autocompletar?: string;
  marcador?: string;
};

export function Texto({ valor, tipo = 'text', requerido, maximo, minimo, maximoNumero, autocompletar, marcador, ...base }: PropiedadesTexto) {
  return (
    <Envoltura {...base}>
      {({ id, describe, invalido }) => (
        <input
          id={id}
          name={base.nombre}
          type={tipo}
          defaultValue={valor ?? ''}
          required={requerido}
          maxLength={maximo}
          min={minimo}
          max={maximoNumero}
          inputMode={tipo === 'number' && (minimo ?? 0) >= 0 ? 'numeric' : undefined}
          autoComplete={autocompletar ?? 'off'}
          placeholder={marcador}
          aria-describedby={describe}
          aria-invalid={invalido || undefined}
          className={estilos.entrada}
        />
      )}
    </Envoltura>
  );
}

export function AreaTexto({ valor, filas = 6, maximo, requerido, ...base }: Base & { valor?: string | null; filas?: number; maximo?: number; requerido?: boolean }) {
  return (
    <Envoltura {...base}>
      {({ id, describe, invalido }) => (
        <textarea
          id={id}
          name={base.nombre}
          defaultValue={valor ?? ''}
          rows={filas}
          maxLength={maximo}
          required={requerido}
          aria-describedby={describe}
          aria-invalid={invalido || undefined}
          className={estilos.entrada}
        />
      )}
    </Envoltura>
  );
}

export type Opcion = { valor: string; texto: string };

export function Seleccion({ valor, opciones, vacio, requerido, ...base }: Base & { valor?: string | number | null; opciones: Opcion[]; vacio?: string; requerido?: boolean }) {
  return (
    <Envoltura {...base}>
      {({ id, describe, invalido }) => (
        <select
          id={id}
          name={base.nombre}
          defaultValue={valor === null || valor === undefined ? '' : String(valor)}
          required={requerido}
          aria-describedby={describe}
          aria-invalid={invalido || undefined}
          className={estilos.entrada}
        >
          {vacio !== undefined && <option value="">{vacio}</option>}
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.texto}
            </option>
          ))}
        </select>
      )}
    </Envoltura>
  );
}

export function Casilla({ nombre, etiqueta, marcada, ayuda }: { nombre: string; etiqueta: string; marcada?: boolean; ayuda?: string }) {
  const { id, error } = useCampo(nombre);
  return (
    <div className={estilos.casilla}>
      <input
        id={id}
        name={nombre}
        type="checkbox"
        defaultChecked={marcada}
        aria-describedby={ayuda ? `${id}-ayuda` : undefined}
        aria-invalid={Boolean(error) || undefined}
      />
      <label htmlFor={id}>
        {etiqueta}
        {ayuda && (
          <span id={`${id}-ayuda`} className={estilos.ayuda}>
            {ayuda}
          </span>
        )}
      </label>
      {error && <span className={estilos.errorCampo}>{error}</span>}
    </div>
  );
}

export function Oculto({ nombre, valor }: { nombre: string; valor: string | number }) {
  return <input type="hidden" name={nombre} value={valor} />;
}

export function Grupo({ titulo, children, ayuda }: { titulo: string; children: ReactNode; ayuda?: string }) {
  return (
    <fieldset className={estilos.grupo}>
      <legend className={estilos.leyenda}>{titulo}</legend>
      {ayuda && <p className={estilos.ayuda}>{ayuda}</p>}
      <div className={estilos.camposGrupo}>{children}</div>
    </fieldset>
  );
}

export function CasillasMultiples({
  nombre,
  etiqueta,
  opciones,
  marcadas,
  ayuda,
}: {
  nombre: string;
  etiqueta: string;
  opciones: Opcion[];
  marcadas: string[];
  ayuda?: string;
}) {
  const { id, error } = useCampo(nombre);
  return (
    <fieldset className={estilos.grupo} aria-describedby={error ? `${id}-error` : undefined}>
      <legend className={estilos.leyenda}>{etiqueta}</legend>
      {ayuda && <p className={estilos.ayuda}>{ayuda}</p>}
      <div className={estilos.casillas}>
        {opciones.map((o) => (
          <div key={o.valor} className={estilos.casilla}>
            <input id={`${id}-${o.valor}`} name={nombre} value={o.valor} type="checkbox" defaultChecked={marcadas.includes(o.valor)} />
            <label htmlFor={`${id}-${o.valor}`}>{o.texto}</label>
          </div>
        ))}
      </div>
      {error && (
        <span id={`${id}-error`} className={estilos.errorCampo}>
          {error}
        </span>
      )}
    </fieldset>
  );
}
