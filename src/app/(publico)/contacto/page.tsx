import type { Metadata } from 'next';
import { Encabezado, Vacio } from '@/componentes/Encabezado';
import { obtenerConfiguracion } from '@/lib/consultas/contenido';
import { perfilesDeRedes } from '@/lib/redes';
import estilos from '../publico.module.css';
import estilosContacto from './contacto.module.css';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Teléfono, dirección y redes de la Liga de Beisbol Navojoa Ejidal, Zona Sur Bacabachi.',
  alternates: { canonical: '/contacto' },
};

export default async function Contacto() {
  const configuracion = await obtenerConfiguracion();
  const perfiles = perfilesDeRedes(configuracion);
  const hayDatos = Boolean(
    configuracion?.telefonoContacto || configuracion?.correoContacto || configuracion?.direccion || perfiles.length,
  );

  return (
    <>
      <Encabezado titulo="Contacto">
        <p>Para dudas sobre la liga, los registros de jugadores o los patrocinios.</p>
      </Encabezado>
      {!hayDatos ? (
        <Vacio titulo="Datos de contacto por publicar" />
      ) : (
        <dl className={estilosContacto.datos}>
          {configuracion?.telefonoContacto && (
            <div>
              <dt>Teléfono</dt>
              <dd>
                <a href={`tel:${configuracion.telefonoContacto.replace(/[^\d+]/g, '')}`}>{configuracion.telefonoContacto}</a>
              </dd>
            </div>
          )}
          {configuracion?.correoContacto && (
            <div>
              <dt>Correo</dt>
              <dd>
                <a href={`mailto:${configuracion.correoContacto}`}>{configuracion.correoContacto}</a>
              </dd>
            </div>
          )}
          {configuracion?.direccion && (
            <div>
              <dt>Dirección</dt>
              <dd>{configuracion.direccion}</dd>
            </div>
          )}
          {configuracion?.horario && (
            <div>
              <dt>Horario</dt>
              <dd>{configuracion.horario}</dd>
            </div>
          )}
          {perfiles.map((p) => (
            <div key={p.red}>
              <dt>{p.nombre}</dt>
              <dd>
                <a href={p.url} target="_blank" rel="noopener">
                  Abrir el perfil de la liga
                  <span className="solo-lectores"> (se abre en otra pestaña)</span>
                </a>
              </dd>
            </div>
          ))}
        </dl>
      )}
      <p className={estilos.nota}>Los resultados y avisos de cada jornada se publican en este sitio y en la página de Facebook de la liga.</p>
    </>
  );
}
