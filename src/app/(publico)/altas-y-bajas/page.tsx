import type { Metadata } from 'next';
import Link from 'next/link';
import { Encabezado, Vacio } from '@/componentes/Encabezado';
import { obtenerMovimientos, obtenerTemporadaVigente } from '@/lib/consultas/liga';
import { formatearFecha } from '@/lib/fechas';
import estilos from '../publico.module.css';
import estilosMovimientos from './movimientos.module.css';

export const metadata: Metadata = {
  title: 'Altas y bajas',
  description: 'Movimientos de plantilla aprobados por la liga en la temporada, con su fecha.',
  alternates: { canonical: '/altas-y-bajas' },
};

const CATEGORIAS: Record<string, string> = { local: 'Local', novato: 'Novato', nuevo_valor: 'Nuevo valor', refuerzo: 'Refuerzo' };

export default async function AltasYBajas() {
  const temporada = await obtenerTemporadaVigente();
  const filas = temporada ? await obtenerMovimientos(temporada.id) : [];
  const movimientos = filas
    .flatMap((f) => [
      ...(f.alta ? [{ ...f, tipo: 'Alta' as const, fecha: f.alta }] : []),
      ...(f.baja ? [{ ...f, tipo: 'Baja' as const, fecha: f.baja }] : []),
    ])
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <>
      <Encabezado antetitulo={temporada ? `Temporada ${temporada.nombre}` : null} titulo="Altas y bajas">
        <p>Los movimientos de plantilla que aprueba la liga, del más reciente al más antiguo.</p>
      </Encabezado>
      {movimientos.length === 0 ? (
        <Vacio titulo="Sin movimientos registrados">
          <p>
            En esta temporada todavía no se ha publicado ninguna alta ni baja. Las plantillas vigentes están en{' '}
            <Link prefetch={false} href="/equipos">Equipos</Link>.
          </p>
        </Vacio>
      ) : (
        <ul className={estilos.lista}>
          {movimientos.map((m) => (
            <li key={`${m.id}-${m.tipo}`} className={estilosMovimientos.movimiento}>
              <span className={`${estilosMovimientos.tipo} ${m.tipo === 'Baja' ? estilosMovimientos.baja : ''}`}>{m.tipo}</span>
              <span className={estilosMovimientos.quien}>
                <b>{m.nombre}</b>
                <span>
                  <Link prefetch={false} href={`/equipos/${m.equipoSlug}`}>{m.equipo}</Link>
                  {m.numero !== null ? ` · número ${m.numero}` : ''}
                  {m.categoria !== 'local' ? ` · ${CATEGORIAS[m.categoria]}` : ''}
                </span>
              </span>
              <time dateTime={m.fecha} className={estilosMovimientos.fecha}>
                {formatearFecha(m.fecha, { diaSemana: false })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
