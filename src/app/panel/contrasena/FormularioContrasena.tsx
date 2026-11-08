'use client';

import { useActionState } from 'react';
import estilos from '../panel.module.css';
import { cambiarContrasena, type EstadoContrasena } from './acciones';

const INICIAL: EstadoContrasena = { error: '' };

export function FormularioContrasena({ temporal }: { temporal: boolean }) {
  const [estado, accion, enviando] = useActionState(cambiarContrasena, INICIAL);

  return (
    <form className={estilos.formulario} action={accion}>
      <label className={estilos.campo} htmlFor="actual">
        {temporal ? 'Contraseña temporal' : 'Contraseña actual'}
        <input id="actual" name="actual" type="password" autoComplete="current-password" required />
      </label>
      <label className={estilos.campo} htmlFor="nueva">
        Contraseña nueva
        <span className={estilos.ayuda} id="ayuda-nueva">
          Al menos 10 caracteres. Una frase fácil de recordar funciona bien.
        </span>
        <input
          id="nueva"
          name="nueva"
          type="password"
          autoComplete="new-password"
          minLength={10}
          aria-describedby="ayuda-nueva"
          required
        />
      </label>
      <label className={estilos.campo} htmlFor="confirmacion">
        Repite la contraseña nueva
        <input id="confirmacion" name="confirmacion" type="password" autoComplete="new-password" required />
      </label>
      {estado.error && (
        <p className={estilos.error} role="alert">
          {estado.error}
        </p>
      )}
      <button className={estilos.boton} type="submit" disabled={enviando}>
        {enviando ? 'Guardando…' : 'Guardar contraseña'}
      </button>
    </form>
  );
}
