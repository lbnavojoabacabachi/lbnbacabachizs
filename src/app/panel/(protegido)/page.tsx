import { and, count, desc, eq, isNull, lt, sql } from 'drizzle-orm';
import type { Metadata, Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BotonAccion } from '@/app/panel/componentes/BotonAccion';
import formularios from '@/app/panel/componentes/formularios.module.css';
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
import { cambiarEnVivo } from './transmisiones/acciones';

export const metadata: Metadata = { title: 'Inicio' };

type Pendiente = { clave: string; titulo: string; detalle: string; accion: ReactNode };

const cuantos = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

function Ir({ href, texto, contexto, urgente = false }: { href: Route; texto: string; contexto: string; urgente?: boolean }) {
  return (
    <Link prefetch={false} href={href} className={urgente ? estilos.enlaceBoton : formularios.botonChico}>
      {texto}
      <span className="solo-lectores"> {contexto}</span>
    </Link>
  );
}

export default async function InicioPanel({ searchParams }: { searchParams: Promise<{ contrasena?: string }> }) {
  const { contrasena } = await searchParams;
  const sesion = await exigirAdministrador();
  const temporada = await obtenerTemporadaVigente();
  const [jornadas, borradores, albumesSinPublicar, fotosSinPie, vivasOlvidadas, sinUso, actividad] = await Promise.all([
    temporada ? jornadasConAvance(temporada.id) : [],
    db.select({ id: noticias.id }).from(noticias).where(isNull(noticias.publicadaEn)).orderBy(desc(noticias.id)),
    db.select({ id: albumes.id }).from(albumes).where(eq(albumes.publicado, false)).orderBy(desc(albumes.id)),
    db
      .select({ albumId: albumFotos.albumId, total: count() })
      .from(albumFotos)
      .innerJoin(albumes, eq(albumFotos.albumId, albumes.id))
      .where(and(eq(albumes.publicado, true), isNull(albumFotos.pie)))
      .groupBy(albumFotos.albumId)
      .orderBy(desc(count())),
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

  const sinPie = fotosSinPie.reduce((suma, a) => suma + a.total, 0);

  const pendientes: Pendiente[] = [
    ...atrasadas.slice(0, 3).map((j) => ({
      clave: `jornada-${j.id}`,
      titulo: `Resultados de la jornada ${j.numero}`,
      detalle: `${j.fecha ? capitalizar(formatearFecha(j.fecha)) : ''} · ${j.capturados} de ${j.juegos} juegos capturados`,
      accion: <Ir href={`/panel/resultados/${j.numero}` as Route} texto="Capturar" contexto={`resultados de la jornada ${j.numero}`} urgente />,
    })),
    ...(atrasadas.length > 3
      ? [
          {
            clave: 'mas-jornadas',
            titulo: `Y ${cuantos(atrasadas.length - 3, 'jornada más', 'jornadas más')} sin resultados`,
            detalle: 'Todas están en Resultados.',
            accion: <Ir href="/panel/resultados" texto="Ver jornadas" contexto="sin resultados" urgente />,
          },
        ]
      : []),
    ...vivasOlvidadas.map((t) => ({
      clave: `vivo-${t.id}`,
      titulo: `«${t.titulo}» sigue marcada en vivo`,
      detalle: 'Empezó hace más de 6 horas. Termínala para quitar el aviso de la portada.',
      accion: <BotonAccion accion={cambiarEnVivo.bind(null, t.id, false)} texto="Terminar" etiqueta={`Terminar «${t.titulo}»`} peligro />,
    })),
    ...(borradores.length > 0
      ? [
          {
            clave: 'borradores',
            titulo: `${cuantos(borradores.length, 'noticia', 'noticias')} en borrador`,
            detalle: 'No se ven en el sitio hasta que las publiques.',
            accion:
              borradores.length === 1 ? (
                <Ir href={`/panel/noticias/${borradores[0].id}` as Route} texto="Revisar" contexto="la noticia en borrador" />
              ) : (
                <Ir href="/panel/noticias" texto="Ver borradores" contexto="de noticias" />
              ),
          },
        ]
      : []),
    ...(albumesSinPublicar.length > 0
      ? [
          {
            clave: 'albumes',
            titulo: `${cuantos(albumesSinPublicar.length, 'álbum', 'álbumes')} sin publicar`,
            detalle: 'No se ven en el sitio hasta que los publiques.',
            accion:
              albumesSinPublicar.length === 1 ? (
                <Ir href={`/panel/galeria/${albumesSinPublicar[0].id}` as Route} texto="Revisar" contexto="el álbum sin publicar" />
              ) : (
                <Ir href="/panel/galeria" texto="Ver álbumes" contexto="sin publicar" />
              ),
          },
        ]
      : []),
    ...(sinPie > 0
      ? [
          {
            clave: 'pies',
            titulo: `${cuantos(sinPie, 'foto publicada', 'fotos publicadas')} sin pie`,
            detalle:
              fotosSinPie.length > 1
                ? `Están en ${fotosSinPie.length} álbumes; el botón abre el que tiene más. El pie ayuda a quien usa lector de pantalla y a quien busca una foto.`
                : 'El pie ayuda a quien usa lector de pantalla y a quien busca una foto.',
            accion: <Ir href={`/panel/galeria/${fotosSinPie[0].albumId}` as Route} texto="Agregar pies" contexto="a las fotos" />,
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

      {contrasena === 'cambiada' && (
        <p className={estilos.aviso} role="status">
          Tu contraseña quedó cambiada. Si tenías el panel abierto en otro aparato, ahí tendrás que entrar de nuevo.
        </p>
      )}

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
                  <span className={estilos.filaTitulo}>{p.titulo}</span>
                  <span className={estilos.filaDetalle}>{p.detalle}</span>
                </div>
                {p.accion}
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
