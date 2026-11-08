import { CampoImagen } from '@/app/panel/componentes/CampoImagen';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { AreaTexto, Casilla, Texto } from '@/app/panel/componentes/Entradas';
import { partesEnSonora } from '@/lib/fechas';
import { guardarNoticia } from './acciones';

type Noticia = {
  id: number;
  titulo: string;
  resumen: string | null;
  cuerpo: string;
  destacada: boolean;
  publicadaEn: Date | null;
  imagen: { id: number; urlChica: string } | null;
};

export function FormularioNoticia({ noticia }: { noticia: Noticia | null }) {
  return (
    <Formulario accion={guardarNoticia} boton={noticia ? 'Guardar noticia' : 'Crear noticia'}>
      <input type="hidden" name="id" value={noticia?.id ?? ''} />
      <Texto nombre="titulo" etiqueta="Título" valor={noticia?.titulo} requerido maximo={140} />
      <AreaTexto
        nombre="resumen"
        etiqueta="Resumen"
        valor={noticia?.resumen}
        maximo={300}
        filas={2}
        ayuda="Una o dos líneas. Se ve en la portada y al compartir en Facebook."
      />
      <AreaTexto
        nombre="cuerpo"
        etiqueta="Texto"
        valor={noticia?.cuerpo}
        requerido
        maximo={10000}
        filas={10}
        ayuda="Deja una línea en blanco entre párrafos."
      />
      <CampoImagen nombre="imagenId" etiqueta="Imagen" tipo="noticia" actual={noticia?.imagen ?? null} ayuda="Una foto o un cartel. Se optimiza al subirla." />
      <Casilla nombre="destacada" etiqueta="Destacada" marcada={noticia?.destacada} ayuda="Aparece primero en la portada." />
      <Casilla
        nombre="publicar"
        etiqueta="Publicada"
        marcada={noticia ? noticia.publicadaEn !== null : true}
        ayuda="Si no se marca, se guarda como borrador y no se ve en el sitio."
      />
      <Texto
        nombre="fechaPublicacion"
        etiqueta="Fecha de publicación"
        tipo="date"
        valor={noticia?.publicadaEn ? partesEnSonora(noticia.publicadaEn).fecha : null}
        ancho="corto"
        ayuda="Vacía, se publica con la fecha de hoy. Pon una fecha pasada para subir una noticia anterior."
      />
    </Formulario>
  );
}
