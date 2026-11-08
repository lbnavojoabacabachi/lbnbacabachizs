import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

export type JugadorLegado = { number: number; name: string; birthDate: string; category: string };
export type EquipoLegado = {
  id: number;
  name: string;
  logo: string;
  color: string;
  roster: JugadorLegado[];
  staff: { delegado: string; manager: string; coach: string };
};
export type PartidoLegado = { jornada: number; date?: string; homeTeam?: string; awayTeam?: string; status?: string; descansa?: string };
export type JuegoLegado = { homeScore?: number | string; awayScore?: number | string; forfeit?: boolean; forfeitTeam?: string; note?: string };
export type ResultadoLegado = JuegoLegado & { game1?: JuegoLegado; game2?: JuegoLegado; timestamp?: string };
export type NoticiaLegado = { id: string; image: string; date: string; title: string; content: string };
export type FotoLegado = { id: number; url: string; title: string; date: string };
export type PatrocinadorLegado = { nombre: string; enlace: string; logo: string };

export type DatosLegado = {
  equipos: EquipoLegado[];
  rol: PartidoLegado[];
  contacto: { email: string; phone: string; location: string };
  resultados: Record<string, ResultadoLegado>;
  noticias: NoticiaLegado[];
  fotos: FotoLegado[];
  patrocinadores: PatrocinadorLegado[];
  facebook: string | null;
};

export const CARPETA_LEGADO = 'legado';

const CORRECCIONES_EQUIPO: Record<string, string> = { 'Venados de Batayaui': 'Venados de Batayaqui' };

const CORRECCIONES_PATROCINADOR: Record<string, string> = {
  'Mariscos el Sierreño': 'Mariscos El Sierreño',
  'El Profe callitos y ceviches de lobina': 'El Profe: callitos y ceviches de lobina',
};

export const ALBUMES: Record<string, { titulo: string; fecha: string | null }> = {
  inauguracion: { titulo: 'Inauguración de la temporada 2025-2026', fecha: null },
  'juego-estrellas': { titulo: 'Juego de Estrellas 2026', fecha: '2026-01-18' },
};

export const NOTICIA_ESTRELLAS_SLUG = 'juego-de-estrellas-2026';
export const EVENTO_ESTRELLAS_TITULO = 'Juego de Estrellas 2026';

export const ROSTERS_ESTRELLAS = [
  { ruta: 'assets/images/news/roster-zona-oriente.jpg', pie: 'Róster de la Zona Oriente' },
  { ruta: 'assets/images/news/roster-zona-poniente.jpg', pie: 'Róster de la Zona Poniente' },
];

export function corregirEquipo(nombre: string) {
  return CORRECCIONES_EQUIPO[nombre] ?? nombre;
}

export function corregirPatrocinador(nombre: string) {
  return CORRECCIONES_PATROCINADOR[nombre] ?? nombre;
}

export function carpetaDeFoto(url: string) {
  return url.split('/').at(-2) ?? '';
}

export function leerLegado(carpeta: string): DatosLegado {
  const contexto: Record<string, unknown> = {};
  vm.runInNewContext(
    `${readFileSync(join(carpeta, 'js/data.js'), 'utf8')}\nglobalThis.__datos = { teams, schedule, contactInfo };`,
    contexto,
  );
  const datos = contexto.__datos as { teams: EquipoLegado[]; schedule: PartidoLegado[]; contactInfo: DatosLegado['contacto'] };
  const portada = readFileSync(join(carpeta, 'index.html'), 'utf8');
  const patrocinadores = [...portada.matchAll(/<a href="([^"]+)"[^>]*class="sponsor-card"[\s\S]*?<img src="([^"]+)" alt="([^"]+)"/g)].map(
    (m) => ({ enlace: m[1], logo: m[2], nombre: m[3] }),
  );
  const facebook = portada.match(/data-href="(https:\/\/www\.facebook\.com\/[^"]+)"/)?.[1] ?? null;
  const leerJson = <T>(ruta: string) => JSON.parse(readFileSync(join(carpeta, ruta), 'utf8')) as T;
  return {
    equipos: datos.teams,
    rol: datos.schedule,
    contacto: datos.contactInfo,
    resultados: leerJson<Record<string, ResultadoLegado>>('data/results.json'),
    noticias: leerJson<NoticiaLegado[]>('data/news.json'),
    fotos: leerJson<FotoLegado[]>('data/gallery.json'),
    patrocinadores,
    facebook,
  };
}

export function juegosDeResultado(resultado: ResultadoLegado | undefined): JuegoLegado[] {
  if (!resultado) return [];
  if (resultado.game1 && resultado.game2) return [resultado.game1, resultado.game2];
  return [resultado];
}

export type JuegoConvertido = {
  numero: number;
  estado: 'programado' | 'jugado' | 'forfeit';
  carrerasLocal: number | null;
  carrerasVisitante: number | null;
  forfeitPierde: string | null;
};

export type EncuentroConvertido = {
  jornada: number;
  orden: number;
  local: string;
  visitante: string;
  juegos: JuegoConvertido[];
};

export function convertirEncuentros(datos: DatosLegado, juegosPorEncuentro: number): EncuentroConvertido[] {
  const ordenPorJornada = new Map<number, number>();
  return datos.rol
    .filter((p): p is Required<Pick<PartidoLegado, 'homeTeam' | 'awayTeam'>> & PartidoLegado => Boolean(p.homeTeam && p.awayTeam))
    .map((p) => {
      const orden = ordenPorJornada.get(p.jornada) ?? 0;
      ordenPorJornada.set(p.jornada, orden + 1);
      const legados = juegosDeResultado(datos.resultados[`j${p.jornada}_${p.homeTeam}_${p.awayTeam}`]);
      const juegos: JuegoConvertido[] =
        legados.length === 0
          ? Array.from({ length: juegosPorEncuentro }, (_, i) => ({
              numero: i + 1,
              estado: 'programado' as const,
              carrerasLocal: null,
              carrerasVisitante: null,
              forfeitPierde: null,
            }))
          : legados.map((g, i) =>
              g.forfeit
                ? { numero: i + 1, estado: 'forfeit' as const, carrerasLocal: null, carrerasVisitante: null, forfeitPierde: g.forfeitTeam ?? null }
                : {
                    numero: i + 1,
                    estado: 'jugado' as const,
                    carrerasLocal: Number(g.homeScore),
                    carrerasVisitante: Number(g.awayScore),
                    forfeitPierde: null,
                  },
            );
      return { jornada: p.jornada, orden, local: p.homeTeam, visitante: p.awayTeam, juegos };
    });
}

export type FilaSitioAnterior ={ equipo: string; jj: number; jg: number; jp: number; je: number; ave: string; dif: number };

export function posicionesSitioAnterior(datos: DatosLegado): FilaSitioAnterior[] {
  const tabla = new Map(datos.equipos.map((e) => [e.name, { equipo: e.name, jj: 0, jg: 0, jp: 0, je: 0, cf: 0, cc: 0 }]));
  for (const [clave, resultado] of Object.entries(datos.resultados)) {
    const partes = clave.split('_');
    const local = tabla.get(partes.slice(1, -1).join('_'));
    const visita = tabla.get(partes[partes.length - 1]);
    if (!local || !visita) continue;
    for (const juego of juegosDeResultado(resultado)) {
      if (juego.forfeit) {
        local.jj++;
        visita.jj++;
        const [gana, pierde] = juego.forfeitTeam === local.equipo ? [visita, local] : [local, visita];
        gana.jg++;
        pierde.jp++;
        continue;
      }
      if (juego.homeScore === undefined || juego.awayScore === undefined || juego.homeScore === '' || juego.awayScore === '') continue;
      const l = Number(juego.homeScore);
      const v = Number(juego.awayScore);
      local.jj++;
      visita.jj++;
      local.cf += l;
      local.cc += v;
      visita.cf += v;
      visita.cc += l;
      if (l > v) {
        local.jg++;
        visita.jp++;
      } else if (v > l) {
        visita.jg++;
        local.jp++;
      } else {
        local.je++;
        visita.je++;
      }
    }
  }
  const filas = [...tabla.values()].map((t) => ({
    equipo: t.equipo,
    jj: t.jj,
    jg: t.jg,
    jp: t.jp,
    je: t.je,
    ave: t.jj - t.je > 0 ? (t.jg / (t.jj - t.je)).toFixed(3) : '.000',
    dif: t.cf - t.cc,
  }));
  filas.sort((a, b) => parseFloat(b.ave) - parseFloat(a.ave) || b.dif - a.dif);
  return filas;
}
