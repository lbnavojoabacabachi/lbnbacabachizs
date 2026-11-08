import { and, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BotonAccion } from '@/app/panel/componentes/BotonAccion';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { AreaTexto, Seleccion, Texto } from '@/app/panel/componentes/Entradas';
import { db } from '@/db/conexion';
import { datosPrivadosJugador, equipos, jugadores, plantillas } from '@/db/esquema';
import { CATEGORIAS } from '@/lib/panel/catalogos';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../../../../panel.module.css';
import { CabeceraPagina, Volver } from '../../../../componentes';
import { guardarJugador, quitarDePlantilla } from '../../../acciones';

type Parametros = { params: Promise<{ id: string; plantillaId: string }> };

export const metadata: Metadata = { title: 'Jugador' };

export default async function EditarJugador({ params }: Parametros) {
  await exigirAdministrador();
  const { id, plantillaId } = await params;
  if (!/^\d{1,9}$/.test(id) || !/^\d{1,9}$/.test(plantillaId)) notFound();
  const [registro] = await db
    .select({
      plantilla: plantillas,
      nombre: jugadores.nombre,
      equipo: equipos.nombre,
      nacimiento: datosPrivadosJugador.fechaNacimiento,
      notas: datosPrivadosJugador.notas,
    })
    .from(plantillas)
    .innerJoin(jugadores, eq(plantillas.jugadorId, jugadores.id))
    .innerJoin(equipos, eq(plantillas.equipoId, equipos.id))
    .leftJoin(datosPrivadosJugador, eq(datosPrivadosJugador.jugadorId, jugadores.id))
    .where(and(eq(plantillas.id, Number(plantillaId)), eq(plantillas.equipoId, Number(id))));
  if (!registro) notFound();
  const p = registro.plantilla;
  const equipoId = String(p.equipoId);

  return (
    <>
      <Volver href={`/panel/equipos/${equipoId}`} texto={registro.equipo} />
      <CabeceraPagina antetitulo={registro.equipo} titulo={registro.nombre}>
        <p>Para dar de baja, escribe la fecha de baja y guarda. El jugador sigue apareciendo en Altas y bajas.</p>
      </CabeceraPagina>
      <Formulario accion={guardarJugador} boton="Guardar jugador" columnas>
        <input type="hidden" name="plantillaId" value={p.id} />
        <Texto nombre="nombre" etiqueta="Nombre completo" valor={registro.nombre} requerido maximo={80} ancho="medio" />
        <Texto nombre="numero" etiqueta="Número" tipo="number" valor={p.numero} minimo={0} maximoNumero={99} ancho="corto" />
        <Seleccion nombre="categoria" etiqueta="Categoría" opciones={[...CATEGORIAS]} valor={p.categoria} ancho="corto" />
        <Texto nombre="fechaNacimiento" etiqueta="Fecha de nacimiento" tipo="date" valor={registro.nacimiento} ancho="corto" ayuda="Privada: solo se ve en el panel." />
        <Texto nombre="alta" etiqueta="Fecha de alta" tipo="date" valor={p.alta} ancho="corto" />
        <Texto nombre="baja" etiqueta="Fecha de baja" tipo="date" valor={p.baja} ancho="corto" />
        <AreaTexto nombre="notas" etiqueta="Notas privadas" valor={registro.notas} maximo={500} filas={3} ayuda="Solo se ven en el panel." />
      </Formulario>
      <section className={estilos.seccion} aria-labelledby="titulo-quitar">
        <h2 id="titulo-quitar" className={estilos.subtitulo}>
          Quitar de la plantilla
        </h2>
        <p>Solo para una captura equivocada. Si el jugador se fue del equipo, usa la fecha de baja.</p>
        <div>
          <BotonAccion
            accion={quitarDePlantilla.bind(null, p.id)}
            texto="Quitar de la plantilla"
            confirmar={`¿Quitar a ${registro.nombre} de la plantilla? No queda como baja.`}
            destino={`/panel/equipos/${equipoId}`}
            peligro
          />
        </div>
      </section>
    </>
  );
}
