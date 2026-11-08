import type { Metadata } from 'next';
import Link from 'next/link';
import { Encabezado, Vacio } from '@/componentes/Encabezado';
import { obtenerTemporadaVigente } from '@/lib/consultas/liga';
import estilos from '../publico.module.css';

export const metadata: Metadata = {
  title: 'Estadísticas',
  description: 'Líderes de bateo y pitcheo de la temporada y tablas por equipo.',
  alternates: { canonical: '/estadisticas' },
};

const LIDERES = ['Promedio de bateo (AVE)', 'Jonrones', 'Hits', 'Carreras impulsadas', 'Juegos ganados como pitcher'];

export default async function Estadisticas() {
  const temporada = await obtenerTemporadaVigente();
  return (
    <>
      <Encabezado antetitulo={temporada ? `Temporada ${temporada.nombre}` : null} titulo="Estadísticas" />
      <Vacio titulo="Las estadísticas de la temporada se publican pronto">
        <p>Cuando la liga las capture, aquí vas a encontrar a los líderes en:</p>
        <ul className={estilos.lista}>
          {LIDERES.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <p>
          Y la tabla de cada equipo, que se puede ordenar por columna. Mientras tanto, la <Link prefetch={false} href="/posiciones">tabla de posiciones</Link>{' '}
          ya está al día.
        </p>
      </Vacio>
    </>
  );
}
