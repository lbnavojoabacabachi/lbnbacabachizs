import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BotonAccion } from '@/app/panel/componentes/BotonAccion';
import { db } from '@/db/conexion';
import { imagenes, noticias } from '@/db/esquema';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../../panel.module.css';
import { CabeceraPagina, Volver } from '../../componentes';
import { eliminarNoticia } from '../acciones';
import { FormularioNoticia } from '../FormularioNoticia';

export const metadata: Metadata = { title: 'Editar noticia' };

export default async function EditarNoticia({ params }: { params: Promise<{ id: string }> }) {
  await exigirAdministrador();
  const { id } = await params;
  if (!/^\d{1,9}$/.test(id)) notFound();
  const [fila] = await db
    .select({ noticia: noticias, imagen: { id: imagenes.id, urlChica: imagenes.urlChica } })
    .from(noticias)
    .leftJoin(imagenes, eq(noticias.imagenId, imagenes.id))
    .where(eq(noticias.id, Number(id)));
  if (!fila) notFound();
  const n = fila.noticia;
  return (
    <>
      <Volver href="/panel/noticias" texto="Todas las noticias" />
      <CabeceraPagina titulo={n.titulo}>
        {n.publicadaEn && (
          <p>
            <Link prefetch={false} href={`/noticias/${n.slug}`}>
              Ver en el sitio
            </Link>
          </p>
        )}
      </CabeceraPagina>
      <FormularioNoticia noticia={{ ...n, imagen: fila.imagen }} />
      <div>
        <BotonAccion
          accion={eliminarNoticia.bind(null, n.id)}
          texto="Eliminar noticia"
          confirmar={`¿Eliminar «${n.titulo}»? No se puede deshacer.`}
          destino="/panel/noticias"
          peligro
        />
      </div>
      <p className={estilos.vacio}>Si solo quieres ocultarla, quita «Publicada» y guarda.</p>
    </>
  );
}
