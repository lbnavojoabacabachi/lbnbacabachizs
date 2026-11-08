import { and, count, desc, eq, isNull, lt, sql } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BotonAccion } from '@/app/panel/componentes/BotonAccion';
import { db } from '@/db/conexion';
import { albumFotos, albumes, bitacora, noticias, transmisiones, user } from '@/db/esquema';
import { obtenerTemporadaVigente } from '@/lib/consultas/liga';
import { jornadasConAvance } from '@/lib/consultas/panel';
import { capitalizar, formatearFecha, formatearInstante, hoyEnSonora } from '@/lib/fechas';
import { imagenesSinUso } from '@/lib/imagenes/limpiar';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../panel.module.css';
import { limpiarImagenes } from './acciones';
import { CabeceraPagina } from './componentes';
import { SECCIONES } from './secciones';

export const metadata: Metadata = { title: 'Inicio' };

type Pendiente = { clave: string; contenido: ReactNode; detalle: string; urgente: boolean };

export default async function InicioPanel() {
  const sesion = await exigirAdministrador();
  const temporada = await obtenerTemporadaVigente();
  const [jornadas, borradores, albumesSinPublicar, fotosSinPie, vivasOlvidadas, sinUso, actividad] = await Promise.all([
    temporada ? jornadasConAvance(temporada.id) : [],
    db.select({ total: count() }).from(noticias).where(isNull(noticias.publicadaEn)),
    db.select({ total: count() }).from(albumes).where(eq(albumes.publicado, false)),
    db
      .select({ total: count() })
      .from(albumFotos)
      .innerJoin(albumes, eq(albumFotos.albumId, albumes.id))
      .where(and(eq(albumes.publicado, true), isNull(albumFotos.pie))),
    db
      .select({ id: transmisiones.id, titulo: transmisiones.titulo })
      .from(transmisiones)
      .where(
        and(
          eq(transmisiones.enVivo, true),
          lt(transmisiones.inicio, sql`now() - interval '6 hours'`),
          sql`(${transmisiones.fin} is null or ${transmisiones.fin} > now())`,
        ),
      ),
    imagenesSinUso(),
    db
      .select({ id: bitacora.id, resumen: bitacora.resumen, creadoEn: bitacora.creadoEn, usuario: user.displayUsername })
      .from(bitacora)
      .leftJoin(user, eq(bitacora.usuarioId, user.id))
      .orderBy(desc(bitacora.creadoEn))
      .limit(8),
  ]);
  const hoy = hoyEnSonora();
  const atrasadas = jornadas.filter((j) => j.fecha !== null && j.fecha <= hoy && j.capturados < j.juegos);
  const proxima = jornadas.find((j) => j.fecha !== null && j.fecha > hoy);

  const pendientes: Pendiente[] = [
    ...atrasadas.slice(0, 3).map((j) => ({
      clave: `jornada-${j.id}`,
      contenido: (
        <Link prefetch={false} href={`/panel/resultados/${j.numero}`}>
          Capturar resultados de la jornada {j.numero}
        </Link>
      ),
      detalle: `${j.fecha ? capitalizar(formatearFecha(j.fecha)) : ''} · ${j.capturados} de ${j.juegos} juegos capturados`,
      urgente: true,
    })),
    ...(atrasadas.length > 3
      ? [
          {
            clave: 'mas-jornadas',
            contenido: (
              <Link prefetch={false} href="/panel/resultados">
                Y {atrasadas.length - 3} jornadas más sin resultados
              </Link>
            ),
            detalle: 'Todas están en Resultados.',
            urgente: true,
          },
        ]
      : []),
    ...vivasOlvidadas.map((t) => ({
      clave: `vivo-${t.id}`,
      contenido: (
        <Link prefetch={false} href="/panel/transmisiones">
          «{t.titulo}» sigue marcada en vivo
        </Link>
      ),
      detalle: 'Empezó hace más de 6 horas. Termínala para quitar el aviso de la portada.',
      urgente: true,
    })),
    ...(borradores[0].total > 0
      ? [
          {
            clave: 'borradores',
            contenido: (
              <Link prefetch={false} href="/panel/noticias">
                {borradores[0].total} noticias en borrador
              </Link>
            ),
            detalle: 'No se ven en el sitio.',
            urgente: false,
          },
        ]
      : []),
    ...(albumesSinPublicar[0].total > 0
      ? [
          {
            clave: 'albumes',
            contenido: (
              <Link prefetch={false} href="/panel/galeria">
                {albumesSinPublicar[0].total} álbumes sin publicar
              </Link>
            ),
            detalle: 'No se ven en el sitio.',
            urgente: false,
          },
        ]
      : []),
    ...(fotosSinPie[0].total > 0
      ? [
          {
            clave: 'pies',
            contenido: (
              <Link prefetch={false} href="/panel/galeria">
                {fotosSinPie[0].total} fotos publicadas sin pie
              </Link>
            ),
            detalle: 'El pie ayuda a quien usa lector de pantalla y a quien busca una foto.',
            urgente: false,
          },
        ]
      : []),
  ];

  return (
    <>
      <CabeceraPagina
        antetitulo={temporada ? `Temporada ${temporada.nombre}` : undefined}
        titulo={`Hola, ${sesion.user.displayUsername ?? sesion.user.name}`}
      >
        <p>
          {proxima?.fecha
            ? `La próxima jornada es la ${proxima.numero}, el ${formatearFecha(proxima.fecha)}. Todo lo que guardes aquí se publica al momento.`
            : 'Todo lo que guardes aquí se publica en el sitio al momento.'}
        </p>
      </CabeceraPagina>

      <section className={estilos.seccion} aria-labelledby="titulo-pendientes">
        <h2 id="titulo-pendientes" className={estilos.subtitulo}>
          Pendientes
        </h2>
        {pendientes.length === 0 ? (
          <p className={estilos.vacio}>Nada pendiente. El sitio está al día.</p>
        ) : (
          <ul className={estilos.filas}>
            {pendientes.map((p) => (
              <li key={p.clave} className={estilos.fila}>
                <div className={estilos.filaPrincipal}>
                  <span className={estilos.filaTitulo}>{p.contenido}</span>
                  <span className={estilos.filaDetalle}>{p.detalle}</span>
                </div>
                {p.urgente && <span className={estilos.etiquetaPendiente}>Pendiente</span>}
              </li>
            ))}
          </ul>
        )}
        {sinUso.length > 0 && (
          <div className={estilos.fila}>
            <div className={estilos.filaPrincipal}>
              <span className={estilos.filaTitulo}>{sinUso.length} imágenes subidas que no usa ninguna página</span>
              <span className={estilos.filaDetalle}>
                Quedan cuando se sube una foto y no se guarda el formulario, o cuando se cambia una imagen.
              </span>
            </div>
            <BotonAccion accion={limpiarImagenes} texto="Borrarlas" confirmar={`¿Borrar ${sinUso.length} imágenes sin uso?`} mostrarResultado />
          </div>
        )}
      </section>

      <section className={estilos.seccion} aria-labelledby="titulo-secciones">
        <h2 id="titulo-secciones" className={estilos.subtitulo}>
          Secciones
        </h2>
        <ul className={estilos.filas}>
          {SECCIONES.map((s) => (
            <li key={s.href} className={estilos.fila}>
              <div className={estilos.filaPrincipal}>
                <span className={estilos.filaTitulo}>
                  <Link prefetch={false} href={s.href}>
                    {s.texto}
                  </Link>
                </span>
                <span className={estilos.filaDetalle}>{s.detalle}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={estilos.seccion} aria-labelledby="titulo-actividad">
        <h2 id="titulo-actividad" className={estilos.subtitulo}>
          Actividad reciente
        </h2>
        {actividad.length === 0 ? (
          <p className={estilos.vacio}>Todavía no hay actividad.</p>
        ) : (
          <ul className={estilos.filas}>
            {actividad.map((a) => (
              <li key={a.id} className={estilos.fila}>
                <div className={estilos.filaPrincipal}>
                  <span className={estilos.filaTitulo}>{a.resumen}</span>
                  <span className={estilos.filaDetalle}>
                    {a.usuario ?? 'Sistema'} · {capitalizar(formatearInstante(a.creadoEn))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link prefetch={false} href="/panel/bitacora" className={estilos.enlaceVolver}>
          Toda la bitácora
        </Link>
      </section>
    </>
  );
}
