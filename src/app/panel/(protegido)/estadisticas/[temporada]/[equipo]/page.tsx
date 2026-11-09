import { and, eq } from 'drizzle-orm';
import type { Metadata, Route } from 'next';
import { notFound } from 'next/navigation';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { AreaTexto } from '@/app/panel/componentes/Entradas';
import { db } from '@/db/conexion';
import { equipos, temporadaEquipos, temporadas } from '@/db/esquema';
import { obtenerFilasDeBateo, obtenerFilasDePitcheo } from '@/lib/consultas/estadisticas';
import { textoDeBateo, textoDePitcheo } from '@/lib/estadisticas';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../../../panel.module.css';
import { CabeceraPagina, Volver } from '../../../componentes';
import { guardarBateo, guardarPitcheo } from '../../acciones';

export const metadata: Metadata = { title: 'Estadísticas del equipo' };

const ID = /^\d{1,9}$/;

export default async function EstadisticasEquipo({ params }: { params: Promise<{ temporada: string; equipo: string }> }) {
  await exigirAdministrador();
  const { temporada, equipo } = await params;
  if (!ID.test(temporada) || !ID.test(equipo)) notFound();
  const temporadaId = Number(temporada);
  const equipoId = Number(equipo);
  const [fila] = await db
    .select({ temporada: temporadas.nombre, equipo: equipos.nombre })
    .from(temporadaEquipos)
    .innerJoin(temporadas, eq(temporadaEquipos.temporadaId, temporadas.id))
    .innerJoin(equipos, eq(temporadaEquipos.equipoId, equipos.id))
    .where(and(eq(temporadaEquipos.temporadaId, temporadaId), eq(temporadaEquipos.equipoId, equipoId)));
  if (!fila) notFound();
  const [bateo, pitcheo] = await Promise.all([obtenerFilasDeBateo(temporadaId, equipoId), obtenerFilasDePitcheo(temporadaId, equipoId)]);

  return (
    <>
      <Volver href={`/panel/estadisticas?temporada=${temporadaId}` as Route} texto="Estadísticas" />
      <CabeceraPagina antetitulo={`Temporada ${fila.temporada}`} titulo={fila.equipo}>
        <p>Copia las filas del Excel del anotador y pégalas aquí. Al guardar se reemplaza todo lo que había de este equipo en esta temporada.</p>
      </CabeceraPagina>

      <section className={estilos.seccion} aria-labelledby="titulo-bateo">
        <h2 id="titulo-bateo" className={estilos.subtitulo}>
          Bateo
        </h2>
        <Formulario accion={guardarBateo} boton="Guardar bateo">
          <input type="hidden" name="temporadaId" value={temporadaId} />
          <input type="hidden" name="equipoId" value={equipoId} />
          <AreaTexto
            nombre="filas"
            etiqueta="Filas de bateo"
            valor={textoDeBateo(bateo)}
            filas={14}
            maximo={40000}
            ayuda="Una fila por jugador: nombre, JJ, AB, VB, HC, H1, H2, H3, HR, K, BB, BI y BG. AVG, ON BASE y SLUG se calculan solos. Si un jugador cambió de equipo, deja su fila (TOTAL) como la trae el anotador: con ella se calculan los líderes."
          />
        </Formulario>
      </section>

      <section className={estilos.seccion} aria-labelledby="titulo-pitcheo">
        <h2 id="titulo-pitcheo" className={estilos.subtitulo}>
          Pitcheo
        </h2>
        <Formulario accion={guardarPitcheo} boton="Guardar pitcheo">
          <input type="hidden" name="temporadaId" value={temporadaId} />
          <input type="hidden" name="equipoId" value={equipoId} />
          <AreaTexto
            nombre="filas"
            etiqueta="Filas de pitcheo"
            valor={textoDePitcheo(pitcheo)}
            filas={10}
            maximo={10000}
            ayuda="Una fila por pitcher: nombre, JJ, G, P y SV."
          />
        </Formulario>
      </section>
    </>
  );
}
