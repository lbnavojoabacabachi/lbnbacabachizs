const ACENTOS: Record<string, string> = {
  adan: 'Adán',
  adrian: 'Adrián',
  alcantar: 'Alcántar',
  alvarez: 'Álvarez',
  andres: 'Andrés',
  angel: 'Ángel',
  borbon: 'Borbón',
  borquez: 'Bórquez',
  cardenas: 'Cárdenas',
  cazares: 'Cázares',
  cesar: 'César',
  crisoforo: 'Crisóforo',
  dario: 'Darío',
  diaz: 'Díaz',
  dominguez: 'Domínguez',
  efrain: 'Efraín',
  efren: 'Efrén',
  elias: 'Elías',
  felix: 'Félix',
  fernandez: 'Fernández',
  galvez: 'Gálvez',
  garcia: 'García',
  gastelum: 'Gastélum',
  german: 'Germán',
  gomez: 'Gómez',
  gonzalez: 'González',
  gutierrez: 'Gutiérrez',
  hector: 'Héctor',
  hernan: 'Hernán',
  hernandez: 'Hernández',
  ibanez: 'Ibáñez',
  'ibañez': 'Ibáñez',
  iran: 'Irán',
  ivan: 'Iván',
  jesus: 'Jesús',
  jimenez: 'Jiménez',
  joaquin: 'Joaquín',
  jose: 'José',
  josue: 'Josué',
  julian: 'Julián',
  lopez: 'López',
  martin: 'Martín',
  martinez: 'Martínez',
  moises: 'Moisés',
  noe: 'Noé',
  oscar: 'Óscar',
  perez: 'Pérez',
  ramirez: 'Ramírez',
  ramon: 'Ramón',
  raul: 'Raúl',
  rene: 'René',
  rodriguez: 'Rodríguez',
  ruben: 'Rubén',
  sanchez: 'Sánchez',
  saul: 'Saúl',
  sebastian: 'Sebastián',
  simon: 'Simón',
  solis: 'Solís',
  tomas: 'Tomás',
  vazquez: 'Vázquez',
  victor: 'Víctor',
};

const DUDAS: Record<string, string> = {
  alegario: '¿Olegario?',
  aron: '¿Arón o Aarón?',
  aroon: '¿Aarón?',
  carto: '¿Carlos?',
  dorame: '¿Dórame?',
  heyden: 'En estadísticas aparece como Heydeen',
  issac: '¿Isaac?',
  jeol: '¿Joel?',
  mendivil: '¿Mendívil?',
};

const PARTICULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y']);

export type NombreNormalizado = {
  nombre: string;
  dudas: { palabra: string; nota: string }[];
};

function capitalizar(palabra: string) {
  return palabra.charAt(0).toLocaleUpperCase('es-MX') + palabra.slice(1);
}

function normalizarPalabra(palabra: string, indice: number) {
  const minuscula = palabra.toLocaleLowerCase('es-MX');
  if (minuscula === 'jr' || minuscula === 'jr.') return 'Jr.';
  if (/^\p{L}\.?$/u.test(minuscula)) return `${minuscula.charAt(0).toLocaleUpperCase('es-MX')}.`;
  if (indice > 0 && PARTICULAS.has(minuscula)) return minuscula;
  return ACENTOS[minuscula] ?? capitalizar(minuscula);
}

export function normalizarNombre(original: string): NombreNormalizado {
  const palabras = original.trim().split(/\s+/).filter(Boolean);
  const dudas = palabras
    .map((p) => p.toLocaleLowerCase('es-MX'))
    .filter((p) => p in DUDAS)
    .map((p) => ({ palabra: capitalizar(p), nota: DUDAS[p] }));
  return { nombre: palabras.map(normalizarPalabra).join(' '), dudas };
}

export function crearSlug(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
