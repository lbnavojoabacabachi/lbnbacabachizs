export type EstadoFormulario = {
  resultado: 'inicial' | 'ok' | 'error';
  mensaje: string;
  errores: Record<string, string>;
  vez: number;
  datos?: Record<string, string>;
};

export const ESTADO_INICIAL: EstadoFormulario = { resultado: 'inicial', mensaje: '', errores: {}, vez: 0 };

export type AccionFormulario = (previo: EstadoFormulario, formulario: FormData) => Promise<EstadoFormulario>;

export type AccionDirecta = () => Promise<EstadoFormulario>;
