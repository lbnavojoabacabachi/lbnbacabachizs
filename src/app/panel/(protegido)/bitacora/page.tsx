import { count, desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/db/conexion';
import { bitacora, user } from '@/db/esquema';
import { capitalizar, formatearInstante } from '@/lib/fechas';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../panel.module.css';
import { CabeceraPagina } from '../componentes';

export const metadata: Metadata = { title: 'Bitácora' };

const POR_PAGINA = 50;

export default async function Bitacora({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  await exigirAdministrador();
  const { pagina: texto } = await searchParams;
  const pagina = Math.max(1, Math.min(10000, Number.parseInt(texto ?? '1', 10) || 1));
  const [[{ total }], registros] = await Promise.all([
    db.select({ total: count() }).from(bitacora),
    db
      .select({ id: bitacora.id, resumen: bitacora.resumen, creadoEn: bitacora.creadoEn, usuario: user.displayUsername })
      .from(bitacora)
      .leftJoin(user, eq(bitacora.usuarioId, user.id))
      .orderBy(desc(bitacora.creadoEn), desc(bitacora.id))
      .limit(POR_PAGINA)
      .offset((pagina - 1) * POR_PAGINA),
  ]);
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <>
      <CabeceraPagina titulo="Bitácora">
        <p>Cada cambio hecho en el panel queda aquí con quién lo hizo y cuándo. No se puede editar ni borrar.</p>
      </CabeceraPagina>
      <ul className={estilos.filas}>
        {registros.map((r) => (
          <li key={r.id} className={estilos.fila}>
            <div className={estilos.filaPrincipal}>
              <span className={estilos.filaTitulo}>{r.resumen}</span>
              <span className={estilos.filaDetalle}>
                {r.usuario ?? 'Sistema'} · {capitalizar(formatearInstante(r.creadoEn))}
              </span>
            </div>
          </li>
        ))}
      </ul>
      {paginas > 1 && (
        <nav aria-label="Páginas de la bitácora" className={estilos.filaAcciones}>
          {pagina > 1 && (
            <Link prefetch={false} href={{ pathname: '/panel/bitacora', query: { pagina: pagina - 1 } }} className={estilos.enlaceVolver}>
              Más recientes
            </Link>
          )}
          <span className={estilos.filaDetalle}>
            Página {pagina} de {paginas}
          </span>
          {pagina < paginas && (
            <Link prefetch={false} href={{ pathname: '/panel/bitacora', query: { pagina: pagina + 1 } }} className={estilos.enlaceVolver}>
              Más antiguos
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
