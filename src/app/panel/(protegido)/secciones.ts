import type { Route } from 'next';

export type Seccion = { href: Route; texto: string; detalle: string; grupo: 'Juegos' | 'Liga' | 'Contenido' | 'Sitio' };

export const SECCIONES: Seccion[] = [
  { href: '/panel/resultados', texto: 'Resultados', detalle: 'Marcador de cada juego, forfeits y juegos que no cuentan.', grupo: 'Juegos' },
  { href: '/panel/calendario', texto: 'Calendario', detalle: 'Jornadas, encuentros, fechas, quién descansa y temporadas.', grupo: 'Juegos' },
  { href: '/panel/reglas', texto: 'Reglas de la tabla', detalle: 'Forfeit, desempate y ajustes a la tabla con motivo.', grupo: 'Juegos' },
  { href: '/panel/equipos', texto: 'Equipos', detalle: 'Plantillas, altas y bajas, cuerpo técnico y logotipos.', grupo: 'Liga' },
  { href: '/panel/estadisticas', texto: 'Estadísticas', detalle: 'Bateo y pitcheo por jugador.', grupo: 'Liga' },
  { href: '/panel/noticias', texto: 'Noticias', detalle: 'Notas con foto; se pueden dejar en borrador.', grupo: 'Contenido' },
  { href: '/panel/eventos', texto: 'Eventos', detalle: 'Fecha, sede y cartel; se ocultan solos al pasar.', grupo: 'Contenido' },
  { href: '/panel/galeria', texto: 'Galería', detalle: 'Álbumes y fotos, que se optimizan al subirlas.', grupo: 'Contenido' },
  { href: '/panel/transmisiones', texto: 'En vivo', detalle: 'Transmisiones de YouTube o Facebook.', grupo: 'Contenido' },
  { href: '/panel/redes', texto: 'Redes', detalle: 'Publicaciones que se muestran en el sitio.', grupo: 'Contenido' },
  { href: '/panel/patrocinadores', texto: 'Patrocinadores', detalle: 'Logotipos y enlaces.', grupo: 'Sitio' },
  { href: '/panel/documentos', texto: 'Documentos', detalle: 'Reglamento y formatos en PDF.', grupo: 'Sitio' },
  { href: '/panel/contacto', texto: 'Contacto y perfiles', detalle: 'Teléfono, correo, dirección y redes de la liga.', grupo: 'Sitio' },
  { href: '/panel/usuarios', texto: 'Usuarios', detalle: 'Crear, desactivar y restablecer contraseñas.', grupo: 'Sitio' },
  { href: '/panel/bitacora', texto: 'Bitácora', detalle: 'Quién cambió qué y cuándo.', grupo: 'Sitio' },
];
