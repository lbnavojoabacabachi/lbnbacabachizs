import { asc, desc } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BotonAccion } from '@/app/panel/componentes/BotonAccion';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { Casilla, Texto } from '@/app/panel/componentes/Entradas';
import { db } from '@/db/conexion';
import { publicacionesRedes } from '@/db/esquema';
import { formatearFecha } from '@/lib/fechas';
import { NOMBRES_RED } from '@/lib/incrustar';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../panel.module.css';
import { CabeceraPagina } from '../componentes';
import { eliminarPublicacion, guardarPublicacion } from '../transmisiones/acciones';

export const metadata: Metadata = { title: 'Redes' };

type Publicacion = typeof publicacionesRedes.$inferSelect;

function Campos({ p }: { p: Publicacion | null }) {
  return (
    <>
      <input type="hidden" name="id" value={p?.id ?? ''} />
      <Texto
        nombre="url"
        etiqueta="Enlace de la publicación"
        tipo="url"
        valor={p?.url}
        requerido
        maximo={500}
        ayuda="En la publicación, toca «Compartir» y luego «Copiar enlace»."
      />
      <Texto nombre="titulo" etiqueta="Título" valor={p?.titulo} maximo={140} ancho="medio" ayuda="Se ve antes de abrir la publicación." />
      <Texto nombre="publicadaEn" etiqueta="Fecha" tipo="date" valor={p?.publicadaEn} ancho="corto" />
      <Texto nombre="orden" etiqueta="Orden" tipo="number" valor={p?.orden ?? 0} minimo={0} maximoNumero={999} ancho="corto" />
      <Casilla nombre="destacada" etiqueta="Destacada" marcada={p?.destacada} ayuda="Las destacadas salen en la portada." />
      <Casilla nombre="activa" etiqueta="Visible en el sitio" marcada={p ? p.activa : true} />
    </>
  );
}

export default async function RedesPanel() {
  await exigirAdministrador();
  const lista = await db
    .select()
    .from(publicacionesRedes)
    .orderBy(desc(publicacionesRedes.destacada), asc(publicacionesRedes.orden), desc(publicacionesRedes.publicadaEn));
  return (
    <>
      <CabeceraPagina titulo="Redes">
        <p>
          Elige las publicaciones de Facebook, Instagram, YouTube o TikTok que se muestran en el sitio. Los enlaces a los perfiles de la liga se
          cambian en{' '}
          <Link prefetch={false} href="/panel/contacto">
            Contacto y perfiles
          </Link>
          .
        </p>
      </CabeceraPagina>
      {lista.length === 0 ? (
        <p className={estilos.vacio}>Todavía no hay publicaciones elegidas.</p>
      ) : (
        <ul className={estilos.filas}>
          {lista.map((p) => (
            <li key={p.id} className={estilos.fila}>
              <div className={estilos.filaPrincipal}>
                <span className={estilos.filaTitulo}>{p.titulo ?? `Publicación de ${NOMBRES_RED[p.red]}`}</span>
                <span className={estilos.filaDetalle}>
                  {[NOMBRES_RED[p.red], p.publicadaEn ? formatearFecha(p.publicadaEn, { diaSemana: false }) : null, p.destacada ? 'destacada' : null]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
              {!p.activa && <span className={estilos.etiquetaNeutra}>Oculta</span>}
              <BotonAccion accion={eliminarPublicacion.bind(null, p.id)} texto="Quitar" confirmar="¿Quitar esta publicación del sitio?" peligro />
              <details className={estilos.filaPrincipal}>
                <summary className={estilos.desplegable}>Editar</summary>
                <Formulario accion={guardarPublicacion} boton="Guardar" columnas>
                  <Campos p={p} />
                </Formulario>
              </details>
            </li>
          ))}
        </ul>
      )}
      <section className={estilos.seccion} aria-labelledby="titulo-nueva">
        <h2 id="titulo-nueva" className={estilos.subtitulo}>
          Agregar publicación
        </h2>
        <Formulario accion={guardarPublicacion} boton="Agregar" columnas reiniciar>
          <Campos p={null} />
        </Formulario>
      </section>
    </>
  );
}
