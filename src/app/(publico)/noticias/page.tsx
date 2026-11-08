import type { Metadata } from 'next';
import { Encabezado, Vacio } from '@/componentes/Encabezado';
import { TarjetaNoticia } from '@/componentes/Tarjetas';
import { obtenerNoticias } from '@/lib/consultas/contenido';
import estilos from '../publico.module.css';

export const metadata: Metadata = {
  title: 'Noticias',
  description: 'Avisos, eventos y crónicas de la liga.',
  alternates: { canonical: '/noticias' },
};

export default async function Noticias() {
  const noticias = await obtenerNoticias();
  return (
    <>
      <Encabezado titulo="Noticias" />
      {noticias.length === 0 ? (
        <Vacio titulo="Todavía no hay noticias publicadas" />
      ) : (
        <ul className={estilos.tarjetas}>
          {noticias.map((n, i) => (
            <TarjetaNoticia key={n.id} noticia={n} prioridad={i === 0} />
          ))}
        </ul>
      )}
    </>
  );
}
