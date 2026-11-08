import { asc } from 'drizzle-orm';
import type { Metadata } from 'next';
import { BotonAccion } from '@/app/panel/componentes/BotonAccion';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { Casilla, Texto } from '@/app/panel/componentes/Entradas';
import { db } from '@/db/conexion';
import { documentos } from '@/db/esquema';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../panel.module.css';
import { CabeceraPagina } from '../componentes';
import { eliminarDocumento, guardarDocumento } from '../patrocinadores/acciones';
import { SubirDocumento } from './SubirDocumento';

export const metadata: Metadata = { title: 'Documentos' };

export default async function DocumentosPanel() {
  await exigirAdministrador();
  const lista = await db.select().from(documentos).orderBy(asc(documentos.orden), asc(documentos.titulo));
  return (
    <>
      <CabeceraPagina titulo="Documentos">
        <p>Reglamento, formatos de registro y de altas y bajas. Se descargan desde la página Documentos del sitio.</p>
      </CabeceraPagina>
      {lista.length === 0 ? (
        <p className={estilos.vacio}>Todavía no hay documentos.</p>
      ) : (
        <ul className={estilos.filas}>
          {lista.map((d) => (
            <li key={d.id} className={estilos.fila}>
              <div className={estilos.filaPrincipal}>
                <span className={estilos.filaTitulo}>
                  <a href={d.url} target="_blank" rel="noopener">
                    {d.titulo}
                  </a>
                </span>
                <span className={estilos.filaDetalle}>PDF · {d.bytes ? `${Math.max(1, Math.round(d.bytes / 1024))} KB` : ''}</span>
              </div>
              {!d.publicadoEn && <span className={estilos.etiquetaNeutra}>Oculto</span>}
              <BotonAccion accion={eliminarDocumento.bind(null, d.id)} texto="Eliminar" confirmar={`¿Eliminar «${d.titulo}»?`} peligro />
              <details className={estilos.filaPrincipal}>
                <summary className={estilos.desplegable}>Editar</summary>
                <Formulario accion={guardarDocumento} boton="Guardar" columnas>
                  <input type="hidden" name="id" value={d.id} />
                  <Texto nombre="titulo" etiqueta="Título" valor={d.titulo} requerido maximo={140} ancho="medio" />
                  <Texto nombre="orden" etiqueta="Orden" tipo="number" valor={d.orden} minimo={0} maximoNumero={999} ancho="corto" />
                  <Casilla nombre="publicado" etiqueta="Visible en el sitio" marcada={d.publicadoEn !== null} />
                </Formulario>
              </details>
            </li>
          ))}
        </ul>
      )}
      <section className={estilos.seccion} aria-labelledby="titulo-subir">
        <h2 id="titulo-subir" className={estilos.subtitulo}>
          Subir documento
        </h2>
        <SubirDocumento />
      </section>
    </>
  );
}
