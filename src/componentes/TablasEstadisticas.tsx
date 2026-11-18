import type { ReactNode } from 'react';
import {
  COLUMNAS_BATEO,
  COLUMNAS_PITCHEO,
  ENCABEZADOS_BATEO,
  ENCABEZADOS_PITCHEO,
  formatearPorcentaje,
  NOMBRES_BATEO,
  NOMBRES_PITCHEO,
  porcentajesDeBateo,
  sumarBateo,
  type ConteosBateo,
  type ConteosPitcheo,
  type FilaBateo,
  type FilaPitcheo,
} from '@/lib/estadisticas';
import estilos from './tablas-estadisticas.module.css';

export const COLUMNAS_DE_BATEO: [keyof ConteosBateo, string, string][] = COLUMNAS_BATEO.map((c, i) => [c, ENCABEZADOS_BATEO[i], NOMBRES_BATEO[c]]);

export const PORCENTAJES_DE_BATEO: [string, string][] = [
  ['AVG', 'Promedio de bateo: hits entre veces al bat'],
  ['OBP', 'Porcentaje de embasado: hits, bases por bolas, intencionales y golpeados entre apariciones al bat'],
  ['SLG', 'Slugging: bases totales (sencillo 1, doble 2, triple 3, jonrón 4) entre veces al bat'],
];

export const COLUMNAS_DE_PITCHEO: [keyof ConteosPitcheo, string, string][] = COLUMNAS_PITCHEO.map((c, i) => [c, ENCABEZADOS_PITCHEO[i], NOMBRES_PITCHEO[c]]);

function Contenedor({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className={estilos.contenedor} tabIndex={0} role="region" aria-label={`${titulo}, se desplaza a los lados`}>
      <table className={estilos.tabla}>
        <caption className="solo-lectores">{titulo}</caption>
        {children}
      </table>
    </div>
  );
}

function Porcentajes({ conteos }: { conteos: ConteosBateo }) {
  const p = porcentajesDeBateo(conteos);
  return (
    <>
      <td className={`${estilos.num} ${estilos.porcentaje}`}>{formatearPorcentaje(p.promedio)}</td>
      <td className={estilos.num}>{formatearPorcentaje(p.embasado)}</td>
      <td className={estilos.num}>{formatearPorcentaje(p.slugging)}</td>
    </>
  );
}

export function TablaBateo({ equipo, filas }: { equipo: string; filas: FilaBateo[] }) {
  const totales = sumarBateo(filas);
  return (
    <Contenedor titulo={`Bateo de ${equipo}`}>
      <thead>
        <tr>
          <th scope="col" className={estilos.jugador}>
            Jugador
          </th>
          {[...COLUMNAS_DE_BATEO.map(([, sigla, nombre]) => [sigla, nombre]), ...PORCENTAJES_DE_BATEO].map(([sigla, nombre]) => (
            <th key={sigla} scope="col" className={estilos.num}>
              <abbr title={nombre}>{sigla}</abbr>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filas.map((f, i) => (
          <tr key={i} className={f.acumulado ? estilos.acumulado : undefined}>
            <th scope="row" className={estilos.jugador}>
              {f.nombre}
              {f.acumulado && <span className={estilos.marca}> (total)</span>}
            </th>
            {COLUMNAS_DE_BATEO.map(([clave]) => (
              <td key={clave} className={estilos.num}>
                {f[clave]}
              </td>
            ))}
            <Porcentajes conteos={f} />
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" className={estilos.jugador}>
            Totales
          </th>
          {COLUMNAS_DE_BATEO.map(([clave]) => (
            <td key={clave} className={estilos.num}>
              {clave === 'juegos' ? '' : totales[clave]}
            </td>
          ))}
          <Porcentajes conteos={totales} />
        </tr>
      </tfoot>
    </Contenedor>
  );
}

export function TablaPitcheo({ equipo, filas }: { equipo: string; filas: FilaPitcheo[] }) {
  return (
    <Contenedor titulo={`Pitcheo de ${equipo}`}>
      <thead>
        <tr>
          <th scope="col" className={estilos.jugador}>
            Pitcher
          </th>
          {COLUMNAS_DE_PITCHEO.map(([clave, sigla, nombre]) => (
            <th key={clave} scope="col" className={estilos.num}>
              <abbr title={nombre}>{sigla}</abbr>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filas.map((f, i) => (
          <tr key={i}>
            <th scope="row" className={estilos.jugador}>
              {f.nombre}
            </th>
            {COLUMNAS_DE_PITCHEO.map(([clave]) => (
              <td key={clave} className={estilos.num}>
                {f[clave]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Contenedor>
  );
}
