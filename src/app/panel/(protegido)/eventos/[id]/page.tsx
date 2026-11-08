import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BotonAccion } from '@/app/panel/componentes/BotonAccion';
import { db } from '@/db/conexion';
import { eventos, imagenes } from '@/db/esquema';
import { exigirAdministrador } from '@/lib/sesion';
import { CabeceraPagina, Volver } from '../../componentes';
import { eliminarEvento } from '../../noticias/acciones';
import { FormularioEvento } from '../FormularioEvento';

export const metadata: Metadata = { title: 'Editar evento' };

export default async function EditarEvento({ params }: { params: Promise<{ id: string }> }) {
  await exigirAdministrador();
  const { id } = await params;
  if (!/^\d{1,9}$/.test(id)) notFound();
  const [fila] = await db
    .select({ evento: eventos, poster: { id: imagenes.id, urlChica: imagenes.urlChica } })
    .from(eventos)
    .leftJoin(imagenes, eq(eventos.posterId, imagenes.id))
    .where(eq(eventos.id, Number(id)));
  if (!fila) notFound();
  return (
    <>
      <Volver href="/panel/eventos" texto="Todos los eventos" />
      <CabeceraPagina titulo={fila.evento.titulo} />
      <FormularioEvento evento={{ ...fila.evento, poster: fila.poster }} />
      <div>
        <BotonAccion
          accion={eliminarEvento.bind(null, fila.evento.id)}
          texto="Eliminar evento"
          confirmar={`¿Eliminar «${fila.evento.titulo}»?`}
          destino="/panel/eventos"
          peligro
        />
      </div>
    </>
  );
}
