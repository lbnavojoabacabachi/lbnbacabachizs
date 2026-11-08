import { asc, eq, isNull, sql, and } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { Casilla, Texto } from '@/app/panel/componentes/Entradas';
import { db } from '@/db/conexion';
import { equipos, imagenes, plantillas, temporadaEquipos } from '@/db/esquema';
import { obtenerTemporadaVigente } from '@/lib/consultas/liga';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../panel.module.css';
import { CabeceraPagina } from '../componentes';
import { crearEquipo } from './acciones';

export const metadata: Metadata = { title: 'Equipos' };

export default async function EquiposPanel() {
  await exigirAdministrador();
  const temporada = await obtenerTemporadaVigente();
  const lista = await db
    .select({
      id: equipos.id,
      nombre: equipos.nombre,
      poblado: equipos.poblado,
      activo: equipos.activo,
      logo: imagenes.urlChica,
      participa: temporada
        ? sql<boolean>`exists (select 1 from ${temporadaEquipos} where ${temporadaEquipos.equipoId} = ${equipos.id} and ${temporadaEquipos.temporadaId} = ${temporada.id})`
        : sql<boolean>`false`,
      jugadores: temporada
        ? db.$count(plantillas, and(eq(plantillas.equipoId, equipos.id), eq(plantillas.temporadaId, temporada.id), isNull(plantillas.baja)))
        : sql<number>`0`,
    })
    .from(equipos)
    .leftJoin(imagenes, eq(equipos.logoId, imagenes.id))
    .orderBy(asc(equipos.nombre));

  return (
    <>
      <CabeceraPagina antetitulo={temporada ? `Temporada ${temporada.nombre}` : undefined} titulo="Equipos">
        <p>Toca un equipo para cambiar su logotipo, su plantilla o su cuerpo técnico.</p>
      </CabeceraPagina>
      <ul className={estilos.filas}>
        {lista.map((e) => (
          <li key={e.id} className={estilos.fila}>
            {e.logo ? <img src={e.logo} alt="" className={estilos.miniaturaLogo} /> : <span className={estilos.miniaturaLogo} />}
            <div className={estilos.filaPrincipal}>
              <span className={estilos.filaTitulo}>
                <Link prefetch={false} href={`/panel/equipos/${e.id}`}>
                  {e.nombre}
                </Link>
              </span>
              <span className={estilos.filaDetalle}>
                {[e.poblado, e.participa ? `${e.jugadores} jugadores activos` : 'No participa en la temporada vigente'].filter(Boolean).join(' · ')}
              </span>
            </div>
            {!e.activo && <span className={estilos.etiquetaNeutra}>Inactivo</span>}
          </li>
        ))}
      </ul>
      <section className={estilos.seccion} aria-labelledby="titulo-nuevo">
        <h2 id="titulo-nuevo" className={estilos.subtitulo}>
          Nuevo equipo
        </h2>
        <Formulario accion={crearEquipo} boton="Dar de alta" columnas reiniciar>
          <Texto nombre="nombre" etiqueta="Nombre" requerido maximo={60} ancho="medio" marcador="Venados de Batayaqui" />
          <Texto nombre="nombreCorto" etiqueta="Abreviatura" requerido maximo={4} ancho="corto" marcador="VEN" />
          <Texto nombre="poblado" etiqueta="Poblado" maximo={60} ancho="medio" />
          <Casilla nombre="enTemporada" etiqueta="Participa en la temporada vigente" marcada />
        </Formulario>
      </section>
    </>
  );
}
