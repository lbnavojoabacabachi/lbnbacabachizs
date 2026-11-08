import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/db/conexion';
import { eventos, imagenes } from '@/db/esquema';
import { capitalizar, formatearInstante } from '@/lib/fechas';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../panel.module.css';
import { CabeceraPagina } from '../componentes';

export const metadata: Metadata = { title: 'Eventos' };

export default async function EventosPanel() {
  await exigirAdministrador();
  const ahora = new Date();
  const lista = await db
    .select({ id: eventos.id, titulo: eventos.titulo, inicio: eventos.inicio, sede: eventos.sede, poster: imagenes.urlChica })
    .from(eventos)
    .leftJoin(imagenes, eq(eventos.posterId, imagenes.id))
    .orderBy(desc(eventos.inicio));
  return (
    <>
      <CabeceraPagina
        titulo="Eventos"
        accion={
          <Link prefetch={false} href="/panel/eventos/nuevo" className={estilos.enlaceBoton}>
            Nuevo evento
          </Link>
        }
      >
        <p>Inauguraciones, juegos de estrellas, finales y juntas. El próximo aparece en la portada hasta que pasa su fecha.</p>
      </CabeceraPagina>
      {lista.length === 0 ? (
        <p className={estilos.vacio}>Todavía no hay eventos.</p>
      ) : (
        <ul className={estilos.filas}>
          {lista.map((e) => (
            <li key={e.id} className={estilos.fila}>
              {e.poster ? <img src={e.poster} alt="" className={estilos.miniatura} /> : <span className={estilos.miniatura} />}
              <div className={estilos.filaPrincipal}>
                <span className={estilos.filaTitulo}>
                  <Link prefetch={false} href={`/panel/eventos/${e.id}`}>
                    {e.titulo}
                  </Link>
                </span>
                <span className={estilos.filaDetalle}>
                  {capitalizar(formatearInstante(e.inicio))}
                  {e.sede ? ` · ${e.sede}` : ''}
                </span>
              </div>
              <span className={e.inicio > ahora ? estilos.etiquetaOk : estilos.etiquetaNeutra}>{e.inicio > ahora ? 'Próximo' : 'Pasado'}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
