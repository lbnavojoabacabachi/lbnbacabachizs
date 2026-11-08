import { describe, expect, it } from 'vitest';
import { buscarComentarios, buscarEmojis } from '../scripts/lib/reglas.mjs';

describe('buscarComentarios', () => {
  it('encuentra comentarios de línea y de bloque en TypeScript', () => {
    const codigo = 'const a = 1; // nota\n/* bloque */\nconst b = 2;\n';
    expect(buscarComentarios(codigo, 'x.ts').map((h) => h.linea)).toEqual([1, 2]);
  });

  it('no confunde una URL dentro de una cadena con un comentario', () => {
    const codigo = "const url = 'https://ligabeisbolbacabachi.com/*';\nconst r = /\\/\\//;\n";
    expect(buscarComentarios(codigo, 'x.ts')).toEqual([]);
  });

  it('encuentra comentarios dentro de JSX y respeta el texto visible', () => {
    const codigo = 'export const A = () => (<p>{/* oculto */}Visita http://liga.mx</p>);\n';
    const hallazgos = buscarComentarios(codigo, 'a.tsx');
    expect(hallazgos).toHaveLength(1);
    expect(hallazgos[0].texto.startsWith('/* oculto')).toBe(true);
  });

  it('revisa CSS, SQL, JSON y archivos de líneas', () => {
    expect(buscarComentarios('a { color: red; } /* x */', 'a.css')).toHaveLength(1);
    expect(buscarComentarios("a { background: url('//cdn/x.png'); }", 'a.css')).toEqual([]);
    expect(buscarComentarios("select '--no' as a;\n-- nota\n", 'a.sql').map((h) => h.linea)).toEqual([2]);
    expect(buscarComentarios('{ "a": "http://x" }', 'a.json')).toEqual([]);
    expect(buscarComentarios('{ "a": 1 // nota\n}', 'a.json')).toHaveLength(1);
    expect(buscarComentarios('node_modules/\n# nota\n', '.gitignore').map((h) => h.linea)).toEqual([2]);
  });
});

describe('buscarEmojis', () => {
  it('encuentra emojis y secuencias de emoji', () => {
    expect(buscarEmojis('Hola \u{1F44B}')).toHaveLength(1);
    expect(buscarEmojis('Listo \u{2705} y 1\u{FE0F}\u{20E3}')).toHaveLength(3);
  });

  it('permite símbolos tipográficos y texto normal', () => {
    expect(buscarEmojis('© 2026 Liga · ® ™ · 10:00 a. m. · ñ á')).toEqual([]);
  });
});
