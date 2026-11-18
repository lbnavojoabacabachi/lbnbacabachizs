export const ROLES = ['administrador', 'compilador'] as const;

export type Rol = (typeof ROLES)[number];

export const NOMBRE_ROL: Record<Rol, string> = {
  administrador: 'Administrador',
  compilador: 'Compilador',
};

export const DETALLE_ROL: Record<Rol, string> = {
  administrador: 'usa todo el panel',
  compilador: 'solo captura estadísticas',
};

export const INICIO_DEL_COMPILADOR = '/panel/estadisticas';

export function esRol(valor: unknown): valor is Rol {
  return typeof valor === 'string' && (ROLES as readonly string[]).includes(valor);
}

export function rolDe(valor: unknown): Rol | null {
  return esRol(valor) ? valor : null;
}
