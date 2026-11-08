import { asc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { BotonAccion } from '@/app/panel/componentes/BotonAccion';
import { CampoImagen } from '@/app/panel/componentes/CampoImagen';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { Casilla, Texto } from '@/app/panel/componentes/Entradas';
import { db } from '@/db/conexion';
import { imagenes, patrocinadores } from '@/db/esquema';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../panel.module.css';
import { CabeceraPagina } from '../componentes';
import { eliminarPatrocinador, guardarPatrocinador } from './acciones';

export const metadata: Metadata = { title: 'Patrocinadores' };

type Patrocinador = {
  id: number;
  nombre: string;
  enlace: string | null;
  orden: number;
  activo: boolean;
  logo: { id: number; urlChica: string } | null;
};

function Campos({ p }: { p: Patrocinador | null }) {
  return (
    <>
      <input type="hidden" name="id" value={p?.id ?? ''} />
      <Texto nombre="nombre" etiqueta="Nombre" valor={p?.nombre} requerido maximo={100} ancho="medio" />
      <Texto nombre="enlace" etiqueta="Enlace" tipo="url" valor={p?.enlace} maximo={500} ancho="medio" ayuda="Su página de Facebook o su sitio." />
      <CampoImagen nombre="logoId" etiqueta="Logotipo" tipo="patrocinador" actual={p?.logo ?? null} />
      <Texto nombre="orden" etiqueta="Orden" tipo="number" valor={p?.orden ?? 0} minimo={0} maximoNumero={999} ancho="corto" />
      <Casilla nombre="activo" etiqueta="Visible en el sitio" marcada={p ? p.activo : true} />
    </>
  );
}

export default async function PatrocinadoresPanel() {
  await exigirAdministrador();
  const lista = await db
    .select({
      id: patrocinadores.id,
      nombre: patrocinadores.nombre,
      enlace: patrocinadores.enlace,
      orden: patrocinadores.orden,
      activo: patrocinadores.activo,
      logo: { id: imagenes.id, urlChica: imagenes.urlChica },
    })
    .from(patrocinadores)
    .leftJoin(imagenes, eq(patrocinadores.logoId, imagenes.id))
    .orderBy(asc(patrocinadores.orden), asc(patrocinadores.nombre));
  return (
    <>
      <CabeceraPagina titulo="Patrocinadores">
        <p>Salen al final de la portada, en el orden que les pongas.</p>
      </CabeceraPagina>
      <ul className={estilos.filas}>
        {lista.map((p) => (
          <li key={p.id} className={estilos.fila}>
            {p.logo ? <img src={p.logo.urlChica} alt="" className={estilos.miniaturaLogo} /> : <span className={estilos.miniaturaLogo} />}
            <div className={estilos.filaPrincipal}>
              <span className={estilos.filaTitulo}>{p.nombre}</span>
              <span className={estilos.filaDetalle}>{p.enlace ?? 'Sin enlace'}</span>
            </div>
            {!p.activo && <span className={estilos.etiquetaNeutra}>Oculto</span>}
            <BotonAccion accion={eliminarPatrocinador.bind(null, p.id)} texto="Eliminar" confirmar={`¿Eliminar a ${p.nombre}?`} peligro />
            <details className={estilos.filaPrincipal}>
              <summary className={estilos.desplegable}>Editar</summary>
              <Formulario accion={guardarPatrocinador} boton="Guardar" columnas>
                <Campos p={p} />
              </Formulario>
            </details>
          </li>
        ))}
      </ul>
      <section className={estilos.seccion} aria-labelledby="titulo-nuevo">
        <h2 id="titulo-nuevo" className={estilos.subtitulo}>
          Agregar patrocinador
        </h2>
        <Formulario accion={guardarPatrocinador} boton="Agregar" columnas reiniciar>
          <Campos p={null} />
        </Formulario>
      </section>
    </>
  );
}
