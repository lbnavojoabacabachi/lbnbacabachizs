import { asc, desc, eq, max } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BotonAccion } from '@/app/panel/componentes/BotonAccion';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { Texto } from '@/app/panel/componentes/Entradas';
import { db } from '@/db/conexion';
import { session, user } from '@/db/esquema';
import { capitalizar, formatearInstante } from '@/lib/fechas';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../panel.module.css';
import { CabeceraPagina } from '../componentes';
import { activarUsuario, crearUsuario, restablecerUsuario } from './acciones';

export const metadata: Metadata = { title: 'Usuarios' };

export default async function UsuariosPanel() {
  const sesion = await exigirAdministrador();
  const lista = await db
    .select({
      id: user.id,
      nombre: user.displayUsername,
      usuario: user.username,
      activo: user.activo,
      debeCambiar: user.debeCambiarContrasena,
      ultimaSesion: max(session.createdAt),
    })
    .from(user)
    .leftJoin(session, eq(session.userId, user.id))
    .groupBy(user.id)
    .orderBy(desc(user.activo), asc(user.username));

  return (
    <>
      <CabeceraPagina
        titulo="Usuarios"
        accion={
          <Link prefetch={false} href="/panel/contrasena" className={estilos.enlaceVolver}>
            Cambiar mi contraseña
          </Link>
        }
      >
        <p>Todos los usuarios son administradores y pueden usar todo el panel. Tras 5 intentos fallidos, el acceso se bloquea 15 minutos.</p>
      </CabeceraPagina>
      <ul className={estilos.filas}>
        {lista.map((u) => {
          const yo = u.id === sesion.user.id;
          return (
            <li key={u.id} className={estilos.fila}>
              <div className={estilos.filaPrincipal}>
                <span className={estilos.filaTitulo}>
                  {u.nombre ?? u.usuario}
                  {yo ? ' (tú)' : ''}
                </span>
                <span className={estilos.filaDetalle}>
                  Usuario: {u.usuario}
                  {u.debeCambiar ? ' · todavía tiene la clave temporal' : ''}
                  {u.ultimaSesion ? ` · última entrada: ${capitalizar(formatearInstante(u.ultimaSesion, { diaSemana: false }))}` : ''}
                </span>
              </div>
              <span className={u.activo ? estilos.etiquetaOk : estilos.etiquetaNeutra}>{u.activo ? 'Activo' : 'Desactivado'}</span>
              {!yo && (
                <div className={estilos.filaAcciones}>
                  <BotonAccion
                    accion={restablecerUsuario.bind(null, u.id)}
                    texto="Restablecer contraseña"
                    confirmar={`¿Darle a ${u.nombre ?? u.usuario} una clave temporal nueva? Se cerrarán sus sesiones.`}
                    mostrarResultado
                  />
                  {u.activo ? (
                    <BotonAccion
                      accion={activarUsuario.bind(null, u.id, false)}
                      texto="Desactivar"
                      confirmar={`¿Desactivar a ${u.nombre ?? u.usuario}? Ya no podrá entrar.`}
                      peligro
                    />
                  ) : (
                    <BotonAccion accion={activarUsuario.bind(null, u.id, true)} texto="Activar" />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <section className={estilos.seccion} aria-labelledby="titulo-nuevo">
        <h2 id="titulo-nuevo" className={estilos.subtitulo}>
          Nuevo usuario
        </h2>
        <Formulario accion={crearUsuario} boton="Crear usuario" reiniciar>
          <Texto
            nombre="usuario"
            etiqueta="Nombre de usuario"
            requerido
            maximo={30}
            ayuda="Sin espacios ni acentos, por ejemplo Capturista1. Se le mostrará aquí una clave temporal."
          />
        </Formulario>
      </section>
    </>
  );
}
