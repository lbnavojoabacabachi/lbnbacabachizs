import type { Metadata } from 'next';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../panel.module.css';
import { CabeceraPagina } from '../componentes';

export const metadata: Metadata = { title: 'Estadísticas' };

export default async function EstadisticasPanel() {
  await exigirAdministrador();
  return (
    <>
      <CabeceraPagina titulo="Estadísticas">
        <p>Captura por jugador e importación desde Excel con vista previa y errores por fila.</p>
      </CabeceraPagina>
      <p className={estilos.aviso}>
        Esta sección se termina cuando la liga confirme qué significa cada columna de las estadísticas del sitio anterior (por ejemplo,
        si «VB» son veces al bat y qué cuenta como «BG»), o comparta el Excel que usa el estadístico. Con eso se crean las tablas de bateo y
        pitcheo, la página pública de líderes y esta captura.
      </p>
    </>
  );
}
