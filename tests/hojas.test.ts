import { describe, expect, it } from 'vitest';
import {
  archivoCsv,
  calcularLideres,
  candidatosDePitcheo,
  filasCsvDeBateo,
  filasDeBateoPorJuego,
  minimoProrrateado,
  type FilaPitcheo,
  type TotalBateo,
} from '@/lib/estadisticas';
import {
  avanceDeHojas,
  avancePorJornada,
  campoBateo,
  campoPitcheo,
  celdasVacias,
  COLUMNAS_HOJA,
  interpretarLinea,
  interpretarPegado,
  interpretarPitcheoDeJuego,
  resultadoDelEquipo,
  validarPitcheo,
  type CeldasHoja,
} from '@/lib/hojas';
import { esRol, rolDe } from '@/lib/roles';

const celdas = (cambios: Partial<CeldasHoja>): CeldasHoja => ({ ...celdasVacias(), ...cambios });

describe('línea de bateo de un juego', () => {
  it('lleva las columnas del anotador sin los juegos', () => {
    expect(COLUMNAS_HOJA).toEqual(['apariciones', 'vecesAlBat', 'hits', 'sencillos', 'dobles', 'triples', 'jonrones', 'ponches', 'basesPorBolas', 'intencionales', 'golpeados']);
    expect(campoBateo(12, 'apariciones')).toBe('b-12-ab');
    expect(campoBateo(12, 'golpeados')).toBe('b-12-bg');
    expect(campoPitcheo(12)).toBe('p-12');
  });

  it('una fila en blanco es alguien que no jugó', () => {
    expect(interpretarLinea(celdasVacias())).toEqual({ conteos: null, errores: {} });
  });

  it('con AB en cero cuenta el juego de quien entró sin batear', () => {
    const { conteos, errores } = interpretarLinea(celdas({ apariciones: '0' }));
    expect(errores).toEqual({});
    expect(conteos).toMatchObject({ apariciones: 0, vecesAlBat: 0, hits: 0 });
  });

  it('calcula H1 cuando se deja vacío', () => {
    const { conteos } = interpretarLinea(celdas({ apariciones: '5', vecesAlBat: '4', hits: '3', dobles: '1', jonrones: '1', basesPorBolas: '1' }));
    expect(conteos).toMatchObject({ hits: 3, sencillos: 1, dobles: 1, triples: 0, jonrones: 1 });
  });

  it('calcula HC cuando solo vienen los hits por tipo', () => {
    const { conteos } = interpretarLinea(celdas({ apariciones: '4', vecesAlBat: '4', sencillos: '2', triples: '1' }));
    expect(conteos).toMatchObject({ hits: 3, sencillos: 2, triples: 1 });
  });

  it('rechaza hits que no cuadran con su desglose', () => {
    expect(interpretarLinea(celdas({ apariciones: '4', vecesAlBat: '4', hits: '3', sencillos: '1', dobles: '1' })).errores.hits).toContain('no es la suma');
    expect(interpretarLinea(celdas({ apariciones: '4', vecesAlBat: '4', hits: '1', dobles: '2' })).errores.hits).toContain('es menor que');
  });

  it('pide AB y no deja pasar cuentas imposibles', () => {
    expect(interpretarLinea(celdas({ vecesAlBat: '3', hits: '1' })).errores.apariciones).toContain('falta AB');
    expect(interpretarLinea(celdas({ apariciones: '3', vecesAlBat: '4' })).errores.vecesAlBat).toContain('no puede pasar de AB');
    expect(interpretarLinea(celdas({ apariciones: '4', vecesAlBat: '3', basesPorBolas: '1', golpeados: '1' })).errores.apariciones).toContain('al menos');
    expect(interpretarLinea(celdas({ apariciones: '4', vecesAlBat: '4', hits: '3', ponches: '2' })).errores.ponches).toContain('HC + K');
  });

  it('acepta sacrificios: AB mayor que VB más bases', () => {
    expect(interpretarLinea(celdas({ apariciones: '5', vecesAlBat: '3', hits: '1', basesPorBolas: '1' })).conteos).toMatchObject({ apariciones: 5, vecesAlBat: 3 });
  });

  it('rechaza letras, negativos y números fuera de un juego', () => {
    expect(interpretarLinea(celdas({ apariciones: 'x' })).errores.apariciones).toContain('número entero');
    expect(interpretarLinea(celdas({ apariciones: '-1' })).errores.apariciones).toContain('número entero');
    expect(interpretarLinea(celdas({ apariciones: '4', vecesAlBat: '31' })).errores.vecesAlBat).toContain('de 0 a 30');
  });
});

describe('pitcheo de un juego', () => {
  it('lee la opción elegida', () => {
    expect(interpretarPitcheoDeJuego('')).toBeNull();
    expect(interpretarPitcheoDeJuego('lanzo')).toBe('lanzo');
    expect(interpretarPitcheoDeJuego('ganado')).toBe('ganado');
    expect(interpretarPitcheoDeJuego('otro')).toBeUndefined();
  });

  it('saca el resultado del equipo del marcador', () => {
    expect([resultadoDelEquipo(5, 3), resultadoDelEquipo(2, 3), resultadoDelEquipo(4, 4)]).toEqual(['gano', 'perdio', 'empato']);
  });

  it('el equipo que ganó no tiene perdedor y solo un ganador', () => {
    const revision = validarPitcheo(
      [
        { jugadorId: 1, pitcheo: 'ganado' },
        { jugadorId: 2, pitcheo: 'ganado' },
        { jugadorId: 3, pitcheo: 'perdido' },
        { jugadorId: 4, pitcheo: 'salvado' },
      ],
      'gano',
    );
    expect(Object.keys(revision.errores)).toEqual(['2', '3']);
    expect(revision.errores[2]).toContain('solo un pitcher gana');
    expect(revision.errores[3]).toContain('su equipo ganó');
  });

  it('el equipo que perdió no gana ni salva', () => {
    const revision = validarPitcheo(
      [
        { jugadorId: 1, pitcheo: 'salvado' },
        { jugadorId: 2, pitcheo: 'perdido' },
      ],
      'perdio',
    );
    expect(Object.keys(revision.errores)).toEqual(['1']);
    expect(revision.avisos).toEqual([]);
  });

  it('en un empate nadie se lleva decisión', () => {
    expect(validarPitcheo([{ jugadorId: 1, pitcheo: 'ganado' }], 'empato').errores[1]).toContain('empatado');
    expect(validarPitcheo([{ jugadorId: 1, pitcheo: 'lanzo' }], 'empato')).toEqual({ errores: {}, avisos: [] });
  });

  it('avisa sin impedir guardar cuando falta la decisión', () => {
    expect(validarPitcheo([{ jugadorId: 1, pitcheo: 'lanzo' }], 'gano')).toEqual({ errores: {}, avisos: ['Falta marcar al pitcher ganador.'] });
    expect(validarPitcheo([{ jugadorId: 1, pitcheo: 'lanzo' }], 'perdio').avisos).toEqual(['Falta marcar al pitcher perdedor.']);
    expect(validarPitcheo([], 'gano').avisos).toEqual(['No marcaste quién lanzó.']);
  });
});

describe('pegar una hoja desde Excel', () => {
  const plantilla = [
    { jugadorId: 1, nombre: 'Juan Carlos Cota' },
    { jugadorId: 2, nombre: 'Lenny Miranda' },
    { jugadorId: 3, nombre: 'Luis Yocupicio' },
    { jugadorId: 4, nombre: 'Luis Yocupicio' },
    { jugadorId: 5, nombre: 'José Ángel Mendívil' },
  ];

  it('acomoda las 11 columnas en orden y deja vacías las celdas vacías', () => {
    const { celdas: leidas, errores } = interpretarPegado('JUAN CARLOS COTA\t4\t3\t2\t1\t1\t\t\t1\t1\t\t', plantilla);
    expect(errores).toEqual([]);
    expect(leidas.get(1)).toEqual(celdas({ apariciones: '4', vecesAlBat: '3', hits: '2', sencillos: '1', dobles: '1', ponches: '1', basesPorBolas: '1' }));
  });

  it('con encabezados usa sus columnas y salta JJ, porcentajes y totales', () => {
    const texto = ['NOMBRE\tJJ\tAB\tVB\tHC\tHR\tAVG', 'LENNY MIRANDA\t1\t5\t4\t2\t1\t0.500', 'TOTALES:\t\t5\t4\t2\t1'].join('\n');
    const { celdas: leidas, errores } = interpretarPegado(texto, plantilla);
    expect(errores).toEqual([]);
    expect([...leidas.keys()]).toEqual([2]);
    expect(leidas.get(2)).toEqual(celdas({ apariciones: '5', vecesAlBat: '4', hits: '2', jonrones: '1' }));
  });

  it('reconoce nombres sin acentos o con un nombre de menos', () => {
    const { celdas: leidas, errores } = interpretarPegado('JOSE ANGEL MENDIVIL\t3\t3\nJUAN COTA\t4\t4', plantilla);
    expect(errores).toEqual([]);
    expect([...leidas.keys()]).toEqual([5, 1]);
  });

  it('avisa de quien no está, de los homónimos y de los repetidos', () => {
    const { celdas: leidas, errores } = interpretarPegado('PEDRO PARAMO\t4\t4\nLUIS YOCUPICIO\t3\t3\nLENNY MIRANDA\t4\t4\nLENNY MIRANDA\t1\t1', plantilla);
    expect([...leidas.keys()]).toEqual([2]);
    expect(errores).toHaveLength(3);
    expect(errores[0]).toContain('«PEDRO PARAMO» no está en la plantilla');
    expect(errores[2]).toContain('viene dos veces');
  });

  it('lee filas separadas por espacios', () => {
    const { celdas: leidas } = interpretarPegado('Lenny Miranda 4 3 1 1 0 0 0 1 1 0 0', plantilla);
    expect(leidas.get(2)).toMatchObject({ apariciones: '4', vecesAlBat: '3', hits: '1', sencillos: '1', ponches: '1', basesPorBolas: '1' });
  });
});

describe('avance de la captura', () => {
  const juegos = [
    { juegoId: 1, jornada: 1, hojaLocal: 'capturada', hojaVisitante: 'capturada' },
    { juegoId: 2, jornada: 1, hojaLocal: 'pendiente', hojaVisitante: 'sin_numeros' },
    { juegoId: 3, jornada: 2, hojaLocal: 'pendiente', hojaVisitante: 'pendiente' },
  ] as const;

  it('una hoja marcada sin números no se espera ni queda pendiente', () => {
    expect(avanceDeHojas([...juegos])).toEqual({ capturadas: 2, pendientes: 3, esperadas: 5 });
  });

  it('agrupa por jornada en orden', () => {
    expect(avancePorJornada([...juegos].reverse()).map((j) => [j.numero, j.pendientes, j.juegos.length])).toEqual([
      [1, 1, 2],
      [2, 2, 1],
    ]);
  });
});

function total(jugadorId: number, equipoId: number, cambios: Partial<TotalBateo> = {}): TotalBateo {
  return {
    equipoId,
    jugadorId,
    nombre: `Jugador ${jugadorId}`,
    ultimaJornada: 1,
    juegos: 2,
    apariciones: 8,
    vecesAlBat: 8,
    hits: 2,
    sencillos: 2,
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

describe('acumulados juego por juego', () => {
  it('quien cambió de equipo lleva su fila (total) en el equipo más reciente', () => {
    const filas = filasDeBateoPorJuego([
      total(1, 10, { nombre: 'Lenny Miranda', hits: 3, ultimaJornada: 2 }),
      total(1, 20, { nombre: 'Lenny Miranda', hits: 4, juegos: 3, ultimaJornada: 5 }),
      total(2, 10, { nombre: 'Álvaro Cota' }),
    ]);
    expect(filas.map((f) => [f.equipoId, f.nombre, f.acumulado, f.hits, f.juegos])).toEqual([
      [10, 'Álvaro Cota', false, 2, 2],
      [10, 'Lenny Miranda', false, 3, 2],
      [20, 'Lenny Miranda', false, 4, 3],
      [20, 'Lenny Miranda', true, 7, 5],
    ]);
    expect(calcularLideres(filas, [], 1).hits.map((f) => [f.nombre, f.hits, f.equipoId])).toEqual([
      ['Lenny Miranda', 7, 20],
      ['Álvaro Cota', 2, 10],
    ]);
  });

  it('dos jugadores con el mismo nombre no se mezclan', () => {
    const filas = filasDeBateoPorJuego([total(3, 10, { nombre: 'Luis Yocupicio', hits: 5 }), total(4, 20, { nombre: 'Luis Yocupicio', hits: 1 })]);
    expect(filas.every((f) => !f.acumulado)).toBe(true);
    expect(calcularLideres(filas, [], 1).hits.map((f) => f.hits)).toEqual([5, 1]);
  });

  it('suma los ganados del pitcher que cambió de equipo', () => {
    const pitcheo: (FilaPitcheo & { equipoId: number })[] = [
      { equipoId: 10, jugadorId: 7, nombre: 'Saúl Almada', ultimaJornada: 2, juegos: 3, ganados: 2, perdidos: 1, salvados: 0 },
      { equipoId: 20, jugadorId: 7, nombre: 'Saúl Almada', ultimaJornada: 6, juegos: 2, ganados: 2, perdidos: 0, salvados: 0 },
      { equipoId: 10, jugadorId: 8, nombre: 'Germán Cano', ultimaJornada: 6, juegos: 4, ganados: 3, perdidos: 0, salvados: 1 },
    ];
    expect(candidatosDePitcheo(pitcheo).map((p) => [p.nombre, p.equipoId, p.juegos, p.ganados, p.perdidos])).toEqual([
      ['Saúl Almada', 20, 5, 4, 1],
      ['Germán Cano', 10, 4, 3, 0],
    ]);
    expect(calcularLideres([], pitcheo, 1).ganados.map((p) => p.ganados)).toEqual([4, 3]);
  });

  it('el mínimo para el título de bateo crece con las hojas capturadas', () => {
    expect(minimoProrrateado(70, 0, 360)).toBe(1);
    expect(minimoProrrateado(70, 60, 360)).toBe(12);
    expect(minimoProrrateado(70, 360, 360)).toBe(70);
    expect(minimoProrrateado(70, 400, 360)).toBe(70);
    expect(minimoProrrateado(70, 10, 0)).toBe(70);
    expect(minimoProrrateado(0, 10, 360)).toBe(0);
  });
});

describe('descarga para Excel', () => {
  it('arma el CSV con BOM, comillas y sin fórmulas', () => {
    const filas = filasCsvDeBateo(
      [{ ...total(1, 10, { nombre: 'Meza, Marcos Jr.' }), acumulado: true }, { ...total(2, 10, { nombre: '=SUMA(A1)', vecesAlBat: 0, hits: 0, sencillos: 0 }), acumulado: false }],
      new Map([[10, 'Rojos "B"']]),
    );
    const csv = archivoCsv(filas);
    const lineas = csv.split('\r\n');
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(lineas[0].slice(1)).toBe('Equipo,Jugador,JJ,AB,VB,HC,H1,H2,H3,HR,K,BB,BI,BG,AVG,OBP,SLG');
    expect(lineas[1]).toBe('"Rojos ""B""","Meza, Marcos Jr. (TOTAL)",2,8,8,2,2,0,0,0,0,0,0,0,0.250,0.250,0.250');
    expect(lineas[2].startsWith(`"Rojos ""B""",'=SUMA(A1),2,8,0,`)).toBe(true);
    expect(lineas[2].endsWith(',,0.000,')).toBe(true);
  });
});

describe('roles', () => {
  it('solo reconoce administrador y compilador', () => {
    expect(esRol('administrador')).toBe(true);
    expect(esRol('compilador')).toBe(true);
    expect(rolDe('capturista')).toBeNull();
    expect(rolDe(undefined)).toBeNull();
  });
});
