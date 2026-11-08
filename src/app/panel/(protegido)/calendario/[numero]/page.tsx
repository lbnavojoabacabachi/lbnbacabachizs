import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BotonAccion } from '@/app/panel/componentes/BotonAccion';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { Seleccion, Texto } from '@/app/panel/componentes/Entradas';
import { obtenerEquipos, obtenerTemporadaVigente } from '@/lib/consultas/liga';
import { jornadaParaCaptura } from '@/lib/consultas/panel';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../../panel.module.css';
import { CabeceraPagina, Volver } from '../../componentes';
import { agregarEncuentro, eliminarEncuentro, eliminarJornada, guardarEncuentro, guardarJornada } from '../acciones';

type Parametros = { params: Promise<{ numero: string }> };

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  return { title: `Jornada ${(await params).numero}` };
}

const JUEGOS = [
  { valor: '1', texto: '1 juego' },
  { valor: '2', texto: '2 juegos (doble cartelera)' },
  { valor: '3', texto: '3 juegos' },
];

export default async function EditarJornada({ params }: Parametros) {
  await exigirAdministrador();
  const { numero } = await params;
  const temporada = await obtenerTemporadaVigente();
  if (!temporada || !/^\d{1,3}$/.test(numero)) notFound();
  const [datos, equipos] = await Promise.all([jornadaParaCaptura(temporada.id, Number(numero)), obtenerEquipos(temporada.id)]);
  if (!datos) notFound();
  const { jornada, encuentros } = datos;
  const opciones = equipos.map((e) => ({ valor: String(e.id), texto: e.nombre }));
  const conResultados = encuentros.some((e) => e.juegos.some((g) => g.estado !== 'programado'));

  return (
    <>
      <Volver href="/panel/calendario" texto="Todo el calendario" />
      <CabeceraPagina antetitulo={`Temporada ${temporada.nombre}`} titulo={`Jornada ${jornada.numero}`}>
        <p>
          <Link prefetch={false} href={`/panel/resultados/${jornada.numero}`}>
            Capturar resultados de esta jornada
          </Link>
        </p>
      </CabeceraPagina>

      <section className={estilos.seccion} aria-labelledby="titulo-datos">
        <h2 id="titulo-datos" className={estilos.subtitulo}>
          Datos de la jornada
        </h2>
        <Formulario accion={guardarJornada} boton="Guardar jornada" columnas>
          <input type="hidden" name="id" value={jornada.id} />
          <Texto nombre="fecha" etiqueta="Fecha" tipo="date" valor={jornada.fecha} ancho="corto" />
          <Texto nombre="vuelta" etiqueta="Vuelta" tipo="number" valor={jornada.vuelta} minimo={1} maximoNumero={9} ancho="corto" />
          <Seleccion nombre="descansaId" etiqueta="Descansa" vacio="Nadie" opciones={opciones} valor={jornada.equipoDescansaId} ancho="corto" />
          <Texto
            nombre="nota"
            etiqueta="Nota pública"
            valor={jornada.nota}
            maximo={200}
            ayuda="Se muestra en el calendario y en la portada. Por ejemplo: recorrida por el Juego de Estrellas."
          />
        </Formulario>
      </section>

      <section className={estilos.seccion} aria-labelledby="titulo-encuentros">
        <h2 id="titulo-encuentros" className={estilos.subtitulo}>
          Encuentros
        </h2>
        {encuentros.length === 0 && <p className={estilos.vacio}>Todavía no hay encuentros.</p>}
        {encuentros.map((e, i) => (
          <div key={e.id} className={estilos.seccion}>
            <h3 className={estilos.renglonTitulo}>
              Encuentro {i + 1}: {e.visitante} en {e.local}
            </h3>
            <Formulario
              accion={guardarEncuentro}
              boton="Guardar encuentro"
              columnas
              extraAcciones={<BotonAccion accion={eliminarEncuentro.bind(null, e.id)} texto="Eliminar" confirmar={`¿Eliminar ${e.visitante} en ${e.local}?`} peligro />}
            >
              <input type="hidden" name="id" value={e.id} />
              <Seleccion nombre="visitanteId" etiqueta="Visita" opciones={opciones} valor={e.visitanteId} requerido ancho="medio" />
              <Seleccion nombre="localId" etiqueta="Local" opciones={opciones} valor={e.localId} requerido ancho="medio" />
              <Seleccion nombre="juegos" etiqueta="Juegos" opciones={JUEGOS} valor={e.juegos.length} ancho="corto" />
              <Texto nombre="hora" etiqueta="Hora" tipo="time" valor={e.hora?.slice(0, 5)} ancho="corto" />
              <Texto nombre="sede" etiqueta="Campo" valor={e.sede} maximo={120} ancho="corto" />
            </Formulario>
          </div>
        ))}
      </section>

      <section className={estilos.seccion} aria-labelledby="titulo-nuevo-encuentro">
        <h2 id="titulo-nuevo-encuentro" className={estilos.subtitulo}>
          Agregar encuentro
        </h2>
        <Formulario accion={agregarEncuentro} boton="Agregar encuentro" columnas reiniciar>
          <input type="hidden" name="jornadaId" value={jornada.id} />
          <Seleccion nombre="visitanteId" etiqueta="Visita" opciones={opciones} vacio="Elige" requerido ancho="medio" />
          <Seleccion nombre="localId" etiqueta="Local" opciones={opciones} vacio="Elige" requerido ancho="medio" />
          <Seleccion nombre="juegos" etiqueta="Juegos" opciones={JUEGOS} valor="2" ancho="corto" />
          <Texto nombre="hora" etiqueta="Hora" tipo="time" ancho="corto" />
          <Texto nombre="sede" etiqueta="Campo" maximo={120} ancho="corto" />
        </Formulario>
      </section>

      {!conResultados && (
        <section className={estilos.seccion} aria-labelledby="titulo-eliminar">
          <h2 id="titulo-eliminar" className={estilos.subtitulo}>
            Eliminar jornada
          </h2>
          <p>Borra la jornada con sus encuentros. Solo se puede mientras no tenga resultados.</p>
          <div>
            <BotonAccion
              accion={eliminarJornada.bind(null, jornada.id)}
              texto={`Eliminar la jornada ${jornada.numero}`}
              confirmar={`¿Eliminar la jornada ${jornada.numero} con sus encuentros?`}
              destino="/panel/calendario"
              peligro
            />
          </div>
        </section>
      )}
    </>
  );
}
