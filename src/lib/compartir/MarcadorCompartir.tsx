import type { Encuentro } from '@/lib/consultas/liga';
import type { Lado } from '@/lib/jornadas';
import { COLORES_COMPARTIR as C } from './recursos';

function Fila({ encuentro, lado, columnas }: { encuentro: Encuentro; lado: Lado; columnas: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: lado === 'local' ? 6 : 0 }}>
      <div style={{ display: 'flex', flexGrow: 1, fontSize: 27, fontWeight: 700, lineHeight: 1.1 }}>{encuentro[lado].nombre}</div>
      {Array.from({ length: columnas }, (_, i) => {
        const juego = encuentro.juegos.find((j) => j.numero === i + 1);
        const carreras = juego ? juego[lado] : null;
        const gana = juego?.ganador === lado;
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'center',
              width: 62,
              marginLeft: 6,
              padding: '4px 0 2px',
              background: C.pizarra,
              color: gana ? C.texto : C.suave,
              borderBottom: `5px solid ${gana ? C.rojo : C.pizarra}`,
              fontFamily: 'Big Shoulders',
              fontSize: 38,
              lineHeight: 1,
            }}
          >
            {carreras === null ? '-' : String(carreras)}
          </div>
        );
      })}
    </div>
  );
}

export function MarcadorCompartir({ encuentros }: { encuentros: Encuentro[] }) {
  const columnas = Math.max(1, ...encuentros.map((e) => e.juegos.length));
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 26 }}>
      {encuentros.map((e) => (
        <div
          key={e.id}
          style={{ display: 'flex', flexDirection: 'column', width: 534, marginBottom: 14, padding: '12px 16px', background: C.placa }}
        >
          <Fila encuentro={e} lado="visitante" columnas={columnas} />
          <Fila encuentro={e} lado="local" columnas={columnas} />
        </div>
      ))}
    </div>
  );
}
