import { describe, expect, it } from 'vitest';
import {
  calcularLideres,
  formatearPorcentaje,
  interpretarBateo,
  interpretarPitcheo,
  porcentajesDeBateo,
  sumarBateo,
  textoDeBateo,
  textoDePitcheo,
  type FilaBateo,
  type FilaPitcheo,
} from '@/lib/estadisticas';

const COTA = 'JUAN CARLOS COTA\t26\t99\t74\t40\t23\t14\t\t4\t5\t18\t5\t1\t0.541\t0.646\t0.905';

function bateador(nombre: string, cambios: Partial<FilaBateo> = {}): FilaBateo {
  return {
    nombre,
    acumulado: false,
    juegos: 10,
    apariciones: 80,
    vecesAlBat: 70,
    hits: 20,
    sencillos: 20,
    dobles: 0,
    triples: 0,
    jonrones: 0,
    ponches: 0,
    basesPorBolas: 0,
    intencionales: 0,
    golpeados: 0,
    ...cambios,
  };
}

const pitcher = (nombre: string, ganados: number, perdidos: number): FilaPitcheo => ({ nombre, juegos: ganados + perdidos, ganados, perdidos, salvados: 0 });

describe('pegar el bateo', () => {
  it('lee las columnas del Excel aunque haya celdas vacías', () => {
    const { filas, errores } = interpretarBateo('JAIME ALAN SIARI\t21\t64\t54\t16\t15\t\t1\t\t6\t8\t\t2\t0.296\t0.406\t0.333');
    expect(errores).toEqual([]);
    expect(filas[0]).toEqual({
      nombre: 'Jaime Alan Siari',
      acumulado: false,
      juegos: 21,
      apariciones: 64,
      vecesAlBat: 54,
      hits: 16,
      sencillos: 15,
      dobles: 0,
      triples: 1,
      jonrones: 0,
      ponches: 6,
      basesPorBolas: 8,
      intencionales: 0,
      golpeados: 2,
    });
  });

  it('salta encabezados, totales y líneas vacías', () => {
    const texto = ['NOMBRE\tJJ\tAB\tVB', COTA, '', 'TOTALES:\t\t1054\t905'].join('\n');
    const { filas, errores } = interpretarBateo(texto);
    expect(errores).toEqual([]);
    expect(filas.map((f) => f.nombre)).toEqual(['Juan Carlos Cota']);
  });

  it('marca las filas (TOTAL) de quien cambió de equipo', () => {
    const { filas } = interpretarBateo('LENNY MIRANDA (TOTAL)\t31\t112\t101\t41\t31\t7\t1\t2\t4\t7\t1\t2');
    expect(filas[0]).toMatchObject({ nombre: 'Lenny Miranda', acumulado: true, hits: 41 });
  });

  it('acepta números separados por espacios si vienen las 12 columnas', () => {
    const { filas, errores } = interpretarBateo('Marcos Meza Jr 27 101 87 39 31 8 0 0 4 4 0 7 0.448 0.495 0.540');
    expect(errores).toEqual([]);
    expect(filas[0]).toMatchObject({ nombre: 'Marcos Meza Jr.', hits: 39, golpeados: 7 });
  });

  it('rechaza filas con columnas incompletas, números raros o nombres repetidos', () => {
    expect(interpretarBateo('JOSE ORTEGA 10 19 17 9 1 1').errores[0]).toContain('12 columnas');
    expect(interpretarBateo('JOSE ORTEGA\t10\t19\tx').errores[0]).toContain('«x» en VB');
    expect(interpretarBateo(`${COTA}\n${COTA}`).errores[0]).toContain('está repetida');
  });

  it('vuelve a leer lo que el panel muestra', () => {
    const { filas } = interpretarBateo(`${COTA}\nLENNY MIRANDA (TOTAL)\t31\t112\t101\t41\t31\t7\t1\t2\t4\t7\t1\t2`);
    expect(interpretarBateo(textoDeBateo(filas)).filas).toEqual(filas);
  });
});

describe('pegar el pitcheo', () => {
  it('lee JJ, G, P y SV con celdas vacías', () => {
    const { filas, errores } = interpretarPitcheo('EDUARDO MEZA\t2\t\t1');
    expect(errores).toEqual([]);
    expect(filas[0]).toEqual({ nombre: 'Eduardo Meza', juegos: 2, ganados: 0, perdidos: 1, salvados: 0 });
  });

  it('acepta dos pitchers con el mismo nombre y números distintos', () => {
    const { filas, errores } = interpretarPitcheo('LUIS YOCUPICIO\t1\nLUIS YOCUPICIO\t3\t\t2');
    expect(errores).toEqual([]);
    expect(filas.map((f) => [f.juegos, f.perdidos])).toEqual([
      [1, 0],
      [3, 2],
    ]);
  });

  it('sin tabuladores pide al menos JJ, G y P', () => {
    expect(interpretarPitcheo('JOEL REYES 10 4 2').filas[0]).toMatchObject({ juegos: 10, ganados: 4, perdidos: 2, salvados: 0 });
    expect(interpretarPitcheo('FIDEL VALDEZ 1').errores).toHaveLength(1);
  });

  it('vuelve a leer lo que el panel muestra', () => {
    const { filas } = interpretarPitcheo('SAUL ALMADA\t12\t9\t3\nGERMAN CANO\t8\t1\t3\t1');
    expect(interpretarPitcheo(textoDePitcheo(filas)).filas).toEqual(filas);
  });
});

describe('porcentajes de bateo', () => {
  it('calcula promedio, embasado y slugging como el anotador', () => {
    const cota = interpretarBateo(COTA).filas[0];
    expect(porcentajesDeBateo(cota)).toEqual({ promedio: 0.541, embasado: 0.646, slugging: 0.905 });
  });

  it('sin veces al bat no hay promedio', () => {
    expect(porcentajesDeBateo(bateador('Roberto Sombra', { apariciones: 1, vecesAlBat: 0, hits: 0, sencillos: 0, basesPorBolas: 1 }))).toEqual({
      promedio: null,
      embasado: 1,
      slugging: null,
    });
  });

  it('formatea sin el cero inicial', () => {
    expect(formatearPorcentaje(0.541)).toBe('.541');
    expect(formatearPorcentaje(1)).toBe('1.000');
    expect(formatearPorcentaje(null)).toBe('—');
  });

  it('los totales del equipo no cuentan dos veces las filas (TOTAL)', () => {
    const suma = sumarBateo([bateador('A', { hits: 10 }), bateador('B', { hits: 5 }), bateador('B', { hits: 30, acumulado: true })]);
    expect(suma.hits).toBe(15);
  });
});

describe('líderes', () => {
  it('usa el total de quien cambió de equipo y no sus filas sueltas', () => {
    const bateo = [
      bateador('Lenny Miranda', { hits: 11, vecesAlBat: 31, apariciones: 33 }),
      bateador('Lenny Miranda', { hits: 30, vecesAlBat: 70, apariciones: 79, acumulado: true, juegos: 21 }),
      bateador('Lenny Miranda', { hits: 41, vecesAlBat: 101, apariciones: 112, acumulado: true, juegos: 31 }),
      bateador('Juan Carlos Cota', { hits: 40 }),
    ];
    const { hits } = calcularLideres(bateo, [], 70);
    expect(hits.map((f) => [f.nombre, f.hits])).toEqual([
      ['Lenny Miranda', 41],
      ['Juan Carlos Cota', 40],
    ]);
  });

  it('el título de bateo pide el mínimo de apariciones', () => {
    const bateo = [bateador('Pocas', { apariciones: 20, vecesAlBat: 10, hits: 9 }), bateador('Suficientes', { hits: 30 })];
    expect(calcularLideres(bateo, [], 70).promedio.map((f) => f.nombre)).toEqual(['Suficientes']);
  });

  it('incluye a los empatados en el último lugar', () => {
    const bateo = [4, 4, 3, 3, 3, 3, 3, 2].map((hr, i) => bateador(`Jugador ${i}`, { jonrones: hr }));
    expect(calcularLideres(bateo, [], 70).jonrones).toHaveLength(7);
    const pitcheo = [pitcher('A', 9, 3), pitcher('B', 8, 2), pitcher('C', 7, 3), pitcher('D', 6, 2), pitcher('E', 6, 2), pitcher('F', 4, 1), pitcher('G', 4, 2), pitcher('H', 3, 0)];
    expect(calcularLideres([], pitcheo, 70).ganados.map((p) => p.nombre)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  });
});
