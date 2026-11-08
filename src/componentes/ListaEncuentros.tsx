import Link from 'next/link';
import type { Encuentro, Equipo } from '@/lib/consultas/liga';
import { formatearHoraSql } from '@/lib/fechas';
import { Escudo } from './Escudo';
import estilos from './lista-encuentros.module.css';

function EquipoChico({ equipo }: { equipo: Equipo }) {
  const contenido = (
    <>
      <Escudo logo={equipo.logo} nombre={equipo.nombre} tamano={28} className={estilos.escudo} />
      <span>{equipo.nombre}</span>
    </>
  );
  return equipo.slug ? (
    <Link prefetch={false} href={`/equipos/${equipo.slug}`} className={estilos.equipo}>
      {contenido}
    </Link>
  ) : (
    <span className={estilos.equipo}>{contenido}</span>
  );
}

export function ListaEncuentros({ encuentros }: { encuentros: Encuentro[] }) {
  return (
    <ul className={estilos.lista}>
      {encuentros.map((e) => (
        <li key={e.id} className={estilos.renglon}>
          <span className={estilos.equipos}>
            <EquipoChico equipo={e.visitante} />
            <span className={estilos.en}>en</span>
            <EquipoChico equipo={e.local} />
          </span>
          {(e.hora || e.sede || e.juegos.length > 1) && (
            <span className={estilos.detalle}>
              {[e.juegos.length > 1 ? `${e.juegos.length} juegos` : null, e.hora ? formatearHoraSql(e.hora) : null, e.sede]
                .filter(Boolean)
                .join(' · ')}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
