import type { ReactNode } from 'react';
import {
  formatearPorcentaje,
  porcentajesDeBateo,
  sumarBateo,
  type ConteosBateo,
  type ConteosPitcheo,
  type FilaBateo,
  type FilaPitcheo,
} from '@/lib/estadisticas';
import estilos from './tablas-estadisticas.module.css';

export const COLUMNAS_DE_BATEO: [keyof ConteosBateo, string, string][] = [
  ['juegos', 'JJ', 'Juegos jugados'],
  ['apariciones', 'AB', 'Apariciones al bat'],
  ['vecesAlBat', 'VB', 'Veces al bat'],
  ['hits', 'HC', 'Hits conectados'],
  ['sencillos', 'H1', 'Sencillos'],
  ['dobles', 'H2', 'Dobles'],
  ['triples', 'H3', 'Triples'],
  ['jonrones', 'HR', 'Jonrones'],
  ['ponches', 'K', 'Ponches'],
  ['basesPorBolas', 'BB', 'Bases por bolas'],
  ['intencionales', 'BI', 'Bases por bolas intencionales'],
  ['golpeados', 'BG', 'Golpeados por lanzamiento'],
];

export const PORCENTAJES_DE_BATEO: [string, string][] = [
  ['AVG', 'Promedio de bateo: hits entre veces al bat'],
  ['OBP', 'Porcentaje de embasado: hits, bases por bolas, intencionales y golpeados entre apariciones al bat'],
  ['SLG', 'Slugging: bases totales (sencillo 1, doble 2, triple 3, jonrón 4) entre veces al bat'],
];

export const COLUMNAS_DE_PITCHEO: [keyof ConteosPitcheo, string, string][] = [
  ['juegos', 'JJ', 'Juegos lanzados'],
  ['ganados', 'G', 'Juegos ganados'],
  ['perdidos', 'P', 'Juegos perdidos'],
  ['salvados', 'SV', 'Juegos salvados'],
];

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
