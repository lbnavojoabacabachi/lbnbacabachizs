import type { Metadata } from 'next';
import { Logotipo } from '@/componentes/Logotipo';
import { exigirSesion } from '@/lib/sesion';
import estilos from '../panel.module.css';
import { FormularioContrasena } from './FormularioContrasena';

export const metadata: Metadata = {
  title: 'Cambiar contraseña',
  robots: { index: false, follow: false },
};

export default async function ContrasenaPagina() {
  const sesion = await exigirSesion();
  const temporal = sesion.user.debeCambiarContrasena === true;

  return (
    <main className={estilos.pantalla}>
      <div className={estilos.tarjeta}>
        <div className={estilos.marca}>
          <Logotipo tamano={56} className={estilos.escudo} decorativo />
          <div>
            <p className={estilos.antetitulo}>{sesion.user.displayUsername ?? sesion.user.name}</p>
            <h1 className={estilos.tituloTarjeta}>{temporal ? 'Crea tu contraseña' : 'Cambiar contraseña'}</h1>
          </div>
        </div>
        {temporal && <p>Es tu primera vez en el panel. Cambia la contraseña temporal por una tuya.</p>}
        <FormularioContrasena temporal={temporal} />
      </div>
    </main>
  );
}
