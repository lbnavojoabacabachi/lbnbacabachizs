import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CompartirEnFacebook } from '@/componentes/Compartir';
import { Encabezado } from '@/componentes/Encabezado';
import { IconoAnterior, IconoFlecha } from '@/componentes/Iconos';
import { ListaEncuentros } from '@/componentes/ListaEncuentros';
import { Marcador } from '@/componentes/Marcador';
import { obtenerCalendario, obtenerTemporadaVigente } from '@/lib/consultas/liga';
import { describirJornada, jornadaConResultados, resumenDeResultados } from '@/lib/jornadas';
import estilos from '../../publico.module.css';
import estilosJornada from './jornada.module.css';

type Parametros = { params: Promise<{ numero: string }> };

async function buscarJornada(numero: string) {
  const temporada = await obtenerTemporadaVigente();
  if (!temporada || !/^\d{1,3}$/.test(numero)) return null;
  const jornadas = await obtenerCalendario(temporada.id);
  const indice = jornadas.findIndex((j) => j.numero === Number(numero));
  if (indice < 0) return null;
  return { temporada, jornada: jornadas[indice], anterior: jornadas[indice - 1] ?? null, siguiente: jornadas[indice + 1] ?? null };
}

export async function generateStaticParams() {
  const temporada = await obtenerTemporadaVigente();
  if (!temporada) return [];
  const jornadas = await obtenerCalendario(temporada.id);
  return jornadas.map((j) => ({ numero: String(j.numero) }));
}

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const encontrada = await buscarJornada((await params).numero);
  if (!encontrada) return {};
  const { jornada } = encontrada;
  const conResultados = jornadaConResultados(jornada);
  return {
    title: `Jornada ${jornada.numero}`,
    description: conResultados
      ? `Resultados de la jornada ${jornada.numero}: ${resumenDeResultados(jornada)}.`
      : `Jornada ${jornada.numero}, ${describirJornada(jornada).toLowerCase()}: ${jornada.encuentros.map((e) => `${e.visitante.nombre} en ${e.local.nombre}`).join('; ')}.`,
    alternates: { canonical: `/jornadas/${jornada.numero}` },
  };
}

export default async function PaginaJornada({ params }: Parametros) {
  const encontrada = await buscarJornada((await params).numero);
  if (!encontrada) notFound();
  const { temporada, jornada, anterior, siguiente } = encontrada;
  const conResultados = jornadaConResultados(jornada);

  return (
    <>
      <Encabezado antetitulo={`Temporada ${temporada.nombre}`} titulo={`Jornada ${jornada.numero}`}>
        <p>{describirJornada(jornada)}</p>
      </Encabezado>

      <section className={estilos.seccion} aria-label={conResultados ? 'Resultados' : 'Encuentros'}>
        {jornada.nota && <p className={estilosJornada.nota}>{jornada.nota}</p>}
        {conResultados ? (
          <Marcador jornada={jornada} />
        ) : (
          <>
            <ListaEncuentros encuentros={jornada.encuentros} />
            {jornada.descansa && (
              <p className={estilos.detalleSeccion}>
                Descansa: <b>{jornada.descansa.nombre}</b>
              </p>
            )}
          </>
        )}
        <div className={estilos.acciones}>
          <CompartirEnFacebook ruta={`/jornadas/${jornada.numero}`} />
          <Link prefetch={false} href={`/calendario#jornada-${jornada.numero}`} className={estilos.botonSecundario}>
            Ver en el calendario
          </Link>
        </div>
      </section>

      <nav aria-label="Otras jornadas" className={estilosJornada.otras}>
        {anterior ? (
          <Link prefetch={false} href={`/jornadas/${anterior.numero}`} className={estilosJornada.otra}>
            <IconoAnterior />
            <span>
              <small>Anterior</small>
              Jornada {anterior.numero}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {siguiente && (
          <Link prefetch={false} href={`/jornadas/${siguiente.numero}`} className={`${estilosJornada.otra} ${estilosJornada.siguiente}`}>
            <span>
              <small>Siguiente</small>
              Jornada {siguiente.numero}
            </span>
            <IconoFlecha />
          </Link>
        )}
      </nav>
    </>
  );
}
