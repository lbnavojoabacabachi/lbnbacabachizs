import type { Metadata } from 'next';
import { Encabezado, Vacio } from '@/componentes/Encabezado';
import { TablaPosiciones } from '@/componentes/TablaPosiciones';
import { obtenerAjustes, obtenerCalendario, obtenerEquipos, obtenerReglas, obtenerTemporadaVigente } from '@/lib/consultas/liga';
import { obtenerPosiciones } from '@/lib/consultas/posiciones';
import { hoyEnSonora } from '@/lib/fechas';
import { resumirJornadas } from '@/lib/jornadas';
import estilos from '../publico.module.css';
import estilosPosiciones from './posiciones.module.css';

export const metadata: Metadata = {
  title: 'Posiciones',
  description: 'Tabla de posiciones de la temporada: juegos ganados y perdidos, promedio, carreras a favor y en contra, diferencia y racha.',
  alternates: { canonical: '/posiciones' },
};

const CRITERIOS: Record<string, string> = {
  ave: 'promedio (AVE)',
  diferencia_carreras: 'diferencia de carreras',
  carreras_favor: 'carreras a favor',
  carreras_contra: 'menos carreras en contra',
  ganados: 'juegos ganados',
};

const ABREVIATURAS = [
  ['JJ', 'Juegos jugados'],
  ['JG', 'Juegos ganados'],
  ['JP', 'Juegos perdidos'],
  ['JE', 'Juegos empatados'],
  ['AVE', 'Ganados entre ganados más perdidos'],
  ['CF', 'Carreras a favor'],
  ['CC', 'Carreras en contra'],
  ['DIF', 'Carreras a favor menos en contra'],
  ['Racha', 'Resultados seguidos más recientes: G ganados, P perdidos, E empates'],
];

function plural(cantidad: number, singular: string, varios: string) {
  return `${cantidad} ${cantidad === 1 ? singular : varios}`;
}

export default async function Posiciones() {
  const temporada = await obtenerTemporadaVigente();
  if (!temporada) {
    return (
      <>
        <Encabezado titulo="Posiciones" />
        <Vacio titulo="Todavía no hay temporada en curso" />
      </>
    );
  }
  const [filas, equipos, reglas, ajustes, jornadas] = await Promise.all([
    obtenerPosiciones(temporada.id),
    obtenerEquipos(temporada.id),
    obtenerReglas(temporada.id),
    obtenerAjustes(temporada.id),
    obtenerCalendario(temporada.id),
  ]);
  const { ultima } = resumirJornadas(jornadas, hoyEnSonora());
  const desempate = reglas.criteriosDesempate.map((c) => CRITERIOS[c]).filter(Boolean);

  return (
    <>
      <Encabezado antetitulo={`Temporada ${temporada.nombre}`} titulo="Posiciones">
        <p>{ultima ? `Con los resultados publicados hasta la jornada ${ultima.numero}.` : 'Sin juegos jugados todavía.'}</p>
      </Encabezado>

      <section className={estilos.seccion} aria-label="Tabla de posiciones">
        <TablaPosiciones filas={filas} equipos={equipos} completa titulo="Tabla de posiciones" />
        <p className={`${estilos.nota} ${estilosPosiciones.deslizar}`}>Desliza la tabla a los lados para ver todas las columnas.</p>
      </section>

      {ajustes.length > 0 && (
        <section className={estilos.seccion} aria-labelledby="titulo-ajustes">
          <div className={estilos.seccionCabeza}>
            <h2 id="titulo-ajustes" className={estilos.tituloSeccion}>
              Ajustes de la liga
            </h2>
          </div>
          <ul className={estilos.lista}>
            {ajustes.map((a, i) => (
              <li key={i}>
                <b>{a.equipo}</b>:{' '}
                {[
                  a.ganados ? `${a.ganados > 0 ? '+' : '−'}${plural(Math.abs(a.ganados), 'ganado', 'ganados')}` : null,
                  a.perdidos ? `${a.perdidos > 0 ? '+' : '−'}${plural(Math.abs(a.perdidos), 'perdido', 'perdidos')}` : null,
                ]
                  .filter(Boolean)
                  .join(', ')}
                . {a.motivo}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={estilos.seccion} aria-labelledby="titulo-reglas">
        <div className={estilos.seccionCabeza}>
          <h2 id="titulo-reglas" className={estilos.tituloSeccion}>
            Cómo se calcula
          </h2>
        </div>
        <div className={estilos.dos}>
          <div className={estilos.texto}>
            <p>
              El promedio (AVE) es el número de juegos ganados entre la suma de ganados y perdidos. El empate cuenta como juego jugado,
              pero no entra al promedio.
            </p>
            <p>
              Un juego por forfeit se da por ganado al rival {reglas.forfeitCarrerasGanador}-{reglas.forfeitCarrerasPerdedor}.{' '}
              {reglas.forfeitCuentaCarreras
                ? 'Esas carreras se suman a las carreras a favor y en contra.'
                : 'Esas carreras no se suman a las carreras a favor ni en contra.'}
            </p>
            {desempate.length > 0 && <p>Si dos equipos empatan, se ordenan por {desempate.join(', luego por ')}.</p>}
            <p>Cuando la liga decide que un juego no cuenta o aplica una sanción, se explica en la jornada o aquí arriba.</p>
          </div>
          <dl className={estilosPosiciones.abreviaturas}>
            {ABREVIATURAS.map(([sigla, significado]) => (
              <div key={sigla}>
                <dt>{sigla}</dt>
                <dd>{significado}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
