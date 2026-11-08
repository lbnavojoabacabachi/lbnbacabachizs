import { ImageResponse } from 'next/og';
import { MarcadorCompartir } from '@/lib/compartir/MarcadorCompartir';
import { MarcoCompartir } from '@/lib/compartir/Marco';
import { fuentesCompartir, logoCompartir, TAMANO_IMAGEN_COMPARTIR } from '@/lib/compartir/recursos';
import { obtenerCalendario, obtenerTemporadaVigente } from '@/lib/consultas/liga';
import { describirJornada, jornadaConResultados } from '@/lib/jornadas';

export const revalidate = 3600;
export const size = TAMANO_IMAGEN_COMPARTIR;
export const contentType = 'image/png';
export const alt = 'Marcador de la jornada de la Liga de Beisbol Navojoa Ejidal, Zona Sur Bacabachi';

export default async function ImagenJornada({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;
  const temporada = await obtenerTemporadaVigente();
  const jornadas = temporada ? await obtenerCalendario(temporada.id) : [];
  const jornada = jornadas.find((j) => String(j.numero) === numero);
  const [fuentes, logo] = await Promise.all([fuentesCompartir(), logoCompartir()]);
  const antetitulo = jornada && jornadaConResultados(jornada) ? 'Resultados · Liga Bacabachi' : 'Próximos juegos · Liga Bacabachi';

  return new ImageResponse(
    (
      <MarcoCompartir
        logo={logo}
        antetitulo={antetitulo}
        titulo={jornada ? `Jornada ${jornada.numero}` : 'Calendario'}
        detalle={jornada ? describirJornada(jornada) : undefined}
        pie={jornada?.descansa ? `Descansa: ${jornada.descansa.nombre}` : ''}
      >
        {jornada && <MarcadorCompartir encuentros={jornada.encuentros} />}
      </MarcoCompartir>
    ),
    { ...TAMANO_IMAGEN_COMPARTIR, fonts: fuentes },
  );
}
