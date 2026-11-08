'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { authCliente } from '@/lib/auth-cliente';
import estilos from '../panel.module.css';

const MENSAJES = {
  credenciales: 'Usuario o contraseña incorrectos.',
  bloqueo: 'Demasiados intentos. Espera 15 minutos y vuelve a intentarlo.',
  red: 'No se pudo conectar. Revisa tu conexión y vuelve a intentarlo.',
};

export function FormularioEntrar() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    setEnviando(true);
    setError('');
    try {
      const { error: fallo } = await authCliente.signIn.username({
        username: String(datos.get('usuario') ?? '').trim(),
        password: String(datos.get('contrasena') ?? ''),
      });
      if (fallo) {
        setError(fallo.status === 429 ? MENSAJES.bloqueo : MENSAJES.credenciales);
        setEnviando(false);
        return;
      }
      router.replace('/panel');
      router.refresh();
    } catch {
      setError(MENSAJES.red);
      setEnviando(false);
    }
  }

  return (
    <form className={estilos.formulario} onSubmit={entrar} noValidate>
      <label className={estilos.campo} htmlFor="usuario">
        Usuario
        <input
          id="usuario"
          name="usuario"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
        />
      </label>
      <label className={estilos.campo} htmlFor="contrasena">
        Contraseña
        <input id="contrasena" name="contrasena" type="password" autoComplete="current-password" required />
      </label>
      {error && (
        <p className={estilos.error} role="alert">
          {error}
        </p>
      )}
      <button className={estilos.boton} type="submit" disabled={enviando}>
        {enviando ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
