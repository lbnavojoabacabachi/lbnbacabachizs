import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

for (const archivo of ['.env.local', '.env']) {
  if (existsSync(archivo)) process.loadEnvFile(archivo);
}

const EXTENSIONES_IMAGEN = /\.(jpe?g|png|webp|gif)$/i;

function pesoCarpeta(carpeta: string): { bytes: number; archivos: number } {
  let bytes = 0;
  let archivos = 0;
  for (const entrada of readdirSync(carpeta, { withFileTypes: true })) {
    const ruta = join(carpeta, entrada.name);
    if (entrada.isDirectory()) {
      const sub = pesoCarpeta(ruta);
      bytes += sub.bytes;
      archivos += sub.archivos;
    } else if (EXTENSIONES_IMAGEN.test(entrada.name)) {
      bytes += statSync(ruta).size;
      archivos++;
    }
  }
  return { bytes, archivos };
}

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

async function principal() {
  const reemplazar = process.argv.includes('--reemplazar');
  const { createHash } = await import('node:crypto');
  const { readFile } = await import('node:fs/promises');
  const { count, eq, isNotNull } = await import('drizzle-orm');
  const sharp = (await import('sharp')).default;
  const { db } = await import('@/db/conexion');
  const e = await import('@/db/esquema');
  const { crearSlug } = await import('@/lib/nombres');
  const { PREFIJO_LOCAL, borrarArchivos, rutaLocalSegura, usaBlob } = await import('@/lib/imagenes/almacen');
  const { registrarImagen } = await import('@/lib/imagenes/registrar');
  const { registrarEnBitacora } = await import('@/lib/bitacora');
  const {
    ALBUMES,
    CARPETA_LEGADO,
    EVENTO_ESTRELLAS_TITULO,
    NOTICIA_ESTRELLAS_SLUG,
    ROSTERS_ESTRELLAS,
    carpetaDeFoto,
    corregirEquipo,
    corregirPatrocinador,
    leerLegado,
  } = await import('./lib/legado');
  type TipoImagen = Parameters<typeof registrarImagen>[0]['tipo'];
  type Registrada = Awaited<ReturnType<typeof registrarImagen>>;

  const datos = leerLegado(CARPETA_LEGADO);
  const [{ temporadas }] = await db.select({ temporadas: count() }).from(e.temporadas);
  if (temporadas === 0) {
    console.error('No hay datos de la liga. Corre primero npm run migrar:legado.');
    process.exit(1);
  }
  const [{ existentes }] = await db.select({ existentes: count() }).from(e.imagenes);
  if (existentes > 0 && !reemplazar) {
    console.error('Ya hay imágenes en la base. Usa --reemplazar para borrarlas e importar de nuevo.');
    process.exit(1);
  }
  if (reemplazar) {
    const anteriores = await db.select({ c: e.imagenes.urlChica, m: e.imagenes.urlMediana, g: e.imagenes.urlGrande }).from(e.imagenes);
    await borrarArchivos(anteriores.flatMap((a) => [a.c, a.m, a.g]));
    await db.delete(e.imagenes);
  }

  console.log(`Destino: ${usaBlob() ? 'Vercel Blob' : `carpeta local (${PREFIJO_LOCAL})`}`);
  const porHuella = new Map<string, Registrada>();
  const resumen = { unicas: 0, duplicadas: 0, bytesOriginales: 0, bytesVariantes: 0 };
  const avisos: string[] = [];
  const detalle: string[] = [];

  async function importar(rutaRelativa: string, tipo: TipoImagen) {
    const ruta = join(CARPETA_LEGADO, rutaRelativa.replace(/^\.\.\//, ''));
    const contenido = await readFile(ruta);
    const huella = createHash('sha256').update(contenido).digest('hex');
    const previa = porHuella.get(huella);
    if (previa) {
      resumen.duplicadas++;
      return previa;
    }
    const imagen = await registrarImagen({ datos: contenido, tipo, nombreOriginal: basename(ruta), usuarioId: null });
    porHuella.set(huella, imagen);
    resumen.unicas++;
    resumen.bytesOriginales += contenido.length;
    resumen.bytesVariantes += imagen.bytesVariantes;
    detalle.push(`| ${basename(ruta)} | ${tipo} | ${mb(contenido.length)} | ${mb(imagen.bytesVariantes)} | ${imagen.ancho} × ${imagen.alto} |`);
    if (resumen.unicas % 10 === 0) console.log(`  ${resumen.unicas} imágenes optimizadas`);
    return imagen;
  }

  for (const equipo of datos.equipos) {
    const imagen = await importar(equipo.logo, 'logo');
    await db.update(e.equipos).set({ logoId: imagen.id }).where(eq(e.equipos.nombre, corregirEquipo(equipo.name)));
  }

  for (const patrocinador of datos.patrocinadores) {
    const imagen = await importar(patrocinador.logo, 'patrocinador');
    await db
      .update(e.patrocinadores)
      .set({ logoId: imagen.id })
      .where(eq(e.patrocinadores.nombre, corregirPatrocinador(patrocinador.nombre)));
  }

  for (const noticia of datos.noticias) {
    const imagen = await importar(noticia.image, 'poster');
    await db.update(e.noticias).set({ imagenId: imagen.id }).where(eq(e.noticias.slug, NOTICIA_ESTRELLAS_SLUG));
    await db.update(e.eventos).set({ posterId: imagen.id }).where(eq(e.eventos.titulo, EVENTO_ESTRELLAS_TITULO));
  }

  const albumes = await db.select({ id: e.albumes.id, slug: e.albumes.slug }).from(e.albumes);
  const idAlbum = (carpeta: string) => {
    const album = ALBUMES[carpeta];
    return album ? albumes.find((a) => a.slug === crearSlug(album.titulo))?.id : undefined;
  };
  const ordenPorAlbum = new Map<number, number>();
  const portadas = new Map<number, number>();
  const agregarAlAlbum = async (albumId: number, imagenId: number, pie: string | null, esPortada: boolean) => {
    const orden = ordenPorAlbum.get(albumId) ?? 0;
    ordenPorAlbum.set(albumId, orden + 1);
    await db.insert(e.albumFotos).values({ albumId, imagenId, pie, orden }).onConflictDoNothing();
    if (esPortada && !portadas.has(albumId)) portadas.set(albumId, imagenId);
  };

  const albumEstrellas = idAlbum('juego-estrellas');
  if (albumEstrellas) {
    for (const roster of ROSTERS_ESTRELLAS) {
      const imagen = await importar(roster.ruta, 'poster');
      await agregarAlAlbum(albumEstrellas, imagen.id, roster.pie, false);
    }
  }
  for (const foto of datos.fotos) {
    const albumId = idAlbum(carpetaDeFoto(foto.url));
    if (!albumId) {
      avisos.push(`Foto sin álbum (${foto.url}): no se importó.`);
      continue;
    }
    const imagen = await importar(foto.url, 'foto');
    await agregarAlAlbum(albumId, imagen.id, null, true);
  }
  for (const [albumId, imagenId] of portadas) {
    await db.update(e.albumes).set({ portadaId: imagenId, publicado: true }).where(eq(e.albumes.id, albumId));
  }

  avisos.push('No se importó assets/images/banner.jpg (foto de una premiación usada como fondo del banner): no se sabe de qué evento es.');
  avisos.push('Las noticias de relleno de js/data.js apuntaban a news1.jpg, news2.jpg y news3.jpg, que no existen.');

  const variantes = await db.select({ c: e.imagenes.urlChica, m: e.imagenes.urlMediana, g: e.imagenes.urlGrande }).from(e.imagenes);
  let conMetadatos = 0;
  for (const url of variantes.flatMap((v) => [v.c, v.m, v.g])) {
    const contenido = url.startsWith(PREFIJO_LOCAL)
      ? await readFile(rutaLocalSegura(url.slice(PREFIJO_LOCAL.length)))
      : Buffer.from(await (await fetch(url)).arrayBuffer());
    const meta = await sharp(contenido).metadata();
    if (meta.exif || meta.xmp || meta.iptc) conMetadatos++;
  }

  const [{ fotosEnAlbumes }] = await db.select({ fotosEnAlbumes: count() }).from(e.albumFotos);
  const [{ equiposConLogo }] = await db
    .select({ equiposConLogo: count() })
    .from(e.equipos)
    .where(isNotNull(e.equipos.logoId));
  const anterior = pesoCarpeta(join(CARPETA_LEGADO, 'assets'));

  await registrarEnBitacora({
    usuarioId: null,
    accion: 'migrar',
    entidad: 'imagenes',
    resumen: `Imágenes del sitio anterior optimizadas: ${resumen.unicas} imágenes, de ${mb(anterior.bytes)} a ${mb(resumen.bytesVariantes)}`,
    cambios: { ...resumen, archivosAnteriores: anterior.archivos, bytesAnteriores: anterior.bytes },
  });

  const reporte = [
    `# Migración de imágenes (${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC)`,
    '',
    '## Resumen',
    '',
    `- Sitio anterior: ${anterior.archivos} archivos de imagen, ${mb(anterior.bytes)}.`,
    `- Importadas: ${resumen.unicas} imágenes únicas (${mb(resumen.bytesOriginales)} de originales); ${resumen.duplicadas} referencias repetidas reutilizaron la misma imagen.`,
    `- Resultado: ${resumen.unicas * 3} archivos WebP en tres tamaños, ${mb(resumen.bytesVariantes)} en total.`,
    `- Archivos con metadatos (EXIF, XMP o IPTC): ${conMetadatos}.`,
    `- ${equiposConLogo} equipos con logotipo, ${datos.patrocinadores.length} patrocinadores con logotipo, ${fotosEnAlbumes} fotos en ${portadas.size} álbumes publicados.`,
    '',
    '## Avisos',
    '',
    ...avisos.map((a) => `- ${a}`),
    '',
    '## Detalle',
    '',
    '| Archivo | Tipo | Original | Tres tamaños | Tamaño grande |',
    '| --- | --- | --- | --- | --- |',
    ...detalle,
    '',
  ].join('\n');
  mkdirSync('reportes', { recursive: true });
  const ruta = join('reportes', 'migracion-imagenes.md');
  writeFileSync(ruta, reporte);

  console.log(`Imágenes: ${resumen.unicas} únicas. Sitio anterior ${mb(anterior.bytes)} (${anterior.archivos} archivos); ahora ${mb(resumen.bytesVariantes)} (${resumen.unicas * 3} archivos).`);
  console.log(`Archivos con metadatos: ${conMetadatos}. Fotos en álbumes: ${fotosEnAlbumes}. Reporte en ${ruta}.`);
  process.exit(conMetadatos === 0 ? 0 : 1);
}

principal().catch((error) => {
  console.error(error);
  process.exit(1);
});
