import { describe, expect, it } from 'vitest';
import {
  formatearFecha,
  formatearFechaCorta,
  formatearHora,
  formatearInstante,
  hoyEnSonora,
} from '@/lib/fechas';
import { variantesDeImagen } from '@/lib/imagenes/tamanos';
import { incrustacionDePublicacion, incrustacionDeTransmision, redDeUrl } from '@/lib/incrustar';
import { calcularRachas, describirRacha, resultadoDeJuego, resumenDeResultados, resumirJornadas } from '@/lib/jornadas';
import type { JuegoTabla } from '@/lib/posiciones';
import { publicacionesDeRespuesta } from '@/lib/facebook';
import { SCRIPT_TEMA, temaGuardado } from '@/lib/tema';

const REGLAS = { forfeitCarrerasGanador: 7, forfeitCarrerasPerdedor: 0 };

describe('publicaciones de Facebook', () => {
  const publicacion = (cambios: Record<string, unknown> = {}) => ({
    id: '61581889322291_1',
    message: '  Se recorre la jornada 11.\nNos vemos el domingo.  ',
    created_time: '2026-01-18T17:00:00+0000',
    permalink_url: 'https://www.facebook.com/61581889322291/posts/1',
    full_picture: 'https://scontent.fhmo1-1.fna.fbcdn.net/v/completa.jpg',
    attachments: {
      data: [{ media_type: 'photo', media: { image: { src: 'https://scontent.fhmo1-1.fna.fbcdn.net/v/foto.jpg', width: 720, height: 960 } } }],
    },
    ...cambios,
  });

  it('toma el texto, la fecha, el enlace y la imagen con su tamaño', () => {
    expect(publicacionesDeRespuesta({ data: [publicacion()] })).toEqual([
      {
        id: '61581889322291_1',
        texto: 'Se recorre la jornada 11.\nNos vemos el domingo.',
        fecha: '2026-01-18T17:00:00.000Z',
        enlace: 'https://www.facebook.com/61581889322291/posts/1',
        imagen: { url: 'https://scontent.fhmo1-1.fna.fbcdn.net/v/foto.jpg', ancho: 720, alto: 960 },
        esVideo: false,
      },
    ]);
  });

  it('usa la imagen completa si el adjunto no trae una y marca los videos', () => {
    const [video] = publicacionesDeRespuesta({ data: [publicacion({ attachments: { data: [{ media_type: 'video' }] } })] });
    expect(video.imagen).toEqual({ url: 'https://scontent.fhmo1-1.fna.fbcdn.net/v/completa.jpg', ancho: null, alto: null });
    expect(video.esVideo).toBe(true);
  });

  it('descarta enlaces que no son de Facebook, direcciones sin https y publicaciones vacías', () => {
    const respuesta = {
      data: [
        publicacion({ permalink_url: 'https://facebook.com.ejemplo.mx/posts/1' }),
        publicacion({ permalink_url: 'javascript:alert(1)' }),
        publicacion({ message: '   ', full_picture: 'http://fbcdn.net/x.jpg', attachments: undefined }),
        publicacion({ created_time: 'ayer' }),
        null,
      ],
    };
    expect(publicacionesDeRespuesta(respuesta)).toEqual([]);
    expect(publicacionesDeRespuesta({ error: { message: 'token vencido' } })).toEqual([]);
    expect(publicacionesDeRespuesta(null)).toEqual([]);
  });

  it('se queda con las más recientes que caben', () => {
    const muchas = Array.from({ length: 12 }, (_, i) => publicacion({ id: String(i) }));
    expect(publicacionesDeRespuesta({ data: muchas }, 9).map((p) => p.id)).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8']);
  });
});

describe('tema elegido', () => {
  const temaAlCargar = (guardado: string | null | Error) => {
    const documento = { documentElement: { dataset: {} as Record<string, string> } };
    const almacen = {
      getItem: () => {
        if (guardado instanceof Error) throw guardado;
        return guardado;
      },
    };
    new Function('localStorage', 'document', SCRIPT_TEMA)(almacen, documento);
    return documento.documentElement.dataset.tema;
  };

  it('aplica el tema guardado antes de pintar la página', () => {
    expect(temaAlCargar('oscuro')).toBe('oscuro');
    expect(temaAlCargar('claro')).toBe('claro');
  });

  it('sigue al aparato con valores desconocidos o sin almacenamiento', () => {
    expect(temaAlCargar('morado')).toBeUndefined();
    expect(temaAlCargar(null)).toBeUndefined();
    expect(temaAlCargar(new Error('almacenamiento bloqueado'))).toBeUndefined();
  });

  it('lee el tema de la página', () => {
    expect(temaGuardado('oscuro')).toBe('oscuro');
    expect(temaGuardado(undefined)).toBe('auto');
    expect(temaGuardado('auto')).toBe('auto');
  });
});

describe('fechas', () => {
  it('escribe la fecha de la jornada con el día de la semana y sin desfase de zona', () => {
    expect(formatearFecha('2026-01-11')).toBe('domingo 11 de enero de 2026');
    expect(formatearFecha('2025-10-25', { diaSemana: false })).toBe('25 de octubre de 2025');
    expect(formatearFechaCorta('2026-03-01')).toBe('1 mar 2026');
  });

  it('usa la hora de Sonora, sin horario de verano', () => {
    expect(formatearInstante(new Date('2026-01-18T17:00:00Z'))).toBe('domingo 18 de enero de 2026, 10:00 a. m.');
    expect(hoyEnSonora(new Date('2026-07-01T05:30:00Z'))).toBe('2026-06-30');
  });

  it('escribe la hora en formato de 12 horas', () => {
    expect(formatearHora(0, 5)).toBe('12:05 a. m.');
    expect(formatearHora(12, 0)).toBe('12:00 p. m.');
    expect(formatearHora(16, 30)).toBe('4:30 p. m.');
  });
});

describe('resultado de un juego', () => {
  const juego = { numero: 1, cuentaParaTabla: true, notaPublica: null, forfeitPierdeId: null };

  it('marca al ganador y al empate', () => {
    expect(resultadoDeJuego({ ...juego, estado: 'jugado', carrerasLocal: 3, carrerasVisitante: 6 }, 1, REGLAS).ganador).toBe(
      'visitante',
    );
    expect(resultadoDeJuego({ ...juego, estado: 'jugado', carrerasLocal: 4, carrerasVisitante: 4 }, 1, REGLAS).ganador).toBe(
      'empate',
    );
  });

  it('muestra el forfeit con el marcador de las reglas', () => {
    const r = resultadoDeJuego(
      { ...juego, estado: 'forfeit', carrerasLocal: null, carrerasVisitante: null, forfeitPierdeId: 1 },
      1,
      REGLAS,
    );
    expect(r).toMatchObject({ local: 0, visitante: 7, ganador: 'visitante', forfeitDe: 'local' });
  });

  it('deja sin marcador los juegos programados o suspendidos', () => {
    const r = resultadoDeJuego({ ...juego, estado: 'suspendido', carrerasLocal: null, carrerasVisitante: null }, 1, REGLAS);
    expect(r).toMatchObject({ local: null, visitante: null, ganador: null });
  });
});

describe('resumen de jornadas', () => {
  const jornada = (numero: number, fecha: string, estado: 'jugado' | 'programado') => ({
    numero,
    fecha,
    encuentros: [{ juegos: [{ estado }] }],
  });
  const jornadas = [jornada(1, '2025-10-25', 'jugado'), jornada(2, '2025-11-09', 'jugado'), jornada(3, '2025-11-16', 'programado')];

  it('encuentra la última jornada con resultados y la siguiente', () => {
    const r = resumirJornadas(jornadas, '2025-11-10');
    expect(r.ultima?.numero).toBe(2);
    expect(r.siguiente?.numero).toBe(3);
    expect(r.siguientePorPublicar).toBe(false);
  });

  it('avisa cuando la siguiente jornada ya pasó y no tiene resultados', () => {
    expect(resumirJornadas(jornadas, '2025-11-20').siguientePorPublicar).toBe(true);
  });

  it('sin resultados, la siguiente es la primera', () => {
    const r = resumirJornadas([jornada(1, '2025-10-25', 'programado')], '2025-10-01');
    expect(r.ultima).toBeNull();
    expect(r.siguiente?.numero).toBe(1);
  });
});

describe('rachas', () => {
  const juego = (localId: number, visitanteId: number, cl: number, cv: number): JuegoTabla => ({
    localId,
    visitanteId,
    estado: 'jugado',
    carrerasLocal: cl,
    carrerasVisitante: cv,
    forfeitPierdeId: null,
    cuentaParaTabla: true,
  });

  it('cuenta los resultados seguidos más recientes', () => {
    const rachas = calcularRachas([
      juego(1, 2, 5, 1),
      juego(1, 2, 2, 3),
      juego(1, 3, 1, 4),
      { ...juego(2, 3, 0, 0), estado: 'forfeit', forfeitPierdeId: 3 },
      juego(2, 3, 6, 6),
    ]);
    expect(rachas.get(1)).toEqual({ resultado: 'P', cuenta: 2 });
    expect(rachas.get(2)).toEqual({ resultado: 'E', cuenta: 1 });
    expect(rachas.get(3)).toEqual({ resultado: 'E', cuenta: 1 });
  });

  it('ignora los juegos que no cuentan para la tabla', () => {
    const rachas = calcularRachas([juego(1, 2, 5, 1), { ...juego(1, 2, 0, 9), cuentaParaTabla: false }]);
    expect(rachas.get(1)).toEqual({ resultado: 'G', cuenta: 1 });
  });

  it('describe la racha en palabras', () => {
    expect(describirRacha({ resultado: 'G', cuenta: 3 })).toBe('3 ganados seguidos');
    expect(describirRacha({ resultado: 'P', cuenta: 1 })).toBe('1 perdido');
  });
});

describe('transmisiones y publicaciones', () => {
  it('reconoce videos de YouTube en sus distintas direcciones', () => {
    for (const url of [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/live/dQw4w9WgXcQ?si=abc',
    ]) {
      expect(incrustacionDeTransmision(url)?.src).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0');
    }
    expect(incrustacionDePublicacion('https://www.youtube.com/shorts/dQw4w9WgXcQ')?.formato).toBe('vertical');
  });

  it('reconoce videos y publicaciones de Facebook', () => {
    const video = incrustacionDeTransmision('https://www.facebook.com/poloonlive/videos/1234567890');
    expect(video?.src).toContain('/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fpoloonlive%2Fvideos%2F1234567890');
    expect(incrustacionDeTransmision('https://www.facebook.com/poloonlive/posts/123')).toBeNull();
    expect(incrustacionDePublicacion('https://www.facebook.com/poloonlive/posts/123')?.src).toContain('/plugins/post.php');
  });

  it('reconoce Instagram y TikTok, y deja X como enlace', () => {
    expect(incrustacionDePublicacion('https://www.instagram.com/p/C1a2B3c4D5e/')?.src).toBe(
      'https://www.instagram.com/p/C1a2B3c4D5e/embed',
    );
    expect(incrustacionDePublicacion('https://www.tiktok.com/@liga/video/7301234567890123456')?.src).toBe(
      'https://www.tiktok.com/embed/v2/7301234567890123456',
    );
    expect(redDeUrl('https://x.com/liga/status/1')).toBe('x');
    expect(incrustacionDePublicacion('https://x.com/liga/status/1')).toBeNull();
  });

  it('rechaza direcciones sin https o de otros sitios', () => {
    expect(incrustacionDeTransmision('http://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(incrustacionDeTransmision('https://youtube.com.ejemplo.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(incrustacionDeTransmision('javascript:alert(1)')).toBeNull();
  });
});

describe('variantes de imagen', () => {
  it('calcula el ancho de cada tamaño por el lado más largo', () => {
    const vertical = { id: 1, tipo: 'foto', urlChica: 'c', urlMediana: 'm', urlGrande: 'g', ancho: 1200, alto: 1599, colorFondo: null } as const;
    expect(variantesDeImagen(vertical).map((v) => v.ancho)).toEqual([360, 720, 1200]);
    const logo = { ...vertical, tipo: 'logo', ancho: 512, alto: 512 } as const;
    expect(variantesDeImagen(logo).map((v) => v.ancho)).toEqual([128, 256, 512]);
  });
});

describe('resumen de resultados para compartir', () => {
  it('escribe la visita primero, con los marcadores de sus juegos', () => {
    const juego = (numero: number, local: number, visitante: number) => ({
      ...resultadoDeJuego(
        { numero, estado: 'jugado', carrerasLocal: local, carrerasVisitante: visitante, forfeitPierdeId: null, cuentaParaTabla: true, notaPublica: null },
        1,
        REGLAS,
      ),
    });
    const texto = resumenDeResultados({
      encuentros: [
        { local: { nombre: 'Venados de Batayaqui' }, visitante: { nombre: 'Chicos de Sinahuiza' }, juegos: [juego(1, 0, 3), juego(2, 9, 6)] },
        { local: { nombre: 'Astros' }, visitante: { nombre: 'Saneal' }, juegos: [] },
      ],
    });
    expect(texto).toBe('Chicos de Sinahuiza 3-0 y 6-9 Venados de Batayaqui; Saneal en Astros');
  });
});
