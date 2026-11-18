import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { db } from '@/db/conexion';
import { temporadas } from '@/db/esquema';
import { auth } from '@/lib/auth';
import { obtenerEstadisticas } from '@/lib/consultas/estadisticas';
import { archivoCsv, filasCsvDeBateo, filasCsvDePitcheo } from '@/lib/estadisticas';
import { crearSlug } from '@/lib/nombres';
import { rolDe } from '@/lib/roles';

const ID = /^\d{1,9}$/;

export async function GET(_solicitud: Request, { params }: { params: Promise<{ temporada: string; tipo: string }> }) {
  const sesion = await auth.api.getSession({ headers: await headers() });
  if (!sesion || sesion.user.debeCambiarContrasena || !sesion.user.activo || rolDe(sesion.user.rol) === null) {
    return new Response('Entra al panel para descargar las estadísticas.', { status: 401 });
  }
  const { temporada: temporadaTexto, tipo } = await params;
  if (!ID.test(temporadaTexto) || (tipo !== 'bateo' && tipo !== 'pitcheo')) return new Response('No existe ese archivo.', { status: 404 });
  const [temporada] = await db.select({ id: temporadas.id, nombre: temporadas.nombre }).from(temporadas).where(eq(temporadas.id, Number(temporadaTexto)));
  if (!temporada) return new Response('No existe esa temporada.', { status: 404 });

  const datos = await obtenerEstadisticas(temporada.id);
  const equipos = new Map(datos.equipos.map((e) => [e.id, e.nombre]));
  const filas = tipo === 'bateo' ? filasCsvDeBateo(datos.bateo, equipos) : filasCsvDePitcheo(datos.pitcheo, equipos);
  return new Response(archivoCsv(filas), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${tipo}-${crearSlug(temporada.nombre)}.csv"`,
      'cache-control': 'private, no-store',
    },
  });
}
