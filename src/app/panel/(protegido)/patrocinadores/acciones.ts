'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/conexion';
import { configuracion, documentos, patrocinadores } from '@/db/esquema';
import { borrarArchivos } from '@/lib/imagenes/almacen';
import { borrarImagenesSinUso } from '@/lib/imagenes/limpiar';
import { accionConFormulario, accionDirecta, anotar, ErrorPanel } from '@/lib/panel/acciones';
import { casilla, correoOpcional, enlaceOpcional, entero, id, idOpcional, textoOpcional, textoRequerido } from '@/lib/panel/campos';

const esquemaPatrocinador = z.object({
  id: idOpcional,
  nombre: textoRequerido('el nombre', 100),
  enlace: enlaceOpcional,
  logoId: idOpcional,
  orden: entero(0, 999, 'el orden'),
  activo: casilla,
});

export const guardarPatrocinador = accionConFormulario(esquemaPatrocinador, async (datos, contexto) => {
  const valores = { nombre: datos.nombre, enlace: datos.enlace, logoId: datos.logoId, orden: datos.orden, activo: datos.activo };
  if (datos.id === null) {
    const [creado] = await db.insert(patrocinadores).values(valores).returning();
    await anotar(contexto, 'crear', 'patrocinador', creado.id, `Agregó al patrocinador ${creado.nombre}`);
    return 'Patrocinador agregado.';
  }
  const [actual] = await db.select().from(patrocinadores).where(eq(patrocinadores.id, datos.id));
  if (!actual) throw new ErrorPanel('El patrocinador ya no existe.');
  await db.update(patrocinadores).set(valores).where(eq(patrocinadores.id, datos.id));
  if (actual.logoId && actual.logoId !== datos.logoId) await borrarImagenesSinUso([actual.logoId]);
  await anotar(contexto, 'editar', 'patrocinador', datos.id, `Editó al patrocinador ${datos.nombre}`);
  return 'Patrocinador guardado.';
});

export async function eliminarPatrocinador(patrocinadorId: number) {
  return accionDirecta(async (contexto) => {
    const valor = id.parse(patrocinadorId);
    const [actual] = await db.select().from(patrocinadores).where(eq(patrocinadores.id, valor));
    if (!actual) throw new ErrorPanel('El patrocinador ya no existe.');
    await db.delete(patrocinadores).where(eq(patrocinadores.id, valor));
    if (actual.logoId) await borrarImagenesSinUso([actual.logoId]);
    await anotar(contexto, 'eliminar', 'patrocinador', valor, `Quitó al patrocinador ${actual.nombre}`);
    return 'Patrocinador eliminado.';
  });
}

const esquemaDocumento = z.object({ id, titulo: textoRequerido('el título', 140), orden: entero(0, 999, 'el orden'), publicado: casilla });

export const guardarDocumento = accionConFormulario(esquemaDocumento, async (datos, contexto) => {
  const [actual] = await db.select().from(documentos).where(eq(documentos.id, datos.id));
  if (!actual) throw new ErrorPanel('El documento ya no existe.');
  await db
    .update(documentos)
    .set({ titulo: datos.titulo, orden: datos.orden, publicadoEn: datos.publicado ? (actual.publicadoEn ?? new Date()) : null })
    .where(eq(documentos.id, datos.id));
  await anotar(contexto, 'editar', 'documento', datos.id, `Editó el documento «${datos.titulo}»`);
  return 'Documento guardado.';
});

export async function eliminarDocumento(documentoId: number) {
  return accionDirecta(async (contexto) => {
    const valor = id.parse(documentoId);
    const [actual] = await db.select().from(documentos).where(eq(documentos.id, valor));
    if (!actual) throw new ErrorPanel('El documento ya no existe.');
    await db.delete(documentos).where(eq(documentos.id, valor));
    await borrarArchivos([actual.url]).catch(() => undefined);
    await anotar(contexto, 'eliminar', 'documento', valor, `Eliminó el documento «${actual.titulo}»`);
    return 'Documento eliminado.';
  });
}

const telefono = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
  z
    .string()
    .trim()
    .regex(/^[\d\s()+-]{7,20}$/, 'Escribe el teléfono con números, por ejemplo (642) 426-9561.')
    .nullable()
    .default(null),
);

const esquemaContacto = z.object({
  telefonoContacto: telefono,
  correoContacto: correoOpcional,
  direccion: textoOpcional(200),
  horario: textoOpcional(200),
  facebook: enlaceOpcional,
  instagram: enlaceOpcional,
  youtube: enlaceOpcional,
  tiktok: enlaceOpcional,
});

export const guardarContacto = accionConFormulario(esquemaContacto, async (datos, contexto) => {
  await db.insert(configuracion).values({ id: 1, ...datos }).onConflictDoUpdate({ target: configuracion.id, set: datos });
  await anotar(contexto, 'editar', 'configuracion', 1, 'Cambió los datos de contacto y perfiles', datos);
  return 'Contacto guardado. Ya se ve en el pie de página y en Contacto.';
});
