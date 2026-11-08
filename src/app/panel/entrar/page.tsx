import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Logotipo } from '@/componentes/Logotipo';
import { obtenerSesion } from '@/lib/sesion';
import estilos from '../panel.module.css';
import { FormularioEntrar } from './FormularioEntrar';

export const metadata: Metadata = {
  title: 'Entrar al panel',
  robots: { index: false, follow: false },
};

export default async function EntrarPagina() {
  const sesion = await obtenerSesion();
  if (sesion?.user.activo) redirect('/panel');

  return (
    <main className={estilos.pantalla}>
      <div className={estilos.tarjeta}>
        <div className={estilos.marca}>
          <Logotipo tamano={56} className={estilos.escudo} decorativo />
          <div>
            <p className={estilos.antetitulo}>Liga de Beisbol Navojoa Ejidal</p>
            <h1 className={estilos.tituloTarjeta}>Panel de la liga</h1>
          </div>
        </div>
        <FormularioEntrar />
      </div>
    </main>
  );
}
