import { and, asc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BotonAccion } from '@/app/panel/componentes/BotonAccion';
import { CampoImagen } from '@/app/panel/componentes/CampoImagen';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { Casilla, Seleccion, Texto } from '@/app/panel/componentes/Entradas';
import { db } from '@/db/conexion';
import { cuerpoTecnico, datosPrivadosJugador, equipos, imagenes, jugadores, plantillas } from '@/db/esquema';
import { obtenerTemporadaVigente } from '@/lib/consultas/liga';
import { formatearFechaCorta, hoyEnSonora } from '@/lib/fechas';
import { CATEGORIAS, PUESTOS } from '@/lib/panel/catalogos';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../../panel.module.css';
import { CabeceraPagina, Volver } from '../../componentes';
import { agregarCuerpoTecnico, agregarJugador, copiarPlantillaAnterior, guardarEquipo, quitarCuerpoTecnico } from '../acciones';

type Parametros = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: 'Equipo' };

function edad(nacimiento: string, hoy: string) {
  const [a, m, d] = nacimiento.split('-').map(Number);
  const [ha, hm, hd] = hoy.split('-').map(Number);
  return ha - a - (hm < m || (hm === m && hd < d) ? 1 : 0);
}

const NOMBRE_CATEGORIA = Object.fromEntries(CATEGORIAS.map((c) => [c.valor, c.texto]));
const NOMBRE_PUESTO = Object.fromEntries(PUESTOS.map((p) => [p.valor, p.texto]));

export default async function EditarEquipo({ params }: Parametros) {
  await exigirAdministrador();
  const { id } = await params;
  if (!/^\d{1,9}$/.test(id)) notFound();
  const [equipo] = await db
    .select({ equipo: equipos, logo: { id: imagenes.id, urlChica: imagenes.urlChica } })
    .from(equipos)
    .leftJoin(imagenes, eq(equipos.logoId, imagenes.id))
    .where(eq(equipos.id, Number(id)));
  if (!equipo) notFound();
  const temporada = await obtenerTemporadaVigente();
  const [plantilla, cuerpo] = temporada
    ? await Promise.all([
        db
          .select({
            id: plantillas.id,
            nombre: jugadores.nombre,
            numero: plantillas.numero,
            categoria: plantillas.categoria,
            alta: plantillas.alta,
            baja: plantillas.baja,
            nacimiento: datosPrivadosJugador.fechaNacimiento,
          })
          .from(plantillas)
          .innerJoin(jugadores, eq(plantillas.jugadorId, jugadores.id))
          .leftJoin(datosPrivadosJugador, eq(datosPrivadosJugador.jugadorId, jugadores.id))
          .where(and(eq(plantillas.temporadaId, temporada.id), eq(plantillas.equipoId, equipo.equipo.id)))
          .orderBy(asc(plantillas.numero), asc(jugadores.nombre)),
        db
          .select()
          .from(cuerpoTecnico)
          .where(and(eq(cuerpoTecnico.temporadaId, temporada.id), eq(cuerpoTecnico.equipoId, equipo.equipo.id))),
      ])
    : [[], []];
  const hoy = hoyEnSonora();
  const activos = plantilla.filter((j) => !j.baja);
  const bajas = plantilla.filter((j) => j.baja);
  const e = equipo.equipo;

  return (
    <>
      <Volver href="/panel/equipos" texto="Todos los equipos" />
      <CabeceraPagina antetitulo={temporada ? `Temporada ${temporada.nombre}` : undefined} titulo={e.nombre}>
        <p>
          <Link prefetch={false} href={`/equipos/${e.slug}`}>
            Ver la página del equipo en el sitio
          </Link>
        </p>
      </CabeceraPagina>

      <section className={estilos.seccion} aria-labelledby="titulo-datos">
        <h2 id="titulo-datos" className={estilos.subtitulo}>
          Datos del equipo
        </h2>
        <Formulario accion={guardarEquipo} boton="Guardar equipo" columnas>
          <input type="hidden" name="id" value={e.id} />
          <Texto nombre="nombre" etiqueta="Nombre" valor={e.nombre} requerido maximo={60} ancho="medio" />
          <Texto nombre="nombreCorto" etiqueta="Abreviatura" valor={e.nombreCorto} requerido maximo={4} ancho="corto" />
          <Texto nombre="poblado" etiqueta="Poblado" valor={e.poblado} maximo={60} ancho="medio" />
          <CampoImagen
            nombre="logoId"
            etiqueta="Logotipo"
            tipo="logo"
            actual={equipo.logo}
            ayuda="Se guarda cuadrado en tres tamaños. Si no es cuadrado, se completa con el color de su borde."
          />
          <Casilla nombre="activo" etiqueta="Equipo activo" marcada={e.activo} ayuda="Los inactivos no se proponen al crear una temporada." />
        </Formulario>
      </section>

      {temporada ? (
        <>
          <section className={estilos.seccion} aria-labelledby="titulo-plantilla">
            <h2 id="titulo-plantilla" className={estilos.subtitulo}>
              Plantilla ({activos.length} activos)
            </h2>
            <p>La fecha de nacimiento solo se ve aquí, nunca en el sitio.</p>
            {plantilla.length === 0 && (
              <div>
                <BotonAccion
                  accion={copiarPlantillaAnterior.bind(null, e.id, temporada.id)}
                  texto="Copiar la plantilla de la temporada anterior"
                />
              </div>
            )}
            <ul className={estilos.filas}>
              {[...activos, ...bajas].map((j) => (
                <li key={j.id} className={estilos.fila}>
                  <div className={estilos.filaPrincipal}>
                    <span className={estilos.filaTitulo}>
                      <Link prefetch={false} href={`/panel/equipos/${e.id}/jugadores/${j.id}`}>
                        {j.numero !== null ? `${j.numero} · ` : ''}
                        {j.nombre}
                      </Link>
                    </span>
                    <span className={estilos.filaDetalle}>
                      {[
                        NOMBRE_CATEGORIA[j.categoria],
                        j.nacimiento ? `${edad(j.nacimiento, hoy)} años` : 'sin fecha de nacimiento',
                        j.baja ? `baja: ${formatearFechaCorta(j.baja)}` : j.alta ? `alta: ${formatearFechaCorta(j.alta)}` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </div>
                  {j.baja && <span className={estilos.etiquetaNeutra}>Baja</span>}
                </li>
              ))}
            </ul>
            <h3 className={estilos.renglonTitulo}>Dar de alta a un jugador</h3>
            <Formulario accion={agregarJugador} boton="Dar de alta" columnas reiniciar>
              <input type="hidden" name="temporadaId" value={temporada.id} />
              <input type="hidden" name="equipoId" value={e.id} />
              <Texto nombre="nombre" etiqueta="Nombre completo" requerido maximo={80} ancho="medio" />
              <Texto nombre="numero" etiqueta="Número" tipo="number" minimo={0} maximoNumero={99} ancho="corto" />
              <Seleccion nombre="categoria" etiqueta="Categoría" opciones={[...CATEGORIAS]} valor="local" ancho="corto" />
              <Texto nombre="fechaNacimiento" etiqueta="Fecha de nacimiento" tipo="date" ancho="corto" ayuda="Privada." />
              <Texto nombre="alta" etiqueta="Fecha de alta" tipo="date" valor={hoy} ancho="corto" />
            </Formulario>
          </section>

          <section className={estilos.seccion} aria-labelledby="titulo-cuerpo">
            <h2 id="titulo-cuerpo" className={estilos.subtitulo}>
              Cuerpo técnico
            </h2>
            {cuerpo.length > 0 && (
              <ul className={estilos.filas}>
                {cuerpo.map((c) => (
                  <li key={c.id} className={estilos.fila}>
                    <div className={estilos.filaPrincipal}>
                      <span className={estilos.filaTitulo}>{c.nombre}</span>
                      <span className={estilos.filaDetalle}>{NOMBRE_PUESTO[c.puesto]}</span>
                    </div>
                    <BotonAccion accion={quitarCuerpoTecnico.bind(null, c.id)} texto="Quitar" confirmar={`¿Quitar a ${c.nombre}?`} peligro />
                  </li>
                ))}
              </ul>
            )}
            <Formulario accion={agregarCuerpoTecnico} boton="Agregar" columnas reiniciar>
              <input type="hidden" name="temporadaId" value={temporada.id} />
              <input type="hidden" name="equipoId" value={e.id} />
              <Seleccion nombre="puesto" etiqueta="Puesto" opciones={[...PUESTOS]} valor="delegado" ancho="corto" />
              <Texto nombre="nombre" etiqueta="Nombre" requerido maximo={80} ancho="medio" />
            </Formulario>
          </section>
        </>
      ) : (
        <p className={estilos.aviso}>Las plantillas se capturan por temporada. Primero crea la temporada en Calendario.</p>
      )}
    </>
  );
}
