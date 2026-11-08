import { CampoImagen } from '@/app/panel/componentes/CampoImagen';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { AreaTexto, Casilla, Texto } from '@/app/panel/componentes/Entradas';
import { partesEnSonora } from '@/lib/fechas';
import { guardarEvento } from '../noticias/acciones';

type Evento = {
  id: number;
  titulo: string;
  descripcion: string | null;
  inicio: Date;
  sede: string | null;
  destacado: boolean;
  poster: { id: number; urlChica: string } | null;
};

export function FormularioEvento({ evento }: { evento: Evento | null }) {
  const partes = evento ? partesEnSonora(evento.inicio) : null;
  const hora = partes ? `${String(partes.hora).padStart(2, '0')}:${String(partes.minuto).padStart(2, '0')}` : null;
  return (
    <Formulario accion={guardarEvento} boton={evento ? 'Guardar evento' : 'Crear evento'} columnas>
      <input type="hidden" name="id" value={evento?.id ?? ''} />
      <Texto nombre="titulo" etiqueta="Nombre del evento" valor={evento?.titulo} requerido maximo={140} />
      <Texto nombre="fecha" etiqueta="Fecha" tipo="date" valor={partes?.fecha} requerido ancho="corto" />
      <Texto nombre="hora" etiqueta="Hora" tipo="time" valor={hora} requerido ancho="corto" />
      <Texto nombre="sede" etiqueta="Lugar" valor={evento?.sede} maximo={120} ancho="corto" />
      <AreaTexto nombre="descripcion" etiqueta="Descripción" valor={evento?.descripcion} maximo={1000} filas={4} />
      <CampoImagen nombre="posterId" etiqueta="Cartel" tipo="poster" actual={evento?.poster ?? null} />
      <Casilla
        nombre="destacado"
        etiqueta="Destacado"
        marcada={evento?.destacado}
        ayuda="Si hay varios eventos próximos, el destacado sale primero en la portada. Al pasar la fecha se oculta solo."
      />
    </Formulario>
  );
}
