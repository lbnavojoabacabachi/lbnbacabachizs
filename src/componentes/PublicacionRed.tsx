import { formatearFecha } from '@/lib/fechas';
import { incrustacionDePublicacion, NOMBRES_RED, type RedSocial } from '@/lib/incrustar';
import { IconoExterno } from './Iconos';
import { Incrustado } from './Incrustado';
import estilos from './publicacion-red.module.css';

type Publicacion = {
  id: number;
  red: RedSocial;
  url: string;
  titulo: string | null;
  publicadaEn: string | null;
};

export function PublicacionRed({ publicacion }: { publicacion: Publicacion }) {
  const incrustacion = incrustacionDePublicacion(publicacion.url);
  const red = NOMBRES_RED[publicacion.red];
  const titulo = publicacion.titulo ?? `Publicación en ${red}`;
  const fecha = publicacion.publicadaEn ? formatearFecha(publicacion.publicadaEn, { diaSemana: false }) : undefined;
  return (
    <li className={estilos.publicacion}>
      {incrustacion ? (
        <Incrustado incrustacion={incrustacion} titulo={titulo} accion={`Ver en ${red}`} detalle={fecha} />
      ) : (
        <a href={publicacion.url} className={estilos.enlace} target="_blank" rel="noopener">
          <span className={estilos.red}>{red}</span>
          <span className={estilos.titulo}>{titulo}</span>
          {fecha && <span className={estilos.fecha}>{fecha}</span>}
          <span className={estilos.abrir}>
            Abrir en {red}
            <IconoExterno tamano={16} />
            <span className="solo-lectores"> (se abre en otra pestaña)</span>
          </span>
        </a>
      )}
    </li>
  );
}
