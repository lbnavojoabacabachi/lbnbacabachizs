import { ImageResponse } from 'next/og';
import { MarcoCompartir } from '@/lib/compartir/Marco';
import { COLORES_COMPARTIR, fuentesCompartir, logoCompartir, TAMANO_IMAGEN_COMPARTIR } from '@/lib/compartir/recursos';

export const size = TAMANO_IMAGEN_COMPARTIR;
export const contentType = 'image/png';
export const alt = 'Liga de Beisbol Navojoa Ejidal, Zona Sur Bacabachi';

export default async function ImagenSitio() {
  const [fuentes, logo] = await Promise.all([fuentesCompartir(), logoCompartir()]);
  return new ImageResponse(
    (
      <MarcoCompartir logo={logo} antetitulo="Zona Sur Bacabachi" titulo="Liga de Beisbol Navojoa Ejidal">
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
          <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.2, maxWidth: 900 }}>
            Resultados, calendario, posiciones y transmisiones en vivo
          </div>
          <div style={{ fontSize: 28, color: COLORES_COMPARTIR.suave, marginTop: 10 }}>ligabeisbolbacabachi.com</div>
        </div>
      </MarcoCompartir>
    ),
    { ...TAMANO_IMAGEN_COMPARTIR, fonts: fuentes },
  );
}
