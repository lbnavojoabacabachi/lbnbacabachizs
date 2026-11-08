import { describe, expect, it } from 'vitest';
import { crearSlug, normalizarNombre } from '@/lib/nombres';

describe('normalizarNombre', () => {
  it('pone mayúscula inicial y acentos conocidos', () => {
    expect(normalizarNombre('JESUS ADRIAN ACOSTA LOPEZ').nombre).toBe('Jesús Adrián Acosta López');
    expect(normalizarNombre('JUAN RAMON GASTELUM VALENZUELA').nombre).toBe('Juan Ramón Gastélum Valenzuela');
    expect(normalizarNombre('OSCAR VEGA').nombre).toBe('Óscar Vega');
  });

  it('respeta la ñ, las partículas y las iniciales', () => {
    expect(normalizarNombre('JESUS FRANCISCO PIÑA YOCUPICIO').nombre).toBe('Jesús Francisco Piña Yocupicio');
    expect(normalizarNombre('JUAN DE JESUS ALCANTAR MOROYOQUI').nombre).toBe('Juan de Jesús Alcántar Moroyoqui');
    expect(normalizarNombre('F MOROYOQUI').nombre).toBe('F. Moroyoqui');
    expect(normalizarNombre('MARCOS MEZA JR.').nombre).toBe('Marcos Meza Jr.');
    expect(normalizarNombre('OLEGARIO MUÑOZ B.').nombre).toBe('Olegario Muñoz B.');
    expect(normalizarNombre('LUIS GUADALUPE IBAÑEZ MOROYOQUI').nombre).toBe('Luis Guadalupe Ibáñez Moroyoqui');
  });

  it('no cambia apellidos que se escriben distinto', () => {
    expect(normalizarNombre('HECTOR GONZALES').nombre).toBe('Héctor Gonzales');
  });

  it('marca las palabras dudosas sin cambiarlas', () => {
    const r = normalizarNombre('CARTO ALBERTO BUITIMEA MUÑOZ');
    expect(r.nombre).toBe('Carto Alberto Buitimea Muñoz');
    expect(r.dudas).toEqual([{ palabra: 'Carto', nota: '¿Carlos?' }]);
  });
});

describe('crearSlug', () => {
  it('quita acentos y espacios', () => {
    expect(crearSlug('Venados de Batayaqui')).toBe('venados-de-batayaqui');
    expect(crearSlug('Inauguración de la temporada 2025-2026')).toBe('inauguracion-de-la-temporada-2025-2026');
  });
});
