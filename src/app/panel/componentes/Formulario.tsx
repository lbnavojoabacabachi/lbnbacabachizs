'use client';

import {
  createContext,
  startTransition,
  useActionState,
  useContext,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { ESTADO_INICIAL, type AccionFormulario, type EstadoFormulario } from '@/lib/panel/estado';
import estilos from './formularios.module.css';

type ContextoValor = { prefijo: string; estado: EstadoFormulario };

const ContextoFormulario = createContext<ContextoValor>({ prefijo: 'f', estado: ESTADO_INICIAL });

export function useCampo(nombre: string) {
  const { prefijo, estado } = useContext(ContextoFormulario);
  const id = `${prefijo}-${nombre.replace(/[^\w-]/g, '_')}`;
  return { id, error: estado.errores[nombre] };
}

type Propiedades = {
  accion: AccionFormulario;
  boton: string;
  children: ReactNode;
  reiniciar?: boolean;
  columnas?: boolean;
  alGuardar?: (estado: EstadoFormulario) => void;
  extraAcciones?: ReactNode;
};

export function Formulario({ accion, boton, children, reiniciar = false, columnas = false, alGuardar, extraAcciones }: Propiedades) {
  const [estado, despachar, enviando] = useActionState(accion, ESTADO_INICIAL);
  const prefijo = useId().replace(/:/g, '');
  const formulario = useRef<HTMLFormElement>(null);
  const alGuardarRef = useRef(alGuardar);
  const router = useRouter();

  useEffect(() => {
    alGuardarRef.current = alGuardar;
  });

  useEffect(() => {
    if (estado.resultado !== 'ok') return;
    if (reiniciar) formulario.current?.reset();
    alGuardarRef.current?.(estado);
    if (estado.datos?.destino) router.push(estado.datos.destino as Route);
  }, [estado, reiniciar, router]);

  return (
    <ContextoFormulario.Provider value={{ prefijo, estado }}>
      <form
        ref={formulario}
        className={`${estilos.formulario} ${columnas ? estilos.columnas : ''}`}
        onSubmit={(evento) => {
          evento.preventDefault();
          const datos = new FormData(evento.currentTarget);
          startTransition(() => despachar(datos));
        }}
      >
        {children}
        <div className={estilos.pieFormulario}>
          <button type="submit" className={estilos.boton} disabled={enviando}>
            {enviando ? 'Guardando…' : boton}
          </button>
          {extraAcciones}
          {estado.resultado !== 'inicial' && !enviando && (
            <p
              key={estado.vez}
              className={estado.resultado === 'ok' ? estilos.ok : estilos.error}
              role={estado.resultado === 'ok' ? 'status' : 'alert'}
            >
              {estado.mensaje}
            </p>
          )}
        </div>
      </form>
    </ContextoFormulario.Provider>
  );
}
