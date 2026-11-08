import { and, asc, eq, isNotNull, or } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BotonAccion } from '@/app/panel/componentes/BotonAccion';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { AreaTexto, Casilla, Grupo, Seleccion, Texto } from '@/app/panel/componentes/Entradas';
import { db } from '@/db/conexion';
import { ajustesTabla, encuentros, equipos, jornadas, juegos } from '@/db/esquema';
import { obtenerEquipos, obtenerReglas, obtenerTemporadaVigente } from '@/lib/consultas/liga';
import { CRITERIOS_DESEMPATE } from '@/lib/panel/catalogos';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../panel.module.css';
import { CabeceraPagina, SinTemporada } from '../componentes';
import { agregarAjuste, eliminarAjuste, guardarReglas } from './acciones';

export const metadata: Metadata = { title: 'Reglas de la tabla' };

const ESTADOS: Record<string, string> = {
  forfeit: 'forfeit',
  suspendido: 'suspendido',
  pospuesto: 'pospuesto',
  cancelado: 'cancelado',
};

export default async function Reglas() {
  await exigirAdministrador();
  const temporada = await obtenerTemporadaVigente();
  if (!temporada) {
    return (
      <>
        <CabeceraPagina titulo="Reglas de la tabla" />
        <SinTemporada />
      </>
    );
  }
  const [reglas, listaEquipos, ajustes, especiales] = await Promise.all([
    obtenerReglas(temporada.id),
    obtenerEquipos(temporada.id),
    db
      .select({ id: ajustesTabla.id, equipo: equipos.nombre, ganados: ajustesTabla.ganados, perdidos: ajustesTabla.perdidos, motivo: ajustesTabla.motivo })
      .from(ajustesTabla)
      .innerJoin(equipos, eq(ajustesTabla.equipoId, equipos.id))
      .where(eq(ajustesTabla.temporadaId, temporada.id))
      .orderBy(asc(ajustesTabla.creadoEn)),
    db
      .select({
        jornada: jornadas.numero,
        juego: juegos.numero,
        estado: juegos.estado,
        cuenta: juegos.cuentaParaTabla,
        nota: juegos.notaPublica,
        local: encuentros.localId,
        visitante: encuentros.visitanteId,
      })
      .from(juegos)
      .innerJoin(encuentros, eq(juegos.encuentroId, encuentros.id))
      .innerJoin(jornadas, eq(encuentros.jornadaId, jornadas.id))
      .where(
        and(
          eq(jornadas.temporadaId, temporada.id),
          or(eq(juegos.cuentaParaTabla, false), isNotNull(juegos.notaPublica), eq(juegos.estado, 'suspendido'), eq(juegos.estado, 'pospuesto'), eq(juegos.estado, 'cancelado')),
        ),
      )
      .orderBy(asc(jornadas.numero), asc(encuentros.orden), asc(juegos.numero)),
  ]);
  const nombre = new Map(listaEquipos.map((e) => [e.id, e.nombre]));
  const criterios = reglas.criteriosDesempate;
  const opcionesCriterio = CRITERIOS_DESEMPATE.map((c) => ({ valor: c.valor, texto: c.texto }));

  return (
    <>
      <CabeceraPagina antetitulo={`Temporada ${temporada.nombre}`} titulo="Reglas de la tabla">
        <p>Estas reglas deciden cómo se calcula la tabla de posiciones. Al guardar, la tabla del sitio se recalcula.</p>
      </CabeceraPagina>

      <Formulario accion={guardarReglas} boton="Guardar reglas">
        <input type="hidden" name="temporadaId" value={temporada.id} />
        <Grupo titulo="Encuentros">
          <Texto
            nombre="juegosPorEncuentro"
            etiqueta="Juegos por encuentro"
            tipo="number"
            minimo={1}
            maximoNumero={3}
            valor={reglas.juegosPorEncuentro}
            ayuda="Cuántos juegos se crean al agregar un encuentro nuevo. Cada encuentro se puede cambiar en el calendario."
            ancho="corto"
          />
          <Casilla
            nombre="permiteEmpates"
            etiqueta="Se permiten empates"
            marcada={reglas.permiteEmpates}
            ayuda="El empate cuenta como juego jugado pero no entra al promedio."
          />
        </Grupo>
        <Grupo titulo="Forfeit" ayuda="Marcador que se da cuando un equipo no se presenta.">
          <Texto nombre="forfeitCarrerasGanador" etiqueta="Carreras del ganador" tipo="number" minimo={0} maximoNumero={30} valor={reglas.forfeitCarrerasGanador} ancho="corto" />
          <Texto nombre="forfeitCarrerasPerdedor" etiqueta="Carreras del perdedor" tipo="number" minimo={0} maximoNumero={30} valor={reglas.forfeitCarrerasPerdedor} ancho="corto" />
          <Casilla
            nombre="forfeitCuentaCarreras"
            etiqueta="Las carreras del forfeit cuentan para la tabla"
            marcada={reglas.forfeitCuentaCarreras}
            ayuda="Si no se marca, el juego cuenta como ganado y perdido, pero sus carreras no suman a favor ni en contra."
          />
        </Grupo>
        <Grupo titulo="Desempate" ayuda="Si dos equipos quedan igual, se comparan en este orden. Al final, por nombre.">
          {[1, 2, 3, 4].map((n) => (
            <Seleccion
              key={n}
              nombre={`criterio${n}`}
              etiqueta={`Criterio ${n}`}
              opciones={opcionesCriterio}
              vacio={n === 1 ? undefined : 'Ninguno'}
              valor={criterios[n - 1] ?? ''}
              ancho="medio"
            />
          ))}
        </Grupo>
      </Formulario>

      <section className={estilos.seccion} aria-labelledby="titulo-especiales">
        <h2 id="titulo-especiales" className={estilos.subtitulo}>
          Juegos con caso especial
        </h2>
        <p>Se marcan al capturar el resultado, en la opción «Caso especial» de cada encuentro.</p>
        {especiales.length === 0 ? (
          <p className={estilos.vacio}>Ningún juego tiene caso especial.</p>
        ) : (
          <ul className={estilos.filas}>
            {especiales.map((e, i) => (
              <li key={i} className={estilos.fila}>
                <div className={estilos.filaPrincipal}>
                  <span className={estilos.filaTitulo}>
                    <Link prefetch={false} href={`/panel/resultados/${e.jornada}`}>
                      Jornada {e.jornada}, juego {e.juego}
                    </Link>
                    : {nombre.get(e.visitante)} en {nombre.get(e.local)}
                  </span>
                  <span className={estilos.filaDetalle}>
                    {[!e.cuenta ? 'no cuenta para la tabla' : null, ESTADOS[e.estado], e.nota].filter(Boolean).join(' · ')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={estilos.seccion} aria-labelledby="titulo-ajustes">
        <h2 id="titulo-ajustes" className={estilos.subtitulo}>
          Ajustes a la tabla
        </h2>
        <p>Para sanciones o acuerdos de la liga. Se suman a lo que dan los resultados y el motivo se publica en la página de posiciones.</p>
        {ajustes.length > 0 && (
          <ul className={estilos.filas}>
            {ajustes.map((a) => (
              <li key={a.id} className={estilos.fila}>
                <div className={estilos.filaPrincipal}>
                  <span className={estilos.filaTitulo}>
                    {a.equipo}: {a.ganados > 0 ? '+' : ''}
                    {a.ganados} ganados, {a.perdidos > 0 ? '+' : ''}
                    {a.perdidos} perdidos
                  </span>
                  <span className={estilos.filaDetalle}>{a.motivo}</span>
                </div>
                <BotonAccion accion={eliminarAjuste.bind(null, a.id)} texto="Quitar" confirmar="¿Quitar este ajuste de la tabla?" peligro />
              </li>
            ))}
          </ul>
        )}
        <Formulario accion={agregarAjuste} boton="Agregar ajuste" columnas reiniciar>
          <input type="hidden" name="temporadaId" value={temporada.id} />
          <Seleccion nombre="equipoId" etiqueta="Equipo" vacio="Elige" requerido opciones={listaEquipos.map((e) => ({ valor: String(e.id), texto: e.nombre }))} ancho="medio" />
          <Texto nombre="ganados" etiqueta="Ganados" tipo="number" valor={0} minimo={-20} maximoNumero={20} ancho="corto" ayuda="Negativo para restar." />
          <Texto nombre="perdidos" etiqueta="Perdidos" tipo="number" valor={0} minimo={-20} maximoNumero={20} ancho="corto" />
          <AreaTexto nombre="motivo" etiqueta="Motivo" requerido maximo={300} filas={2} />
        </Formulario>
      </section>
    </>
  );
}
