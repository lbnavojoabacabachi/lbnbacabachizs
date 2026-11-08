import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/db/conexion';
import { imagenes, noticias } from '@/db/esquema';
import { formatearInstante } from '@/lib/fechas';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../panel.module.css';
import { CabeceraPagina } from '../componentes';

export const metadata: Metadata = { title: 'Noticias' };

export default async function NoticiasPanel() {
  await exigirAdministrador();
  const lista = await db
    .select({ id: noticias.id, titulo: noticias.titulo, publicadaEn: noticias.publicadaEn, destacada: noticias.destacada, imagen: imagenes.urlChica, creadoEn: noticias.creadoEn })
    .from(noticias)
    .leftJoin(imagenes, eq(noticias.imagenId, imagenes.id))
    .orderBy(desc(noticias.creadoEn));
  return (
    <>
      <CabeceraPagina
        titulo="Noticias"
        accion={
          <Link prefetch={false} href="/panel/noticias/nueva" className={estilos.enlaceBoton}>
            Nueva noticia
          </Link>
        }
      />
      {lista.length === 0 ? (
        <p className={estilos.vacio}>Todavía no hay noticias.</p>
      ) : (
        <ul className={estilos.filas}>
          {lista.map((n) => (
            <li key={n.id} className={estilos.fila}>
              {n.imagen ? <img src={n.imagen} alt="" className={estilos.miniatura} /> : <span className={estilos.miniatura} />}
              <div className={estilos.filaPrincipal}>
                <span className={estilos.filaTitulo}>
                  <Link prefetch={false} href={`/panel/noticias/${n.id}`}>
                    {n.titulo}
                  </Link>
                </span>
                <span className={estilos.filaDetalle}>
                  {n.publicadaEn ? `Publicada el ${formatearInstante(n.publicadaEn, { diaSemana: false })}` : 'Borrador'}
                  {n.destacada ? ' · destacada' : ''}
                </span>
              </div>
              <span className={n.publicadaEn ? estilos.etiquetaOk : estilos.etiquetaPendiente}>{n.publicadaEn ? 'Publicada' : 'Borrador'}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
