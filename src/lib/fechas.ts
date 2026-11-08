export const ZONA_HORARIA = 'America/Hermosillo';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const enSonora = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA_HORARIA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function partesDeFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const diaSemana = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
  return { anio, mes, dia, diaSemana };
}

export function partesEnSonora(instante: Date) {
  const partes = Object.fromEntries(enSonora.formatToParts(instante).map((p) => [p.type, p.value]));
  return {
    fecha: `${partes.year}-${partes.month}-${partes.day}`,
    hora: Number(partes.hour),
    minuto: Number(partes.minute),
  };
}

export function hoyEnSonora(ahora = new Date()) {
  return partesEnSonora(ahora).fecha;
}

export function formatearFecha(fecha: string, { diaSemana = true }: { diaSemana?: boolean } = {}) {
  const p = partesDeFecha(fecha);
  const base = `${p.dia} de ${MESES[p.mes - 1]} de ${p.anio}`;
  return diaSemana ? `${DIAS[p.diaSemana]} ${base}` : base;
}

export function formatearFechaCorta(fecha: string, { anio = true }: { anio?: boolean } = {}) {
  const p = partesDeFecha(fecha);
  return anio ? `${p.dia} ${MESES_CORTOS[p.mes - 1]} ${p.anio}` : `${p.dia} ${MESES_CORTOS[p.mes - 1]}`;
}

export function formatearHora(hora: number, minuto: number) {
  const sufijo = hora < 12 ? 'a. m.' : 'p. m.';
  const hora12 = hora % 12 === 0 ? 12 : hora % 12;
  return `${hora12}:${String(minuto).padStart(2, '0')} ${sufijo}`;
}

export function formatearHoraSql(hora: string) {
  const [h, m] = hora.split(':').map(Number);
  return formatearHora(h, m);
}

export function formatearInstante(instante: Date, { diaSemana = true }: { diaSemana?: boolean } = {}) {
  const p = partesEnSonora(instante);
  return `${formatearFecha(p.fecha, { diaSemana })}, ${formatearHora(p.hora, p.minuto)}`;
}

export function capitalizar(texto: string) {
  return texto.charAt(0).toLocaleUpperCase('es-MX') + texto.slice(1);
}
