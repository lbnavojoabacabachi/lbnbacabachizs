import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { casilla, enlaceOpcional, fecha, hora, horaRequerida, instanteEnSonora, leerFormulario, textoOpcional } from '@/lib/panel/campos';
import { estadoParaCaptura, interpretarCaptura } from '@/lib/panel/resultados';
import { claveTemporal, USUARIO_VALIDO } from '@/lib/usuarios';

const EQUIPOS = { localId: 1, visitanteId: 2 };
const captura = (cambios: Partial<Parameters<typeof interpretarCaptura>[0]>) => ({
  visita: '',
  local: '',
  estado: 'programado',
  cuenta: true,
  nota: '',
  ...cambios,
});

describe('captura de resultados', () => {
  it('con carreras, un juego por jugar se guarda como jugado', () => {
    const r = interpretarCaptura(captura({ visita: '3', local: '6' }), EQUIPOS, true);
    expect(r.juego).toMatchObject({ estado: 'jugado', carrerasVisitante: 3, carrerasLocal: 6, forfeitPierdeId: null });
  });

  it('sin carreras, sigue por jugar', () => {
    expect(interpretarCaptura(captura({}), EQUIPOS, true).juego).toMatchObject({ estado: 'programado', carrerasLocal: null });
  });

  it('pide las dos carreras de un juego jugado', () => {
    const r = interpretarCaptura(captura({ estado: 'jugado', visita: '4' }), EQUIPOS, true);
    expect(r.juego).toBeNull();
    expect(r.errores).toEqual({ local: 'Escribe las carreras del local.' });
  });

  it('rechaza carreras que no son números', () => {
    const r = interpretarCaptura(captura({ visita: 'tres', local: '-1' }), EQUIPOS, true);
    expect(Object.keys(r.errores ?? {})).toEqual(['visita', 'local']);
  });

  it('el forfeit guarda al perdedor y deja las carreras a la regla', () => {
    const r = interpretarCaptura(captura({ estado: 'forfeit_local', visita: '7', local: '0' }), EQUIPOS, true);
    expect(r.juego).toMatchObject({ estado: 'forfeit', forfeitPierdeId: 1, carrerasLocal: null, carrerasVisitante: null });
    expect(estadoParaCaptura({ estado: 'forfeit', forfeitPierdeId: 2 }, 1)).toBe('forfeit_visitante');
  });

  it('respeta la regla de empates', () => {
    expect(interpretarCaptura(captura({ visita: '4', local: '4' }), EQUIPOS, true).juego?.estado).toBe('jugado');
    expect(interpretarCaptura(captura({ visita: '4', local: '4' }), EQUIPOS, false).errores?.estado).toContain('no permiten empates');
  });

  it('guarda el caso especial y la nota pública', () => {
    const r = interpretarCaptura(captura({ visita: '1', local: '2', cuenta: false, nota: '  Se jugó a 5 entradas  ' }), EQUIPOS, true);
    expect(r.juego).toMatchObject({ cuentaParaTabla: false, notaPublica: 'Se jugó a 5 entradas' });
  });

  it('un juego suspendido conserva el marcador parcial si se escribió', () => {
    expect(interpretarCaptura(captura({ estado: 'suspendido', visita: '2', local: '1' }), EQUIPOS, true).juego).toMatchObject({
      estado: 'suspendido',
      carrerasVisitante: 2,
      carrerasLocal: 1,
    });
  });
});

describe('campos de los formularios', () => {
  it('convierte vacíos en nulos y marca casillas', () => {
    const esquema = z.object({ nota: textoOpcional(10), publicar: casilla, hora });
    expect(esquema.parse({ nota: '   ', publicar: 'on', hora: '' })).toEqual({ nota: null, publicar: true, hora: null });
    expect(esquema.parse({ publicar: undefined })).toEqual({ nota: null, publicar: false, hora: null });
  });

  it('valida fechas reales', () => {
    expect(fecha().safeParse('2026-02-29').success).toBe(false);
    expect(fecha().safeParse('2028-02-29').success).toBe(true);
    expect(fecha().safeParse('29/02/2028').success).toBe(false);
  });

  it('valida la hora de inicio', () => {
    expect(horaRequerida.safeParse('18:00').success).toBe(true);
    expect(horaRequerida.safeParse('7:30').success).toBe(false);
    expect(horaRequerida.safeParse('24:00').success).toBe(false);
    expect(horaRequerida.safeParse('').success).toBe(false);
  });

  it('solo acepta enlaces https', () => {
    expect(enlaceOpcional.safeParse('http://facebook.com/liga').success).toBe(false);
    expect(enlaceOpcional.parse('https://facebook.com/liga')).toBe('https://facebook.com/liga');
  });

  it('pasa la hora local de Sonora a un instante', () => {
    expect(instanteEnSonora('2026-01-18', '10:00').toISOString()).toBe('2026-01-18T17:00:00.000Z');
  });

  it('junta los valores repetidos del formulario', () => {
    const datos = new FormData();
    datos.append('juegos', '1');
    datos.append('juegos', '2');
    datos.append('jornadaId', '5');
    expect(leerFormulario(datos)).toEqual({ juegos: ['1', '2'], jornadaId: '5' });
  });
});

describe('usuarios', () => {
  it('genera claves temporales sin caracteres confusos', () => {
    const clave = claveTemporal();
    expect(clave).toHaveLength(14);
    expect(clave).not.toMatch(/[0O1lI]/);
  });

  it('valida el nombre de usuario', () => {
    expect(USUARIO_VALIDO.test('LigaAdmin')).toBe(true);
    expect(USUARIO_VALIDO.test('José')).toBe(false);
    expect(USUARIO_VALIDO.test('ab')).toBe(false);
  });
});
