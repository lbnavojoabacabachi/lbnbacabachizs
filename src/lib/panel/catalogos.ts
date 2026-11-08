export const CRITERIOS_DESEMPATE = [
  { valor: 'ave', texto: 'Promedio (AVE)' },
  { valor: 'diferencia_carreras', texto: 'Diferencia de carreras' },
  { valor: 'carreras_favor', texto: 'Más carreras a favor' },
  { valor: 'carreras_contra', texto: 'Menos carreras en contra' },
  { valor: 'ganados', texto: 'Más juegos ganados' },
] as const;

export const CRITERIOS = CRITERIOS_DESEMPATE.map((c) => c.valor) as [
  (typeof CRITERIOS_DESEMPATE)[number]['valor'],
  ...(typeof CRITERIOS_DESEMPATE)[number]['valor'][],
];

export const CATEGORIAS = [
  { valor: 'local', texto: 'Local' },
  { valor: 'novato', texto: 'Novato' },
  { valor: 'nuevo_valor', texto: 'Nuevo valor' },
  { valor: 'refuerzo', texto: 'Refuerzo' },
] as const;

export const PUESTOS = [
  { valor: 'delegado', texto: 'Delegado' },
  { valor: 'manager', texto: 'Mánager' },
  { valor: 'coach', texto: 'Coach' },
] as const;

export const REDES = [
  { valor: 'facebook', texto: 'Facebook' },
  { valor: 'instagram', texto: 'Instagram' },
  { valor: 'youtube', texto: 'YouTube' },
  { valor: 'tiktok', texto: 'TikTok' },
  { valor: 'x', texto: 'X' },
] as const;
