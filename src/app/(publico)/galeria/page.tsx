import type { Metadata } from 'next';
import { Encabezado, Vacio } from '@/componentes/Encabezado';
import { TarjetaAlbum } from '@/componentes/Tarjetas';
import { obtenerAlbumes } from '@/lib/consultas/contenido';
import estilos from '../publico.module.css';

export const metadata: Metadata = {
  title: 'Galería',
  description: 'Fotos de la liga por evento: inauguración, jornadas y Juego de Estrellas.',
  alternates: { canonical: '/galeria' },
};

export default async function Galeria() {
  const albumes = await obtenerAlbumes();
  return (
    <>
      <Encabezado titulo="Galería">
        <p>Fotos de la liga por evento. Toca un álbum para verlo y una foto para ampliarla.</p>
      </Encabezado>
      {albumes.length === 0 ? (
        <Vacio titulo="Todavía no hay álbumes publicados" />
      ) : (
        <ul className={estilos.tarjetas}>
          {albumes.map((a) => (
            <TarjetaAlbum key={a.id} album={a} />
          ))}
        </ul>
      )}
    </>
  );
}
