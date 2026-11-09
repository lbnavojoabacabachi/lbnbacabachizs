import { count, desc, eq } from 'drizzle-orm';
import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { Texto } from '@/app/panel/componentes/Entradas';
import { db } from '@/db/conexion';
import { estadisticasBateo, estadisticasPitcheo, temporadas } from '@/db/esquema';
import { obtenerMinimoApariciones } from '@/lib/consultas/estadisticas';
import { obtenerEquipos } from '@/lib/consultas/liga';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../panel.module.css';
import { CabeceraPagina, SinTemporada } from '../componentes';
import { guardarMinimoApariciones } from './acciones';

export const metadata: Metadata = { title: 'Estadísticas' };

function plural(cantidad: number, singular: string, varios: string) {
  return `${cantidad} ${cantidad === 1 ? singular : varios}`;
}

export default async function EstadisticasPanel({ searchParams }: { searchParams: Promise<{ temporada?: string }> }) {
  await exigirAdministrador();
  const { temporada: pedida } = await searchParams;
  const lista = await db.select({ id: temporadas.id, nombre: temporadas.nombre, vigente: temporadas.vigente }).from(temporadas).orderBy(desc(temporadas.inicio));
  const elegida = lista.find((t) => String(t.id) === pedida) ?? lista.find((t) => t.vigente) ?? lista[0];
  if (!elegida) {
    return (
      <>
        <CabeceraPagina titulo="Estadísticas" />
        <SinTemporada />
      </>
    );
  }
  const [equiposTemporada, bateo, pitcheo, minimo] = await Promise.all([
    obtenerEquipos(elegida.id),
    db
      .select({ equipoId: estadisticasBateo.equipoId, total: count() })
      .from(estadisticasBateo)
      .where(eq(estadisticasBateo.temporadaId, elegida.id))
      .groupBy(estadisticasBateo.equipoId),
    db
      .select({ equipoId: estadisticasPitcheo.equipoId, total: count() })
      .from(estadisticasPitcheo)
      .where(eq(estadisticasPitcheo.temporadaId, elegida.id))
      .groupBy(estadisticasPitcheo.equipoId),
    obtenerMinimoApariciones(elegida.id),
  ]);
  const bateadores = new Map(bateo.map((f) => [f.equipoId, f.total]));
  const pitchers = new Map(pitcheo.map((f) => [f.equipoId, f.total]));

  return (
    <>
      <CabeceraPagina antetitulo={`Temporada ${elegida.nombre}`} titulo="Estadísticas">
        <p>Bateo y pitcheo de cada equipo, tal como los entrega el anotador. El sitio muestra la temporada más reciente que tenga números.</p>
      </CabeceraPagina>

      {lista.length > 1 && (
        <nav aria-label="Temporadas" className={estilos.temporadas}>
          {lista.map((t) => (
            <Link
              key={t.id}
              prefetch={false}
              href={`/panel/estadisticas?temporada=${t.id}` as Route}
              aria-current={t.id === elegida.id ? 'page' : undefined}
              className={estilos.temporada}
            >
              {t.nombre}
              {t.vigente ? ' (vigente)' : ''}
            </Link>
          ))}
        </nav>
      )}

      <ul className={estilos.filas}>
        {equiposTemporada.map((e) => {
          const b = bateadores.get(e.id) ?? 0;
          const p = pitchers.get(e.id) ?? 0;
          return (
            <li key={e.id} className={estilos.fila}>
              <div className={estilos.filaPrincipal}>
                <span className={estilos.filaTitulo}>
                  <Link prefetch={false} href={`/panel/estadisticas/${elegida.id}/${e.id}` as Route}>
                    {e.nombre}
                  </Link>
                </span>
                <span className={estilos.filaDetalle}>
                  {b + p > 0 ? `${plural(b, 'fila de bateo', 'filas de bateo')} · ${plural(p, 'pitcher', 'pitchers')}` : 'Sin números todavía'}
                </span>
              </div>
              <span className={b + p > 0 ? estilos.etiquetaOk : estilos.etiquetaPendiente}>{b + p > 0 ? 'Con números' : 'Pendiente'}</span>
            </li>
          );
        })}
      </ul>

      <section className={estilos.seccion} aria-labelledby="titulo-minimo">
        <h2 id="titulo-minimo" className={estilos.subtitulo}>
          Título de bateo
        </h2>
        <Formulario accion={guardarMinimoApariciones} boton="Guardar mínimo" columnas>
          <input type="hidden" name="temporadaId" value={elegida.id} />
          <Texto
            nombre="minimoApariciones"
            etiqueta="Mínimo de apariciones al bat (AB)"
            tipo="number"
            valor={minimo}
            minimo={0}
            maximoNumero={999}
            requerido
            ancho="medio"
            ayuda="Para entrar a los líderes de promedio. El anotador usó 70 al cierre de la temporada 2025-2026."
          />
        </Formulario>
      </section>
    </>
  );
}
