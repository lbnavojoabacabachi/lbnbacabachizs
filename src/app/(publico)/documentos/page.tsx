import type { Metadata } from 'next';
import { Encabezado, Vacio } from '@/componentes/Encabezado';
import { IconoDescarga } from '@/componentes/Iconos';
import { obtenerDocumentos } from '@/lib/consultas/contenido';
import estilos from '../publico.module.css';
import estilosDocumentos from './documentos.module.css';

export const metadata: Metadata = {
  title: 'Documentos',
  description: 'Reglamento de la liga y formatos para descargar.',
  alternates: { canonical: '/documentos' },
};

function tamano(bytes: number | null) {
  if (!bytes) return null;
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function Documentos() {
  const documentos = await obtenerDocumentos();
  return (
    <>
      <Encabezado titulo="Documentos">
        <p>Reglamento y formatos de la liga para descargar.</p>
      </Encabezado>
      {documentos.length === 0 ? (
        <Vacio titulo="Todavía no hay documentos publicados">
          <p>El reglamento y los formatos de altas y bajas se publican aquí en cuanto la liga los suba.</p>
        </Vacio>
      ) : (
        <ul className={estilos.lista}>
          {documentos.map((d) => (
            <li key={d.id}>
              <a href={d.url} className={estilosDocumentos.documento} download>
                <IconoDescarga />
                <span>
                  <b>{d.titulo}</b>
                  <span className={estilos.detalleSeccion}>{['PDF', tamano(d.bytes)].filter(Boolean).join(' · ')}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
