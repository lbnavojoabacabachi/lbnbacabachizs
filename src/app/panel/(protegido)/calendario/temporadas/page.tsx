import { asc, desc } from 'drizzle-orm';
import type { Metadata } from 'next';
import { BotonAccion } from '@/app/panel/componentes/BotonAccion';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { Casilla, CasillasMultiples, Seleccion, Texto } from '@/app/panel/componentes/Entradas';
import { db } from '@/db/conexion';
import { equipos, temporadaEquipos, temporadas } from '@/db/esquema';
import { formatearFecha } from '@/lib/fechas';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../../panel.module.css';
import { CabeceraPagina, Volver } from '../../componentes';
import { crearTemporada, guardarTemporada, marcarVigente } from '../acciones';

export const metadata: Metadata = { title: 'Temporadas' };

const ESTADOS = [
  { valor: 'preparacion', texto: 'En preparación' },
  { valor: 'regular', texto: 'Temporada regular' },
  { valor: 'postemporada', texto: 'Postemporada' },
  { valor: 'terminada', texto: 'Terminada' },
];

export default async function Temporadas() {
  await exigirAdministrador();
  const [lista, todosLosEquipos, participaciones] = await Promise.all([
    db.select().from(temporadas).orderBy(desc(temporadas.inicio)),
    db.select({ id: equipos.id, nombre: equipos.nombre, activo: equipos.activo }).from(equipos).orderBy(asc(equipos.nombre)),
    db.select().from(temporadaEquipos),
  ]);
  const vigente = lista.find((t) => t.vigente) ?? null;
  const opciones = todosLosEquipos.map((e) => ({ valor: String(e.id), texto: e.nombre }));
  const deVigente = vigente ? participaciones.filter((p) => p.temporadaId === vigente.id).map((p) => String(p.equipoId)) : [];
  const activos = todosLosEquipos.filter((e) => e.activo).map((e) => String(e.id));

  return (
    <>
      <Volver href="/panel/calendario" texto="Calendario" />
      <CabeceraPagina titulo="Temporadas">
        <p>El sitio y el panel trabajan con la temporada vigente. Las anteriores se conservan con sus resultados.</p>
      </CabeceraPagina>

      <ul className={estilos.filas}>
        {lista.map((t) => (
          <li key={t.id} className={estilos.fila}>
            <div className={estilos.filaPrincipal}>
              <span className={estilos.filaTitulo}>Temporada {t.nombre}</span>
              <span className={estilos.filaDetalle}>
                Desde el {formatearFecha(t.inicio, { diaSemana: false })}
                {t.fin ? ` hasta el ${formatearFecha(t.fin, { diaSemana: false })}` : ''} ·{' '}
                {participaciones.filter((p) => p.temporadaId === t.id).length} equipos
              </span>
            </div>
            {t.vigente ? (
              <span className={estilos.etiquetaOk}>Vigente</span>
            ) : (
              <BotonAccion
                accion={marcarVigente.bind(null, t.id)}
                texto="Marcar como vigente"
                confirmar={`El sitio va a mostrar la temporada ${t.nombre}. ¿Continuar?`}
              />
            )}
          </li>
        ))}
      </ul>

      {vigente && (
        <section className={estilos.seccion} aria-labelledby="titulo-vigente">
          <h2 id="titulo-vigente" className={estilos.subtitulo}>
            Temporada vigente: {vigente.nombre}
          </h2>
          <Formulario accion={guardarTemporada} boton="Guardar temporada" columnas>
            <input type="hidden" name="id" value={vigente.id} />
            <Texto nombre="inicio" etiqueta="Inicio" tipo="date" valor={vigente.inicio} requerido ancho="corto" />
            <Texto nombre="fin" etiqueta="Fin" tipo="date" valor={vigente.fin} ancho="corto" />
            <Seleccion nombre="estado" etiqueta="Estado" opciones={ESTADOS} valor={vigente.estado} ancho="corto" />
            <CasillasMultiples nombre="equipos" etiqueta="Equipos que participan" opciones={opciones} marcadas={deVigente} />
          </Formulario>
        </section>
      )}

      <section className={estilos.seccion} aria-labelledby="titulo-nueva">
        <h2 id="titulo-nueva" className={estilos.subtitulo}>
          Nueva temporada
        </h2>
        <p>Copia las reglas de la tabla de la temporada vigente. Los equipos nuevos se dan de alta en Equipos.</p>
        <Formulario accion={crearTemporada} boton="Crear temporada" columnas reiniciar>
          <Texto nombre="nombre" etiqueta="Nombre" requerido maximo={40} marcador="2026-2027" ancho="corto" />
          <Texto nombre="inicio" etiqueta="Inicio" tipo="date" requerido ancho="corto" />
          <Texto nombre="fin" etiqueta="Fin" tipo="date" ancho="corto" />
          <CasillasMultiples nombre="equipos" etiqueta="Equipos que participan" opciones={opciones} marcadas={activos} />
          <Casilla nombre="vigente" etiqueta="Hacerla la temporada vigente" ayuda="El sitio pasa a mostrar esta temporada en cuanto la guardes." />
        </Formulario>
      </section>
    </>
  );
}
