import Link from 'next/link';
import type { Equipo } from '@/lib/consultas/liga';
import type { FilaConRacha } from '@/lib/consultas/posiciones';
import { describirRacha } from '@/lib/jornadas';
import { formatearAve } from '@/lib/posiciones';
import { Escudo } from './Escudo';
import estilos from './tabla-posiciones.module.css';

type Propiedades = {
  filas: FilaConRacha[];
  equipos: Equipo[];
  completa?: boolean;
  titulo: string;
};

function Diferencia({ valor }: { valor: number }) {
  if (valor > 0) return <span className={estilos.positiva}>+{valor}</span>;
  if (valor < 0) return <span className={estilos.negativa}>−{Math.abs(valor)}</span>;
  return <span>0</span>;
}

export function TablaPosiciones({ filas, equipos, completa = false, titulo }: Propiedades) {
  const porId = new Map(equipos.map((e) => [e.id, e]));
  return (
    <div
      className={`${estilos.contenedor} ${completa ? estilos.completa : ''}`}
      tabIndex={completa ? 0 : undefined}
      role={completa ? 'region' : undefined}
      aria-label={completa ? `${titulo}, se desplaza a los lados` : undefined}
    >
      <table className={estilos.tabla}>
        <caption className="solo-lectores">{titulo}</caption>
        <thead>
          <tr>
            <th scope="col" className={estilos.pos}>
              <abbr title="Posición">#</abbr>
            </th>
            <th scope="col" className={estilos.colEquipo}>
              Equipo
            </th>
            {completa && (
              <th scope="col" className={estilos.num}>
                <abbr title="Juegos jugados">JJ</abbr>
              </th>
            )}
            <th scope="col" className={estilos.num}>
              <abbr title="Juegos ganados">JG</abbr>
            </th>
            <th scope="col" className={estilos.num}>
              <abbr title="Juegos perdidos">JP</abbr>
            </th>
            {completa && (
              <th scope="col" className={estilos.num}>
                <abbr title="Juegos empatados">JE</abbr>
              </th>
            )}
            <th scope="col" className={estilos.num}>
              <abbr title="Promedio de juegos ganados">AVE</abbr>
            </th>
            {completa && (
              <>
                <th scope="col" className={estilos.num}>
                  <abbr title="Carreras a favor">CF</abbr>
                </th>
                <th scope="col" className={estilos.num}>
                  <abbr title="Carreras en contra">CC</abbr>
                </th>
                <th scope="col" className={estilos.num}>
                  <abbr title="Diferencia de carreras">DIF</abbr>
                </th>
                <th scope="col" className={estilos.num}>
                  Racha
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => {
            const equipo = porId.get(fila.equipoId);
            return (
              <tr key={fila.equipoId} className={fila.posicion === 1 ? estilos.lider : undefined}>
                <td className={estilos.pos}>{fila.posicion}</td>
                <th scope="row" className={estilos.colEquipo}>
                  <span className={estilos.equipo}>
                    <Escudo logo={equipo?.logo ?? null} nombre={fila.nombre} tamano={28} className={estilos.escudo} />
                    {equipo?.slug ? <Link prefetch={false} href={`/equipos/${equipo.slug}`}>{fila.nombre}</Link> : fila.nombre}
                  </span>
                </th>
                {completa && <td className={estilos.num}>{fila.jj}</td>}
                <td className={estilos.num}>{fila.jg}</td>
                <td className={estilos.num}>{fila.jp}</td>
                {completa && <td className={estilos.num}>{fila.je}</td>}
                <td className={`${estilos.num} ${estilos.ave}`}>{formatearAve(fila.ave)}</td>
                {completa && (
                  <>
                    <td className={estilos.num}>{fila.cf}</td>
                    <td className={estilos.num}>{fila.cc}</td>
                    <td className={estilos.num}>
                      <Diferencia valor={fila.dif} />
                    </td>
                    <td className={estilos.num}>
                      {fila.racha ? (
                        <abbr title={describirRacha(fila.racha)}>
                          {fila.racha.resultado}
                          {fila.racha.cuenta}
                        </abbr>
                      ) : (
                        '–'
                      )}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
