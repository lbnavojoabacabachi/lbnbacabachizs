import Link from 'next/link';
import type { Encuentro, Equipo, Jornada } from '@/lib/consultas/liga';
import type { Lado, ResultadoJuego } from '@/lib/jornadas';
import { Escudo } from './Escudo';
import estilos from './marcador.module.css';

type Variante = 'pizarra' | 'cal';

const ESTADOS_SIN_JUEGO: Partial<Record<ResultadoJuego['estado'], string>> = {
  suspendido: 'suspendido',
  pospuesto: 'pospuesto',
  cancelado: 'cancelado',
};

function notasDeEncuentro(encuentro: Encuentro) {
  const prefijo = (juego: ResultadoJuego) => (encuentro.juegos.length > 1 ? `J${juego.numero}: ` : '');
  const notas: string[] = [];
  for (const juego of encuentro.juegos) {
    if (juego.forfeitDe) {
      const pierde = juego.forfeitDe === 'local' ? encuentro.local : encuentro.visitante;
      notas.push(`${prefijo(juego)}forfeit de ${pierde.nombre}`);
    }
    const estado = ESTADOS_SIN_JUEGO[juego.estado];
    if (estado) notas.push(`${prefijo(juego)}${estado}`);
    if (!juego.cuentaParaTabla) notas.push(`${prefijo(juego)}no cuenta para la tabla`);
    if (juego.notaPublica) notas.push(`${prefijo(juego)}${juego.notaPublica}`);
  }
  return notas;
}

function NombreEquipo({ equipo, lado }: { equipo: Equipo; lado: Lado }) {
  const contenido = (
    <>
      <Escudo logo={equipo.logo} nombre={equipo.nombre} tamano={36} className={estilos.escudo} />
      <span className={estilos.nombreEquipo}>
        {equipo.nombre}
        <span className={estilos.lado}>{lado === 'local' ? 'Local' : 'Visita'}</span>
      </span>
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

function Placa({ juego, lado }: { juego: ResultadoJuego | undefined; lado: Lado }) {
  const carreras = juego ? juego[lado] : null;
  const gana = juego?.ganador === lado;
  return (
    <td className={`${estilos.placa} ${gana ? estilos.gana : ''}`}>
      {carreras ?? <span aria-hidden="true">–</span>}
      {carreras === null && <span className="solo-lectores">sin resultado</span>}
      {gana && <span className="solo-lectores">, ganó</span>}
    </td>
  );
}

function TarjetaEncuentro({ encuentro, columnas }: { encuentro: Encuentro; columnas: number }) {
  const numeros = Array.from({ length: columnas }, (_, i) => i + 1);
  const juegoNumero = (n: number) => encuentro.juegos.find((j) => j.numero === n);
  const notas = notasDeEncuentro(encuentro);
  const titulo = `${encuentro.visitante.nombre} en ${encuentro.local.nombre}`;
  return (
    <div className={estilos.encuentro}>
      <table className={estilos.tabla}>
        <caption className="solo-lectores">{titulo}</caption>
        <thead>
          <tr>
            <th scope="col" className={estilos.colEquipo}>
              <span className="solo-lectores">Equipo</span>
            </th>
            {numeros.map((n) => (
              <th key={n} scope="col" className={estilos.colJuego}>
                <abbr title={`Juego ${n}`}>J{n}</abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(['visitante', 'local'] as const).map((lado) => (
            <tr key={lado}>
              <th scope="row" className={estilos.celdaEquipo}>
                <NombreEquipo equipo={encuentro[lado]} lado={lado} />
              </th>
              {numeros.map((n) => (
                <Placa key={n} juego={juegoNumero(n)} lado={lado} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {notas.length > 0 && (
        <ul className={estilos.notas}>
          {notas.map((nota) => (
            <li key={nota}>{nota}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Marcador({ jornada, variante = 'pizarra' }: { jornada: Jornada; variante?: Variante }) {
  const columnas = Math.max(1, ...jornada.encuentros.map((e) => e.juegos.length));
  return (
    <div className={`${estilos.marcador} ${estilos[variante]}`}>
      <div className={estilos.encuentros}>
        {jornada.encuentros.map((encuentro) => (
          <TarjetaEncuentro key={encuentro.id} encuentro={encuentro} columnas={columnas} />
        ))}
      </div>
      {jornada.descansa && (
        <p className={estilos.descansa}>
          Descansa: <b>{jornada.descansa.nombre}</b>
        </p>
      )}
    </div>
  );
}
