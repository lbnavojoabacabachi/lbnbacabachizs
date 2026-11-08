import { asc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BotonAccion } from '@/app/panel/componentes/BotonAccion';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { AreaTexto, Casilla, Texto } from '@/app/panel/componentes/Entradas';
import { db } from '@/db/conexion';
import { albumFotos, albumes, imagenes } from '@/db/esquema';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../../panel.module.css';
import { CabeceraPagina, Volver } from '../../componentes';
import { eliminarAlbum, guardarAlbum, guardarFotos, quitarFoto, usarComoPortada } from '../acciones';
import estilosAlbum from './album.module.css';
import { SubidorFotos } from './SubidorFotos';

export const metadata: Metadata = { title: 'Álbum' };

export default async function EditarAlbum({ params }: { params: Promise<{ id: string }> }) {
  await exigirAdministrador();
  const { id } = await params;
  if (!/^\d{1,9}$/.test(id)) notFound();
  const [album] = await db.select().from(albumes).where(eq(albumes.id, Number(id)));
  if (!album) notFound();
  const fotos = await db
    .select({ imagenId: albumFotos.imagenId, pie: albumFotos.pie, orden: albumFotos.orden, url: imagenes.urlChica })
    .from(albumFotos)
    .innerJoin(imagenes, eq(albumFotos.imagenId, imagenes.id))
    .where(eq(albumFotos.albumId, album.id))
    .orderBy(asc(albumFotos.orden), asc(imagenes.id));

  return (
    <>
      <Volver href="/panel/galeria" texto="Todos los álbumes" />
      <CabeceraPagina titulo={album.titulo}>
        {album.publicado && (
          <p>
            <Link prefetch={false} href={`/galeria/${album.slug}`}>
              Ver en el sitio
            </Link>
          </p>
        )}
      </CabeceraPagina>

      <section className={estilos.seccion} aria-labelledby="titulo-subir">
        <h2 id="titulo-subir" className={estilos.subtitulo}>
          Subir fotos
        </h2>
        <SubidorFotos albumId={album.id} />
      </section>

      <section className={estilos.seccion} aria-labelledby="titulo-datos">
        <h2 id="titulo-datos" className={estilos.subtitulo}>
          Datos del álbum
        </h2>
        <Formulario accion={guardarAlbum} boton="Guardar álbum" columnas>
          <input type="hidden" name="id" value={album.id} />
          <Texto nombre="titulo" etiqueta="Título" valor={album.titulo} requerido maximo={120} ancho="medio" />
          <Texto nombre="fecha" etiqueta="Fecha" tipo="date" valor={album.fecha} ancho="corto" />
          <AreaTexto nombre="descripcion" etiqueta="Descripción" valor={album.descripcion} maximo={500} filas={2} />
          <Casilla nombre="publicado" etiqueta="Publicado" marcada={album.publicado} ayuda="Si no se marca, el álbum no se ve en el sitio." />
        </Formulario>
      </section>

      <section className={estilos.seccion} aria-labelledby="titulo-fotos">
        <h2 id="titulo-fotos" className={estilos.subtitulo}>
          Fotos ({fotos.length})
        </h2>
        {fotos.length === 0 ? (
          <p className={estilos.vacio}>Todavía no hay fotos.</p>
        ) : (
          <Formulario accion={guardarFotos} boton="Guardar pies y orden">
            <input type="hidden" name="albumId" value={album.id} />
            <ul className={estilosAlbum.fotos}>
              {fotos.map((f, i) => (
                <li key={f.imagenId} className={`${estilosAlbum.foto} ${album.portadaId === f.imagenId ? estilosAlbum.portada : ''}`}>
                  <img src={f.url} alt={f.pie ?? `Foto ${i + 1}`} loading="lazy" />
                  <Texto nombre={`pie-${f.imagenId}`} etiqueta={`Pie de la foto ${i + 1}`} valor={f.pie} maximo={200} />
                  <Texto nombre={`orden-${f.imagenId}`} etiqueta="Orden" tipo="number" valor={i + 1} minimo={1} maximoNumero={9999} ancho="corto" />
                  <div className={estilosAlbum.accionesFoto}>
                    {album.portadaId === f.imagenId ? (
                      <span className={estilos.etiquetaOk}>Portada</span>
                    ) : (
                      <BotonAccion
                        accion={usarComoPortada.bind(null, album.id, f.imagenId)}
                        texto="Usar de portada"
                        etiqueta={`Usar de portada: foto ${i + 1}`}
                      />
                    )}
                    <BotonAccion
                      accion={quitarFoto.bind(null, album.id, f.imagenId)}
                      texto="Quitar"
                      etiqueta={`Quitar: foto ${i + 1}`}
                      confirmar="¿Quitar esta foto del álbum?"
                      peligro
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Formulario>
        )}
      </section>

      <section className={estilos.seccion} aria-labelledby="titulo-eliminar">
        <h2 id="titulo-eliminar" className={estilos.subtitulo}>
          Eliminar álbum
        </h2>
        <div>
          <BotonAccion
            accion={eliminarAlbum.bind(null, album.id)}
            texto="Eliminar álbum y sus fotos"
            confirmar={`¿Eliminar «${album.titulo}» con sus ${fotos.length} fotos? No se puede deshacer.`}
            destino="/panel/galeria"
            peligro
          />
        </div>
      </section>
    </>
  );
}
