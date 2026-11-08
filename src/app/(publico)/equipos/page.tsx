import type { Metadata } from 'next';
import Link from 'next/link';
import { Encabezado, Vacio } from '@/componentes/Encabezado';
import { Escudo } from '@/componentes/Escudo';
import { obtenerEquipos, obtenerTemporadaVigente } from '@/lib/consultas/liga';
import { obtenerPosiciones } from '@/lib/consultas/posiciones';
import { formatearAve } from '@/lib/posiciones';
import estilosEquipos from './equipos.module.css';

export const metadata: Metadata = {
  title: 'Equipos',
  description: 'Los equipos de la temporada con su plantilla, cuerpo técnico y resultados.',
  alternates: { canonical: '/equipos' },
};

export default async function Equipos() {
  const temporada = await obtenerTemporadaVigente();
  const [equipos, posiciones] = temporada
    ? await Promise.all([obtenerEquipos(temporada.id), obtenerPosiciones(temporada.id)])
    : [[], []];
  const filaDe = new Map(posiciones.map((f) => [f.equipoId, f]));

  return (
    <>
      <Encabezado antetitulo={temporada ? `Temporada ${temporada.nombre}` : null} titulo="Equipos">
        <p>{equipos.length} equipos. Toca uno para ver su plantilla, su cuerpo técnico y sus resultados.</p>
      </Encabezado>
      {equipos.length === 0 ? (
        <Vacio titulo="Todavía no hay equipos registrados" />
      ) : (
        <ul className={estilosEquipos.equipos}>
          {equipos.map((equipo, i) => {
            const fila = filaDe.get(equipo.id);
            return (
              <li key={equipo.id}>
                <Link prefetch={false} href={`/equipos/${equipo.slug}`} className={estilosEquipos.equipo}>
                  <Escudo logo={equipo.logo} nombre={equipo.nombre} tamano={88} className={estilosEquipos.escudo} prioridad={i < 4} />
                  <span className={estilosEquipos.textos}>
                    <span className={estilosEquipos.nombre}>{equipo.nombre}</span>
                    {fila && (
                      <span className={estilosEquipos.marca}>
                        {fila.posicion}.º lugar · {fila.jg}-{fila.jp}
                        {fila.je ? `-${fila.je}` : ''} · AVE {formatearAve(fila.ave)}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
