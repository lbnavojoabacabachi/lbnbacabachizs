import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

for (const archivo of ['.env.local', '.env']) {
  if (existsSync(archivo)) process.loadEnvFile(archivo);
}

const TEMPORADA = { nombre: '2025-2026', inicio: '2025-10-25', primeraVuelta: 9 };
const NOMBRES_CORTOS: Record<string, string> = {
  Astros: 'AST',
  'Venados de Batayaqui': 'VEN',
  'Guerreros de Chente Meza': 'GUE',
  'Indios de Chirajobampo': 'IND',
  'Chicos de Sinahuiza': 'CHI',
  'Rancheros de Buayums': 'RAN',
  'Tigrillos de Bacabachi': 'TIG',
  'Rojos de Bacabachi': 'ROJ',
  Saneal: 'SAN',
};
const CATEGORIAS = { LOCAL: 'local', NOVATO: 'novato', 'NUEVO VALOR': 'nuevo_valor', REFUERZO: 'refuerzo' } as const;
const PUESTOS = { delegado: 'delegado', manager: 'manager', coach: 'coach' } as const;
const NOTAS_JORNADA: Record<number, string> = { 11: 'Recorrida por el Juego de Estrellas.' };
const JUEGO_ESTRELLAS = {
  titulo: 'Juego de Estrellas de la temporada 2025-2026',
  resumen: 'Domingo 18 de enero de 2026, 10:00 a. m., en el Estadio La Tribu Park.',
  cuerpo:
    '¡No te pierdas el gran Juego de Estrellas! Domingo 18 de enero de 2026 a las 10:00 a. m. en el Estadio La Tribu Park: Zona Poniente vs. Zona Oriente. Incluye pruebas de campo (correr las bases, tiro del cátcher y tiro del fílder), Home Run Derby y el emocionante Juego de Zonas. ¡Ven a apoyar a tus equipos favoritos! Transmisión en vivo por Polo Sports: facebook.com/poloonlive',
  publicadaEn: new Date('2026-01-18T00:00:00-07:00'),
  inicio: new Date('2026-01-18T10:00:00-07:00'),
  sede: 'Estadio La Tribu Park',
  descripcion: 'Zona Poniente vs. Zona Oriente. Pruebas de campo, Home Run Derby y Juego de Zonas. Transmisión en vivo por Polo Sports.',
};

function fechaValida(texto: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return null;
  return new Date(`${texto}T00:00:00Z`).toISOString().slice(0, 10) === texto ? texto : null;
}

function pobladoDe(nombre: string) {
  const indice = nombre.indexOf(' de ');
  return indice >= 0 ? nombre.slice(indice + 4) : null;
}

async function principal() {
  const reemplazar = process.argv.includes('--reemplazar');
  const { count } = await import('drizzle-orm');
  const { db } = await import('@/db/conexion');
  const e = await import('@/db/esquema');
  const { crearSlug, normalizarNombre } = await import('@/lib/nombres');
  const { formatearAve } = await import('@/lib/posiciones');
  const { obtenerPosiciones } = await import('@/lib/consultas/posiciones');
  const { registrarEnBitacora } = await import('@/lib/bitacora');
  const {
    ALBUMES,
    CARPETA_LEGADO,
    EVENTO_ESTRELLAS_TITULO,
    NOTICIA_ESTRELLAS_SLUG,
    carpetaDeFoto,
    convertirEncuentros,
    corregirEquipo,
    corregirPatrocinador,
    leerLegado,
    posicionesSitioAnterior,
  } = await import('./lib/legado');

  const datos = leerLegado(CARPETA_LEGADO);
  const cambiosNombre: string[] = [];
  const dudas: string[] = [];
  const avisos: string[] = [];

  const [{ total }] = await db.select({ total: count() }).from(e.temporadas);
  if (total > 0 && !reemplazar) {
    console.error('La base ya tiene datos de la liga. Usa --reemplazar para borrarlos e importar de nuevo.');
    process.exit(1);
  }

  const encuentrosLegado = convertirEncuentros(datos, 2);
  const fechas = datos.rol.map((p) => p.date).filter((f): f is string => Boolean(f)).sort();

  const resumen = await db.transaction(async (tx) => {
    if (reemplazar) {
      await tx.delete(e.temporadas);
      await tx.delete(e.jugadores);
      await tx.delete(e.equipos);
      await tx.delete(e.noticias);
      await tx.delete(e.eventos);
      await tx.delete(e.albumes);
      await tx.delete(e.patrocinadores);
      await tx.delete(e.configuracion);
    }

    const [temporada] = await tx
      .insert(e.temporadas)
      .values({ nombre: TEMPORADA.nombre, inicio: TEMPORADA.inicio, fin: fechas.at(-1) ?? null, estado: 'regular', vigente: true })
      .returning({ id: e.temporadas.id });
    await tx.insert(e.reglasTemporada).values({ temporadaId: temporada.id });

    const idEquipo = new Map<string, number>();
    let jugadores = 0;
    let fechasNacimiento = 0;
    let cuerpoTecnico = 0;
    for (const equipo of datos.equipos) {
      const nombre = corregirEquipo(equipo.name);
      if (nombre !== equipo.name) cambiosNombre.push(`Equipo: ${equipo.name} | ${nombre}`);
      const [fila] = await tx
        .insert(e.equipos)
        .values({ nombre, nombreCorto: NOMBRES_CORTOS[nombre], slug: crearSlug(nombre), poblado: pobladoDe(nombre), colorPrincipal: equipo.color })
        .returning({ id: e.equipos.id });
      idEquipo.set(equipo.name, fila.id);
      await tx.insert(e.temporadaEquipos).values({ temporadaId: temporada.id, equipoId: fila.id });

      for (const jugador of equipo.roster) {
        const normalizado = normalizarNombre(jugador.name);
        cambiosNombre.push(`${jugador.name} | ${normalizado.nombre}`);
        for (const d of normalizado.dudas) dudas.push(`${normalizado.nombre} (${nombre}): ${d.palabra}, ${d.nota}`);
        const [nuevo] = await tx.insert(e.jugadores).values({ nombre: normalizado.nombre }).returning({ id: e.jugadores.id });
        jugadores++;
        if (jugador.birthDate) {
          const fecha = fechaValida(jugador.birthDate);
          if (fecha) {
            await tx.insert(e.datosPrivadosJugador).values({ jugadorId: nuevo.id, fechaNacimiento: fecha });
            fechasNacimiento++;
          } else {
            avisos.push(`Fecha de nacimiento inválida (${jugador.birthDate}) de ${normalizado.nombre}, ${nombre}: no se guardó.`);
          }
        }
        const categoria = CATEGORIAS[jugador.category as keyof typeof CATEGORIAS];
        if (!categoria) avisos.push(`Categoría desconocida "${jugador.category}" de ${normalizado.nombre}: quedó como local.`);
        await tx.insert(e.plantillas).values({
          temporadaId: temporada.id,
          equipoId: fila.id,
          jugadorId: nuevo.id,
          numero: jugador.number,
          categoria: categoria ?? 'local',
        });
      }

      for (const [puesto, persona] of Object.entries(equipo.staff)) {
        if (!persona) continue;
        const normalizado = normalizarNombre(persona);
        cambiosNombre.push(`${persona} | ${normalizado.nombre}`);
        for (const d of normalizado.dudas) dudas.push(`${normalizado.nombre} (${puesto}, ${nombre}): ${d.palabra}, ${d.nota}`);
        await tx.insert(e.cuerpoTecnico).values({
          temporadaId: temporada.id,
          equipoId: fila.id,
          puesto: PUESTOS[puesto as keyof typeof PUESTOS],
          nombre: normalizado.nombre,
        });
        cuerpoTecnico++;
      }
    }

    const idDe = (nombreLegado: string) => {
      const id = idEquipo.get(nombreLegado);
      if (id === undefined) throw new Error(`Equipo desconocido en el rol: ${nombreLegado}`);
      return id;
    };

    const numerosJornada = [...new Set(datos.rol.map((p) => p.jornada))].sort((a, b) => a - b);
    const idJornada = new Map<number, number>();
    for (const numero of numerosJornada) {
      const partidos = datos.rol.filter((p) => p.jornada === numero && p.homeTeam);
      const descansa = datos.rol.find((p) => p.jornada === numero && p.descansa)?.descansa;
      const [jornada] = await tx
        .insert(e.jornadas)
        .values({
          temporadaId: temporada.id,
          numero,
          fecha: partidos[0]?.date ?? null,
          vuelta: numero <= TEMPORADA.primeraVuelta ? 1 : 2,
          equipoDescansaId: descansa ? idDe(descansa) : null,
          nota: NOTAS_JORNADA[numero] ?? null,
        })
        .returning({ id: e.jornadas.id });
      idJornada.set(numero, jornada.id);
    }

    let jugados = 0;
    let forfeits = 0;
    let programados = 0;
    const jornadasUnJuego = new Set<number>();
    for (const encuentro of encuentrosLegado) {
      const [nuevo] = await tx
        .insert(e.encuentros)
        .values({
          jornadaId: idJornada.get(encuentro.jornada)!,
          localId: idDe(encuentro.local),
          visitanteId: idDe(encuentro.visitante),
          orden: encuentro.orden,
        })
        .returning({ id: e.encuentros.id });
      if (encuentro.juegos.length === 1) jornadasUnJuego.add(encuentro.jornada);
      for (const juego of encuentro.juegos) {
        await tx.insert(e.juegos).values({
          encuentroId: nuevo.id,
          numero: juego.numero,
          estado: juego.estado,
          carrerasLocal: juego.carrerasLocal,
          carrerasVisitante: juego.carrerasVisitante,
          forfeitPierdeId: juego.forfeitPierde ? idDe(juego.forfeitPierde) : null,
        });
        if (juego.estado === 'jugado') jugados++;
        else if (juego.estado === 'forfeit') forfeits++;
        else programados++;
      }
    }
    for (const numero of jornadasUnJuego) {
      avisos.push(`La jornada ${numero} tiene un solo juego por encuentro en el sitio anterior; se importó así.`);
    }

    await tx.insert(e.noticias).values({
      titulo: JUEGO_ESTRELLAS.titulo,
      slug: NOTICIA_ESTRELLAS_SLUG,
      resumen: JUEGO_ESTRELLAS.resumen,
      cuerpo: JUEGO_ESTRELLAS.cuerpo,
      publicadaEn: JUEGO_ESTRELLAS.publicadaEn,
    });
    await tx.insert(e.eventos).values({
      titulo: EVENTO_ESTRELLAS_TITULO,
      descripcion: JUEGO_ESTRELLAS.descripcion,
      inicio: JUEGO_ESTRELLAS.inicio,
      sede: JUEGO_ESTRELLAS.sede,
    });

    const carpetasFotos = [...new Set(datos.fotos.map((f) => carpetaDeFoto(f.url)))];
    for (const carpeta of carpetasFotos) {
      const album = ALBUMES[carpeta];
      if (!album) {
        avisos.push(`Álbum sin título conocido (${carpeta}): no se importó.`);
        continue;
      }
      await tx.insert(e.albumes).values({ titulo: album.titulo, slug: crearSlug(album.titulo), fecha: album.fecha, publicado: false });
      if (!album.fecha) avisos.push(`El álbum "${album.titulo}" no tiene fecha real (el sitio anterior decía 2025-01-01).`);
    }

    for (const [orden, p] of datos.patrocinadores.entries()) {
      await tx.insert(e.patrocinadores).values({ nombre: corregirPatrocinador(p.nombre), enlace: p.enlace, orden });
    }

    await tx.insert(e.configuracion).values({
      id: 1,
      telefonoContacto: datos.contacto.phone,
      direccion: datos.contacto.location.replace('los pinos', 'Los Pinos'),
      facebook: datos.facebook,
    });
    avisos.push(`No se importó el correo ${datos.contacto.email}: el dominio no existe. Falta el contacto real (D3).`);
    avisos.push('No se importó el horario de atención: parece texto de relleno.');

    return {
      temporadaId: temporada.id,
      equipos: idEquipo.size,
      jugadores,
      fechasNacimiento,
      cuerpoTecnico,
      jornadas: numerosJornada.length,
      encuentros: encuentrosLegado.length,
      jugados,
      forfeits,
      programados,
      albumes: carpetasFotos.length,
      patrocinadores: datos.patrocinadores.length,
    };
  });

  const nueva = await obtenerPosiciones(resumen.temporadaId);
  const anterior = posicionesSitioAnterior(datos);
  const comparacion = anterior.map((a, i) => {
    const n = nueva[i];
    const iguales =
      n !== undefined &&
      corregirEquipo(a.equipo) === n.nombre &&
      a.jj === n.jj &&
      a.jg === n.jg &&
      a.jp === n.jp &&
      a.je === n.je &&
      a.dif === n.dif &&
      Number(a.ave).toFixed(3) === n.ave.toFixed(3);
    return { iguales, fila: `| ${i + 1} | ${corregirEquipo(a.equipo)} | ${a.jj} | ${a.jg} | ${a.jp} | ${a.je} | ${a.ave} | ${n ? `${n.nombre} | ${n.jj} | ${n.jg} | ${n.jp} | ${n.je} | ${formatearAve(n.ave)}` : '| | | | | '} | ${iguales ? 'igual' : 'DISTINTA'} |` };
  });
  const tablaIgual = comparacion.every((c) => c.iguales) && anterior.length === nueva.length;

  await registrarEnBitacora({
    usuarioId: null,
    accion: 'migrar',
    entidad: 'sitio_anterior',
    resumen: `Datos del sitio anterior importados: ${resumen.equipos} equipos, ${resumen.jugadores} jugadores, ${resumen.jornadas} jornadas`,
    cambios: resumen,
  });

  const reporte = [
    `# Migración del sitio anterior (${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC)`,
    '',
    '## Resumen',
    '',
    `- Temporada ${TEMPORADA.nombre}, ${resumen.equipos} equipos, ${resumen.jugadores} jugadores (${resumen.fechasNacimiento} con fecha de nacimiento, solo visible en el panel), ${resumen.cuerpoTecnico} personas de cuerpo técnico.`,
    `- ${resumen.jornadas} jornadas, ${resumen.encuentros} encuentros: ${resumen.jugados} juegos jugados, ${resumen.forfeits} forfeits y ${resumen.programados} programados.`,
    `- 1 noticia, 1 evento, ${resumen.albumes} álbumes (sin publicar hasta subir sus fotos en la fase 3) y ${resumen.patrocinadores} patrocinadores.`,
    `- Tabla de posiciones: ${tablaIgual ? 'coincide fila por fila con la del sitio anterior' : 'NO coincide con la del sitio anterior'}.`,
    '',
    '## Tabla de posiciones',
    '',
    '| # | Sitio anterior | JJ | JG | JP | JE | AVE | Sitio nuevo | JJ | JG | JP | JE | AVE | |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...comparacion.map((c) => c.fila),
    '',
    '## Para confirmar con los delegados',
    '',
    ...(dudas.length ? dudas.map((d) => `- ${d}`) : ['- Nada.']),
    '',
    '## Avisos',
    '',
    ...avisos.map((a) => `- ${a}`),
    '',
    '## Nombres (antes | después)',
    '',
    ...cambiosNombre.map((c) => `- ${c}`),
    '',
  ].join('\n');
  mkdirSync('reportes', { recursive: true });
  const ruta = join('reportes', 'migracion-legado.md');
  writeFileSync(ruta, reporte);

  console.log(`Importado: ${resumen.equipos} equipos, ${resumen.jugadores} jugadores, ${resumen.jornadas} jornadas, ${resumen.jugados} jugados, ${resumen.forfeits} forfeits, ${resumen.programados} programados.`);
  console.log(`Tabla de posiciones: ${tablaIgual ? 'coincide con el sitio anterior' : 'NO coincide con el sitio anterior'}.`);
  console.log(`${dudas.length} nombre(s) para confirmar y ${avisos.length} aviso(s). Reporte en ${ruta}.`);
  process.exit(tablaIgual ? 0 : 1);
}

principal().catch((error) => {
  console.error(error);
  process.exit(1);
});
