export const CLAVE_TEMA = 'tema';

export type Tema = 'auto' | 'claro' | 'oscuro';

export function temaGuardado(valor: string | null | undefined): Tema {
  return valor === 'claro' || valor === 'oscuro' ? valor : 'auto';
}

export const SCRIPT_TEMA = `try{var t=localStorage.getItem(${JSON.stringify(CLAVE_TEMA)});if(t==="claro"||t==="oscuro")document.documentElement.dataset.tema=t}catch(e){}`;
