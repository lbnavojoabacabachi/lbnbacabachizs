import { z } from 'zod';

const vacioANulo = (valor: unknown) => (typeof valor === 'string' && valor.trim() === '' ? null : valor);

export const textoRequerido = (nombre: string, maximo = 200) =>
  z
    .string({ error: `Escribe ${nombre}.` })
    .trim()
    .min(1, `Escribe ${nombre}.`)
    .max(maximo, `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} puede tener hasta ${maximo} caracteres.`);

export const textoOpcional = (maximo = 500) =>
  z.preprocess(vacioANulo, z.string().trim().max(maximo, `Puede tener hasta ${maximo} caracteres.`).nullable().default(null));

export const casilla = z.preprocess((valor) => valor === 'on' || valor === 'true', z.boolean());

export const entero = (minimo: number, maximo: number, nombre: string) =>
  z.coerce
    .number({ error: `Escribe ${nombre} con números.` })
    .int(`Escribe ${nombre} sin decimales.`)
    .min(minimo, `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} no puede ser menor que ${minimo}.`)
    .max(maximo, `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} no puede ser mayor que ${maximo}.`);

export const enteroOpcional = (minimo: number, maximo: number, nombre: string) =>
  z.preprocess(vacioANulo, entero(minimo, maximo, nombre).nullable().default(null));

export const id = z.coerce.number().int().positive();

export const idOpcional = z.preprocess(vacioANulo, id.nullable().default(null));

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

function fechaValida(texto: string) {
  if (!FECHA.test(texto)) return false;
  const [a, m, d] = texto.split('-').map(Number);
  const fecha = new Date(Date.UTC(a, m - 1, d));
  return fecha.getUTCFullYear() === a && fecha.getUTCMonth() === m - 1 && fecha.getUTCDate() === d;
}

export const fecha = (nombre = 'la fecha') =>
  z.string({ error: `Escribe ${nombre}.` }).refine(fechaValida, `Escribe ${nombre} completa (día, mes y año).`);

export const fechaOpcional = (nombre = 'la fecha') => z.preprocess(vacioANulo, fecha(nombre).nullable().default(null));

export const horaRequerida = z
  .string({ error: 'Escribe la hora.' })
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Escribe la hora, por ejemplo 10:30.');

export const hora = z.preprocess(vacioANulo, z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Escribe la hora como 10:30.').nullable().default(null));

export const enlaceOpcional = z.preprocess(
  vacioANulo,
  z
    .string()
    .trim()
    .url('Pega el enlace completo, empezando con https://')
    .refine((u) => u.startsWith('https://'), 'El enlace debe empezar con https://')
    .max(500)
    .nullable()
    .default(null),
);

export const correoOpcional = z.preprocess(vacioANulo, z.string().trim().email('Escribe un correo válido.').max(200).nullable().default(null));

export function instanteEnSonora(fecha: string, hora: string | null) {
  return new Date(`${fecha}T${hora ?? '00:00'}:00-07:00`);
}

export function leerFormulario(formulario: FormData) {
  const datos: Record<string, string | string[]> = {};
  for (const [clave, valor] of formulario.entries()) {
    if (typeof valor !== 'string') continue;
    const previo = datos[clave];
    datos[clave] = previo === undefined ? valor : Array.isArray(previo) ? [...previo, valor] : [previo, valor];
  }
  return datos;
}
