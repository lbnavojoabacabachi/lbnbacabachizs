import Link from 'next/link';
import { Encabezado } from '@/componentes/Encabezado';
import estilos from './publico.module.css';

export default function NoEncontrada() {
  return (
    <>
      <Encabezado antetitulo="Error 404" titulo="No encontramos esa página">
        <p>Puede que la dirección haya cambiado con el nuevo sitio. Esto es lo más buscado:</p>
      </Encabezado>
      <div className={estilos.acciones}>
        <Link prefetch={false} href="/" className={estilos.boton}>
          Ir a la portada
        </Link>
        <Link prefetch={false} href="/calendario" className={estilos.botonSecundario}>
          Calendario
        </Link>
        <Link prefetch={false} href="/posiciones" className={estilos.botonSecundario}>
          Posiciones
        </Link>
        <Link prefetch={false} href="/equipos" className={estilos.botonSecundario}>
          Equipos
        </Link>
      </div>
    </>
  );
}
