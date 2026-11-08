import { urlDelSitio } from '@/lib/sitio';
import { IconoExterno } from './Iconos';
import estilos from '@/app/(publico)/publico.module.css';

export function CompartirEnFacebook({ ruta }: { ruta: string }) {
  const direccion = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlDelSitio(ruta))}`;
  return (
    <a href={direccion} className={estilos.botonSecundario} target="_blank" rel="noopener">
      Compartir en Facebook
      <IconoExterno tamano={18} />
      <span className="solo-lectores"> (se abre en otra pestaña)</span>
    </a>
  );
}
