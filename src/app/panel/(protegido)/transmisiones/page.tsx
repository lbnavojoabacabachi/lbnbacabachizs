import { desc } from 'drizzle-orm';
import type { Metadata } from 'next';
import { BotonAccion } from '@/app/panel/componentes/BotonAccion';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { Casilla, Texto } from '@/app/panel/componentes/Entradas';
import { db } from '@/db/conexion';
import { transmisiones } from '@/db/esquema';
import { clasificarTransmisiones } from '@/lib/consultas/contenido';
import { capitalizar, formatearInstante, hoyEnSonora, partesEnSonora } from '@/lib/fechas';
import { NOMBRES_RED } from '@/lib/incrustar';
import { exigirAdministrador } from '@/lib/sesion';
import estilos from '../../panel.module.css';
import { CabeceraPagina } from '../componentes';
import { cambiarEnVivo, eliminarTransmision, guardarTransmision } from './acciones';

export const metadata: Metadata = { title: 'En vivo' };

type Transmision = typeof transmisiones.$inferSelect;

function horaDe(instante: Date | null) {
  if (!instante) return null;
  const p = partesEnSonora(instante);
  return `${String(p.hora).padStart(2, '0')}:${String(p.minuto).padStart(2, '0')}`;
}

function Campos({ t }: { t: Transmision | null }) {
  return (
    <>
      <input type="hidden" name="id" value={t?.id ?? ''} />
      <Texto
        nombre="url"
        etiqueta="Enlace del video"
        tipo="url"
        valor={t?.url}
        requerido
        maximo={500}
        ayuda="De YouTube o de Facebook. Sirve el enlace del en vivo programado o el del video ya publicado."
      />
      <Texto nombre="titulo" etiqueta="Título" valor={t?.titulo} requerido maximo={140} marcador="Jornada 11: Chicos de Sinahuiza en Astros" />
      <Texto nombre="fecha" etiqueta="Fecha" tipo="date" valor={t ? partesEnSonora(t.inicio).fecha : hoyEnSonora()} requerido ancho="corto" />
      <Texto nombre="hora" etiqueta="Empieza" tipo="time" valor={horaDe(t?.inicio ?? null)} requerido ancho="corto" />
      <Texto nombre="horaFin" etiqueta="Termina" tipo="time" valor={horaDe(t?.fin ?? null)} ancho="corto" />
      <Casilla
        nombre="enVivo"
        etiqueta="Está en vivo ahora"
        marcada={t?.enVivo}
        ayuda="Muestra el aviso «En vivo» en la portada y en el menú hasta que la termines o pase la hora de fin."
      />
    </>
  );
}

function Renglon({ t, vivo }: { t: Transmision; vivo: boolean }) {
  return (
    <li className={estilos.fila}>
      <div className={estilos.filaPrincipal}>
        <span className={estilos.filaTitulo}>{t.titulo}</span>
        <span className={estilos.filaDetalle}>
          {NOMBRES_RED[t.plataforma]} · {capitalizar(formatearInstante(t.inicio))}
        </span>
      </div>
      <div className={estilos.filaAcciones}>
        {vivo ? (
          <BotonAccion accion={cambiarEnVivo.bind(null, t.id, false)} texto="Terminar" peligro />
        ) : (
          <BotonAccion accion={cambiarEnVivo.bind(null, t.id, true)} texto="Poner en vivo" />
        )}
        <BotonAccion accion={eliminarTransmision.bind(null, t.id)} texto="Eliminar" confirmar={`¿Eliminar «${t.titulo}»?`} peligro />
      </div>
      <details className={estilos.filaPrincipal}>
        <summary className={estilos.desplegable}>Editar</summary>
        <Formulario accion={guardarTransmision} boton="Guardar" columnas>
          <Campos t={t} />
        </Formulario>
      </details>
    </li>
  );
}

export default async function TransmisionesPanel() {
  await exigirAdministrador();
  const lista = await db.select().from(transmisiones).orderBy(desc(transmisiones.inicio)).limit(60);
  const { enVivo, proximas, anteriores } = clasificarTransmisiones(lista, new Date());
  const vivas = new Set(enVivo.map((t) => t.id));
  const porId = new Map(lista.map((t) => [t.id, t]));

  return (
    <>
      <CabeceraPagina titulo="En vivo">
        <p>
          Programa las transmisiones de los juegos. El video carga en el sitio hasta que el aficionado lo toca. Al empezar, toca «Poner en
          vivo» para que salga el aviso en la portada.
        </p>
      </CabeceraPagina>

      {[
        { titulo: 'Transmitiendo ahora', lista: enVivo },
        { titulo: 'Próximas', lista: proximas },
        { titulo: 'Anteriores', lista: anteriores },
      ].map((grupo) =>
        grupo.lista.length > 0 ? (
          <section key={grupo.titulo} className={estilos.seccion}>
            <h2 className={estilos.subtitulo}>{grupo.titulo}</h2>
            <ul className={estilos.filas}>
              {grupo.lista.map((t) => {
                const completa = porId.get(t.id);
                return completa ? <Renglon key={t.id} t={completa} vivo={vivas.has(t.id)} /> : null;
              })}
            </ul>
          </section>
        ) : null,
      )}

      <section className={estilos.seccion} aria-labelledby="titulo-nueva">
        <h2 id="titulo-nueva" className={estilos.subtitulo}>
          Nueva transmisión
        </h2>
        <Formulario accion={guardarTransmision} boton="Guardar transmisión" columnas reiniciar>
          <Campos t={null} />
        </Formulario>
      </section>
    </>
  );
}
