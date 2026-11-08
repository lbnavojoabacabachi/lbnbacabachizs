# Sitio de la Liga de Beisbol Navojoa Ejidal, Zona Sur Bacabachi: guía para Claude Code

Sitio público de la liga (resultados, calendario, posiciones, estadísticas, equipos, noticias, galería, redes y transmisiones en vivo) y panel con usuario y contraseña para actualizarlo. Next.js en Vercel, datos en Neon (PostgreSQL local en desarrollo).

- **Dueño:** Manuel Quintana.
- **Plan completo:** https://claude.ai/artifact/5kkzb9NUcqkQpCxP7gTF68 (análisis, stack, estilo visual, fases y decisiones).
- **Rama de trabajo:** `rediseno`. `main` sigue publicando el sitio anterior en GitHub Pages (ligabeisbolbacabachi.com) hasta el lanzamiento.
- **`legado/`:** el sitio anterior completo. La migración de datos (fase 2) lee de ahí; se borra al lanzar.

## Estado al 7 de noviembre de 2026

| Fase | Estado |
| --- | --- |
| 0. Decisiones y cuentas | Rama creada. Vercel y Neon todavía no (se crean al tener algo que ver en línea) |
| 1. Base | Hecha: Next.js 16, tokens y tipografías, esquema en Drizzle con migración inicial, Better Auth con usuario y contraseña, cambio obligatorio de la clave temporal, bitácora, límite de intentos y revisión de reglas en `prebuild` |
| 2. Migración de datos | Hecha salvo estadísticas (esperan D5): `npm run migrar:legado` importa equipos, 219 jugadores, cuerpo técnico, 18 jornadas, 72 encuentros, noticia, evento, álbumes, patrocinadores y contacto. La tabla calculada coincide fila por fila con la del sitio anterior. Reporte en `reportes/migracion-legado.md` |
| 3. Imágenes | Hecha: subida en `/api/imagenes` (el navegador reduce a 2400 px; el servidor crea tres tamaños WebP sin metadatos) y `npm run migrar:imagenes`, que bajó las imágenes del sitio anterior de 227 MB (144 archivos) a 23.7 MB (234 WebP de 78 imágenes) y las ligó a equipos, patrocinadores, noticia, evento y álbumes. En local se guardan en `.medios/`; en Vercel, en Blob |
| 4. Sitio público | Hecha: portada, calendario, jornada con imagen para compartir, posiciones con racha, equipos, altas y bajas, estadísticas (espera D5), noticias, galería con foto ampliada, en vivo, redes, documentos, contacto, 404, redirecciones del sitio anterior, mapa del sitio y metadatos. Páginas en caché una hora. `npm run auditar:ui`: 0 problemas de axe-core en 18 páginas, 4 anchos, claro y oscuro; portada de 324 KB en celular |
| 5. Panel | Hecha salvo estadísticas (esperan D5): inicio con pendientes, resultados, calendario y temporadas, reglas y ajustes, equipos y plantillas, noticias, eventos, galería, en vivo, redes, patrocinadores, documentos, contacto, usuarios y bitácora. Prueba de punta a punta de 19 pasos y `npm run auditar:ui` con el panel: 0 problemas en 370 revisiones |
| 6. Lanzamiento | Pendiente |

## Reglas que no se negocian

1. **Cero comentarios en el código.** Ni en TypeScript, TSX, JavaScript, CSS, SQL, JSON, `.gitignore` ni `.env.example`. Los nombres explican el código; el porqué va en `docs/codigo.md` y se actualiza en el mismo cambio. `npm run verificar` lo revisa y `npm run build` falla si encuentra uno.
2. **Cero emojis** en el código, la interfaz y los datos. En pruebas que los necesiten se escriben como secuencias de escape (`'\u{1F44B}'`). Los íconos son SVG.
3. **Todo en español:** interfaz, mensajes, documentación, commits y nombres del dominio en el código (`temporadas`, `exigirAdministrador`). Excepción: las tablas de Better Auth (`user`, `session`, `account`, `verification`, `rate_limit`) conservan sus nombres.
4. **Fechas de nacimiento solo en el panel.** Viven en `datos_privados_jugador`; ninguna página pública ni consulta pública las lee.
5. **Acceso al panel solo con usuario y contraseña**, sin registro público. Hoy hay dos administradores con todo el panel: Cope y LigaAdmin. Toda página y acción del panel llama a `exigirAdministrador()`.
6. **Nada se publica sin pasar por el panel**, y cada cambio queda en la bitácora.
7. **Imágenes:** toda imagen entra por `registrarImagen()` (tres tamaños WebP, sin metadatos) y se guarda con `guardarArchivo()`. Nunca se guarda ni se publica un original. La carpeta local es siempre `.medios/` dentro del proyecto: una ruta calculada con variables de entorno hace que Next empaquete todo el proyecto en las funciones.
8. **Identidad "pizarra y cal":** colores como tokens en `src/app/globals.css` y ningún color literal fuera de `:root` (única excepción: la copia de los tokens en `src/lib/compartir/recursos.ts`, porque el generador de imágenes no lee CSS). Tipografías Big Shoulders (títulos y marcadores), Sofia Sans (texto) y Sofia Sans Semi Condensed (tablas).
9. **Interfaz responsiva** desde 320 px, en modo claro y oscuro, sin desbordamiento horizontal; controles principales de 44 px o más. Todo cambio de interfaz pasa `npm run auditar:ui` sin problemas y se revisan sus capturas.
10. **Dependencias con versión exacta** y al menos 10 días de publicadas.
11. **Datos del celular:** los `Link` públicos llevan `prefetch={false}`, las imágenes llevan `srcset` y `sizes` reales, y los videos y publicaciones de redes solo cargan al tocarlos. La portada pesa menos de 600 KB en la primera carga.

## Comandos

```bash
npm run db:iniciar        # arranca el PostgreSQL local (y db:detener, db:estado)
npm run db:preparar       # crea el rol y la base de DATABASE_URL (una sola vez)
npm run db:generar -- --name <nombre>   # nueva migración desde el esquema
npm run db:migrar         # aplica migraciones
npm run admins:crear -- Cope LigaAdmin  # crea administradores; --restablecer da clave temporal nueva
npm run migrar:legado     # importa legado/ (con --reemplazar borra los datos de la liga y vuelve a importar)
npm run migrar:imagenes   # optimiza las imágenes de legado/ y las liga; correr después de migrar:legado
npm run dev               # http://localhost:3000 (panel en /panel)
npm run verificar         # sin comentarios ni emojis
npm run typecheck && npm run lint && npm test
npm run build             # corre verificar antes
npm start                 # sirve la compilación en http://localhost:3000
npm run auditar:ui        # con npm start corriendo: axe-core, desbordamiento, errores y peso; reporte y capturas en reportes/
                          # con AUDITORIA_USUARIO y AUDITORIA_CLAVE también revisa el panel (usar un administrador temporal)
```

Las claves temporales se agregan a `~/.liga-claves-temporales.txt`, nunca se imprimen.

## Estructura

```
src/app/(publico)/       sitio público: layout (cabecera, menú, pie), una carpeta por página, [...resto] para el 404
src/app/compartir/[id]/  imagen en JPEG para og:image (las variantes son WebP)
src/app/opengraph-image  imagen para compartir del sitio; la de cada jornada vive en jornadas/[numero]/
src/app/panel/           entrar, contrasena y (protegido)/ con el panel: una carpeta por sección con page.tsx y acciones.ts
src/app/panel/componentes/  Formulario (useActionState sin reinicio), Entradas, CampoImagen (sube al elegir), BotonAccion (con confirmación)
src/lib/panel/           acciones (exigir, validar, bitácora, publicar), campos (Zod), resultados (captura), catalogos, estado
src/lib/usuarios.ts      crear administradores, restablecer clave, activar; lo usan el panel y admins:crear
src/app/api/documentos/  subida de PDF (solo administradores)
src/app/api/auth/        manejador de Better Auth
src/app/api/imagenes/    subida de imágenes (solo administradores)
src/app/medios/          sirve las imágenes guardadas en .medios/ cuando no hay Blob (desarrollo)
src/lib/imagenes/        procesar (sharp), almacen (local o Blob), registrar, subir-cliente (reduce en el navegador)
src/db/esquema/          tablas por tema: autenticacion, liga, juegos, contenido, imagenes, bitacora
src/db/conexion.ts       pool de pg y drizzle
src/lib/                 auth, auth-cliente, sesion (exigirSesion, exigirAdministrador), bitacora, nombres, posiciones
src/lib/consultas/       lecturas de la base para el sitio: liga (temporada, calendario, equipos, plantillas), contenido, posiciones
src/lib/                 además: fechas (hora de Sonora), jornadas (resultado, resumen, rachas), incrustar (YouTube, Facebook, Instagram, TikTok), sitio (SITIO_URL), compartir/ (imagen 1200 × 630)
src/componentes/         Marcador, TablaPosiciones, ListaEncuentros, Imagen (srcset), Escudo, Galeria, Incrustado, Tarjetas, PublicacionRed, Encabezado, Iconos (SVG)
assets/                  tipografías TTF y logotipo PNG para las imágenes de compartir
scripts/                 verificar-reglas, postgres-local, crear-administradores, migrar-legado (y lib/legado.ts), migrar-imagenes, auditar-ui
tests/                   Vitest
drizzle/                 migraciones generadas (sin comentarios)
docs/codigo.md           el porqué del código
legado/                  sitio anterior
```

## Decisiones

| | Decisión | Estado |
| --- | --- | --- |
| D1 | Vercel Hobby (gratuito) | Resuelta |
| D2 | Fechas de nacimiento solo en el panel | Resuelta |
| D3 | Contacto real | La liga creará uno; se captura en el panel |
| D4 | Reglas de la tabla configurables con casos especiales | Resuelta. Valores iniciales: los del sitio anterior (forfeit 7-0 sin contar carreras; desempate por AVE y diferencia de carreras). Falta confirmar si la jornada 2 fue de un solo juego |
| D5 | Significado de las columnas de estadísticas | Pendiente |
| D6 | Venados de Batayaqui; nombres con acentos | Resuelta. 20 nombres esperan confirmación de los delegados (sección "Para confirmar" del reporte) |
| | Dominio ligabeisbolbacabachi.com | El DNS lo administra Manuel; se cambia en la fase 6 |
| D7 | Dos administradores (Cope, LigaAdmin) con todo el panel | Resuelta |
| D8 | Mismo repositorio, rama `rediseno` | Resuelta |

## Pendientes que afectan el código

- Estadísticas: las tablas de bateo y pitcheo, la página pública de líderes y la captura en el panel se hacen cuando se resuelva D5. Hoy ambas pantallas lo explican.
- Toda acción del panel que cambie algo público debe llamar a `revalidatePath('/', 'layout')`: las páginas públicas están en caché una hora.
- Vercel (proyecto `lbnbacabachizs` del equipo cope4): Neon y Blob conectados (crean `DATABASE_URL`, `DATABASE_URL_UNPOOLED` y `BLOB_STORE_ID`). Faltan `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` y `SITIO_URL`. La compilación de producción aplica las migraciones; la primera carga usa `CARGAR_SITIO_ANTERIOR` y `ADMINS_INICIALES`, que se quitan después (ver docs/codigo.md, sección Vercel). Después correr `db:migrar`, `admins:crear`, `migrar:legado` y `migrar:imagenes` contra Neon.
