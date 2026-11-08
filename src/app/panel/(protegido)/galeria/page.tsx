import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { AreaTexto, Texto } from '@/app/panel/componentes/Entradas';
import { db } from '@/db/conexion';
import { albumFotos, albumes, imagenes } from '@/db/esquema';
import { formatearFecha } from '@/lib/fechas';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../panel.module.css';
import { CabeceraPagina } from '../componentes';
import { crearAlbum } from './acciones';

export const metadata: Metadata = { title: 'Galería' };

export default async function GaleriaPanel() {
  await exigirAdministrador();
  const lista = await db
    .select({
      id: albumes.id,
      titulo: albumes.titulo,
      fecha: albumes.fecha,
      publicado: albumes.publicado,
      portada: imagenes.urlChica,
      fotos: db.$count(albumFotos, eq(albumFotos.albumId, albumes.id)),
    })
    .from(albumes)
    .leftJoin(imagenes, eq(albumes.portadaId, imagenes.id))
    .orderBy(desc(albumes.creadoEn));
  return (
    <>
      <CabeceraPagina titulo="Galería">
        <p>Un álbum por evento o jornada. Sube las fotos desde el celular: se optimizan solas.</p>
      </CabeceraPagina>
      <ul className={estilos.filas}>
        {lista.map((a) => (
          <li key={a.id} className={estilos.fila}>
            {a.portada ? <img src={a.portada} alt="" className={estilos.miniatura} /> : <span className={estilos.miniatura} />}
            <div className={estilos.filaPrincipal}>
              <span className={estilos.filaTitulo}>
                <Link prefetch={false} href={`/panel/galeria/${a.id}`}>
                  {a.titulo}
                </Link>
              </span>
              <span className={estilos.filaDetalle}>
                {[a.fecha ? formatearFecha(a.fecha, { diaSemana: false }) : null, `${a.fotos} fotos`].filter(Boolean).join(' · ')}
              </span>
            </div>
            <span className={a.publicado ? estilos.etiquetaOk : estilos.etiquetaPendiente}>{a.publicado ? 'Publicado' : 'Sin publicar'}</span>
          </li>
        ))}
      </ul>
      <section className={estilos.seccion} aria-labelledby="titulo-nuevo">
        <h2 id="titulo-nuevo" className={estilos.subtitulo}>
          Nuevo álbum
        </h2>
        <Formulario accion={crearAlbum} boton="Crear álbum" columnas>
          <Texto nombre="titulo" etiqueta="Título" requerido maximo={120} ancho="medio" marcador="Jornada 11" />
          <Texto nombre="fecha" etiqueta="Fecha" tipo="date" ancho="corto" />
          <AreaTexto nombre="descripcion" etiqueta="Descripción" maximo={500} filas={2} />
        </Formulario>
      </section>
    </>
  );
}
