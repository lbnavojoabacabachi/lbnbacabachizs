# El porqué del código

El código no lleva comentarios. Lo que un nombre no alcanza a explicar está aquí. Cada cambio que altere una de estas decisiones actualiza este documento.

## Base de datos

- **Un solo driver (`pg`) para desarrollo y producción.** El mismo código corre contra el PostgreSQL local y contra Neon; en Vercel se usará la cadena de conexión con pooler de Neon.
- **Pool guardado en `globalThis` fuera de producción.** La recarga en caliente de `next dev` volvería a importar `conexion.ts` y abriría conexiones de más.
- **`casing: 'snake_case'`** en Drizzle y en `drizzle.config.ts`: los nombres van en camelCase en TypeScript y en snake_case en la base, sin escribir cada columna dos veces.
- **`breakpoints: false`** en `drizzle.config.ts`: drizzle-kit separa sentencias con `--> statement-breakpoint`, que es un comentario SQL. Sin esas marcas cada migración se ejecuta como un solo bloque, que PostgreSQL acepta.
- **Identidades enteras** en las tablas de la liga; textos aleatorios solo en las de Better Auth, que los genera él.
- **`datos_privados_jugador`** es una tabla aparte para que ninguna consulta pública pueda traer la fecha de nacimiento por accidente al pedir `jugadores`.
- **`temporadas_una_vigente`** es un índice único parcial: solo una temporada puede estar marcada como vigente.
- **`configuracion`** tiene una sola fila (`check id = 1`) con los datos de contacto y redes.
- **Reglas y casos especiales:** `reglas_temporada` guarda los valores de la temporada (juegos por encuentro, marcador del forfeit, si sus carreras cuentan, criterios de desempate); cada juego puede no contar para la tabla (`cuenta_para_tabla`) o tener nota pública, y `ajustes_tabla` registra sanciones con motivo y autor.

## Tabla de posiciones

- **`calcularPosiciones` es una función pura** (`src/lib/posiciones.ts`): recibe equipos, juegos, reglas y ajustes, y no toca la base. `obtenerPosiciones` (`src/lib/consultas/posiciones.ts`) solo junta los datos. Así la regla se prueba sin base de datos.
- **AVE = ganados / (ganados + perdidos):** el empate cuenta como juego jugado pero no entra al porcentaje. Es lo que hacía el sitio anterior y la prueba `tests/legado.test.ts` lo compara fila por fila.
- **JJ = JG + JP + JE**, después de aplicar los ajustes manuales, para que una sanción que suma un perdido también sume un jugado.
- **Forfeit:** el juego es para el rival. Las carreras del forfeit (7-0 por defecto) solo cuentan si `forfeit_cuenta_carreras` está activo; el sitio anterior no las contaba.
- **Desempate:** los criterios de `reglas_temporada` en orden (`ave`, `diferencia_carreras`, `carreras_favor`, `carreras_contra`, `ganados`); al final, el nombre del equipo, para que el orden nunca dependa de la base.

## Migración del sitio anterior

- **`scripts/lib/legado.ts`** lee `legado/js/data.js` en un contexto aislado de `vm` (el archivo declara constantes globales) y los JSON de `legado/data/`. Contiene además una copia del cálculo de la tabla del sitio anterior, para compararla con la nueva.
- **La migración corre en una transacción:** si algo falla, la base queda como estaba. Sin `--reemplazar` se niega a correr si ya hay una temporada.
- **Nombres:** `normalizarNombre` pone mayúscula inicial, deja en minúscula las partículas (de, del, la, y), agrega punto a las iniciales y acentúa solo las palabras de una lista conocida (Jesús, Ramírez, Gastélum…). Las palabras dudosas (Mendivil, Dorame, Carto, Aroon…) no se cambian: van a la sección "Para confirmar" del reporte. "Gonzales" se deja así porque es un apellido distinto de "González".
- **Valores que no se importan:** el correo de contacto (su dominio no existe) y el horario (texto de relleno). La fecha de nacimiento inválida 2006-09-31 se omite y se avisa.
- **`reportes/`** no se sube al repositorio: lleva nombres de personas y datos de la importación.
- **`scripts/lib/legado.ts`, `migrar-legado.ts` y `tests/legado.test.ts`** se borran junto con `legado/` al lanzar.

## Acceso al panel

- **Better Auth con el plugin de usuario.** Sus tablas conservan los nombres en inglés porque el adaptador espera esos campos; traducirlos exigía mapear cada uno.
- **Correo `usuario@usuarios.invalid`.** Better Auth exige correo; `.invalid` es un dominio reservado que nunca va a existir, así que ningún correo sale de ahí.
- **Registro público desactivado** (`disableSignUp`). Las cuentas se crean con `scripts/crear-administradores.ts`, que usa el adaptador interno de Better Auth para crear usuario y cuenta con la contraseña cifrada.
- **Clave temporal y `debe_cambiar_contrasena`.** El script genera una clave aleatoria, la agrega a `~/.liga-claves-temporales.txt` (no la imprime ni reemplaza claves anteriores aún no entregadas) y marca la cuenta; `exigirAdministrador()` manda a `/panel/contrasena` hasta que se cambie.
- **Límite de intentos:** 5 por IP cada 15 minutos en `/sign-in/username`, guardado en la tabla `rate_limit` para que funcione con varias instancias en Vercel. La IP sale de `x-forwarded-for`, que Vercel llena.
- **Gancho al crear sesión:** bloquea cuentas desactivadas (`activo = false`) y registra "Entró al panel" en la bitácora, salvo cuando la sesión nace de un cambio de contraseña (`revokeOtherSessions` crea una sesión nueva).
- **`exigirAdministrador()` en cada página y acción**, no solo en el layout: los layouts de Next.js no se vuelven a ejecutar en cada navegación ni protegen las acciones del servidor.
- **`obtenerSesion` con `cache` de React:** varias llamadas en un mismo render consultan la sesión una sola vez.

## Imágenes

- **El navegador reduce la foto a 2400 px de lado antes de subirla** (`reducirImagen`, con `createImageBitmap` y un lienzo). Una foto de 6 MB del celular sube como 1 o 2 MB: menos datos para quien sube desde el campo y siempre por debajo del límite de 4.5 MB por petición de las funciones de Vercel, sin necesitar la subida directa a Blob. El lienzo además descarta los metadatos y convierte HEIC a JPEG en Safari.
- **El servidor acepta JPEG, PNG y WebP de hasta 8 MB** (en Vercel manda el límite de 4.5 MB) y rechaza imágenes de más de 60 millones de píxeles (`limitInputPixels`), para que un archivo malicioso no agote la memoria.
- **Tres tamaños WebP por el lado más largo:** 480, 960 y 1600 px para fotos, noticias y carteles; nunca se agranda una foto pequeña. Limitar el lado más largo (y no el ancho) hace que una foto vertical pese lo mismo que una horizontal.
- **Las tarjetas no ofrecen la versión grande** (`sinGrande` en `Imagen`): una tarjeta mide a lo más 358 px, y un cartel vertical recortado a 4:3 pedía la de 1600 px en un celular de densidad 2. Con la mediana basta y la portada se ahorra unos 70 KB por cartel.
- **Logotipos cuadrados de 128, 256 y 512 px.** Si el original es casi cuadrado (3 % de tolerancia) se recorta al centro; si no, se completa a cuadrado con el color promedio de sus bordes, para no cortar partes del logotipo (los cuernos de los Venados, el sombrero de Rancheros). Un PNG con transparencia se completa con transparencia.
- **Calidad WebP 74 en fotos y 80 a 82 en carteles y logotipos**, que tienen texto. Medido con las fotos del Juego de Estrellas: de 2.5 MB a 26, 110 y 317 KB.
- **Sin metadatos:** sharp no copia EXIF, XMP ni IPTC (ubicación GPS incluida) salvo que se le pida; `.rotate()` aplica antes la orientación del celular. La prueba y el script de migración lo comprueban.
- **`colorFondo`** es el color dominante, para pintar el espacio de la foto mientras carga.
- **Nombres de archivo** `imagenes/<tipo>/<año>/<mes>/<clave>-c|m|g.webp`, con clave aleatoria: no chocan y no revelan el nombre original, que solo queda en la base.
- **Local o Blob según `BLOB_READ_WRITE_TOKEN` o `BLOB_STORE_ID`.** Sin ninguna, los archivos van a `.medios/` y los sirve `src/app/medios/[...ruta]` con caché de un año; con alguna, a Vercel Blob, y esa ruta responde 404. Al conectar Blob, Vercel ya no crea `BLOB_READ_WRITE_TOKEN` sino `BLOB_STORE_ID`: `@vercel/blob` se autentica entonces con el token OIDC que Vercel da a cada función (`VERCEL_OIDC_TOKEN`). Para usar Blob desde un script local, ese token se baja con `vercel env pull`.
- **`.medios` está fijo en el código.** Calcular la carpeta con una variable de entorno hacía que el análisis de Next considerara todo el proyecto como dependencia de la función (incluido `legado/`, 227 MB). La salida que propone Next es un comentario especial, que las reglas no permiten. `outputFileTracingExcludes` deja fuera `.medios`, `legado` y `reportes` por si acaso.
- **`registrarImagen` borra los archivos que alcanzó a guardar** si falla el registro en la base, para no dejar archivos huérfanos.
- **La migración de imágenes reconoce duplicados por su huella SHA-256:** el cartel del Juego de Estrellas es la imagen de la noticia y el cartel del evento, y las dos carpetas iguales del sitio anterior no se importan dos veces.

## Sitio público

- **Páginas en caché por una hora** (`revalidate = 3600` en el layout público). Las visitas leen HTML ya generado y Neon solo trabaja al regenerar una página, como mucho una vez por hora y solo si alguien la visita. Revalidar más seguido mantendría despierto a Neon y gastaría las horas de cómputo del plan gratuito. El panel (fase 5) llamará a `revalidatePath('/', 'layout')` al guardar, así que los cambios se ven al momento.
- **Se usa el modelo de caché anterior, no Cache Components.** Con `cacheComponents` todo lo que lee la sesión en el panel tendría que ir dentro de `Suspense`; la caché por ruta alcanza para un sitio de este tamaño.
- **`next build` lee la base** para generar las páginas (temporada, jornadas, equipos, noticias y álbumes con `generateStaticParams`). En Vercel, `DATABASE_URL` ya está disponible al compilar.
- **Consultas en `src/lib/consultas/` envueltas en `cache` de React:** la página y `generateMetadata` piden lo mismo y la base responde una sola vez. Ninguna consulta pública toca `datos_privados_jugador`.
- **`obtenerCalendario` hace tres consultas** (jornadas, encuentros, juegos) y arma el árbol en memoria con los equipos ya cargados, en lugar de unir tablas con alias para local, visitante y logotipos.
- **Enlaces sin precarga** (`prefetch={false}` en todos los `Link` públicos). Next precarga cada página enlazada que aparece en pantalla: con el menú, el pie y las tablas, la portada bajaba más de 400 KB de páginas que nadie abrió, incluido un cartel. Quien entra con datos del celular paga eso. Sin precarga, cada página tarda un poco más en abrir al tocar el enlace.
- **Fechas:** los nombres de días y meses son arreglos propios, no `Intl` con `weekday: 'long'`, para que el texto no cambie según la versión de ICU del servidor ("domingo 11 de enero de 2026", sin coma). Una fecha `date` se lee como día del calendario, sin zona; un instante se pasa a `America/Hermosillo`.
- **Última y siguiente jornada** (`resumirJornadas`): la última es la de número más alto con algún juego jugado o por forfeit; la siguiente, la que sigue. Si su fecha ya pasó y no tiene resultados, la portada dice "resultados por publicar" en lugar de "próxima".
- **Forfeit en el marcador:** se muestra con el marcador de las reglas (7-0) y una nota "forfeit de …"; que esas carreras cuenten o no en la tabla lo decide `forfeit_cuenta_carreras`.
- **Racha** (`calcularRachas`): los resultados seguidos más recientes de cada equipo, en orden de jornada, encuentro y juego; ignora los juegos que no cuentan para la tabla.
- **El marcador es una tabla por encuentro** (equipo, J1, J2) con un `caption` oculto, para que un lector de pantalla diga "Chicos de Sinahuiza, J1 3, ganó". La raya roja del ganador lleva el texto oculto "ganó"; el color no es la única señal.
- **Tabla de posiciones completa:** se desliza a los lados en el celular con la columna del equipo fija. Debajo de 560 px se esconden los escudos y el nombre se parte en dos líneas, para que quepan JJ, JG, JP, JE y AVE sin deslizar.
- **`<img>` con `srcset` de las tres variantes** (`Imagen`) en lugar de `next/image`: el optimizador está apagado y `next/image` sin él no genera `srcset`. Por eso la regla `@next/next/no-img-element` está apagada en `eslint.config.mjs`. El `sizes` usa `calc(100vw - 32px)` en el celular (el ancho real sin márgenes): con `100vw`, un cartel vertical en un celular de densidad 2 pedía la variante de 1600 px.
- **Transmisiones y publicaciones se cargan al tocarlas** (`Incrustado`): primero se ve una portada propia con el título; el `iframe` de YouTube (`youtube-nocookie.com`), Facebook, Instagram o TikTok se crea al tocarla. Ninguna página pública carga scripts de Meta ni de Google. `src/lib/incrustar.ts` solo acepta `https` y una lista cerrada de dominios; X no tiene incrustación sin su script, así que se muestra como enlace.
- **Publicaciones de Facebook desde la API** (`src/lib/facebook.ts` y `PublicacionesFacebook`; las 3 más recientes en la portada y 9 en Redes). El plugin de página de Facebook (`plugins/page.php`, el mismo que generaba el SDK en el sitio anterior) solo muestra publicaciones a quien tiene sesión de Facebook en ese navegador y acepta cookies de terceros. Sin sesión, Facebook responde `"has_posts":false` aun para su propia página, y en Safari del iPhone nunca salen. Por eso el servidor pide `/me/posts` a la Graph API v26.0 con el token de la página (`FACEBOOK_TOKEN_PAGINA`, en el encabezado `Authorization`; nunca llega al navegador ni va en la dirección) y las publicaciones se pintan con el diseño del sitio.
- **Se actualizan cada 30 minutos** (`revalidate` del `fetch`), y con eso la portada y Redes se regeneran cada media hora. Si falta el token, Facebook responde con error o tarda más de 8 segundos, la sección queda con el texto y el botón de Facebook y el error va al registro, sin el token. No se lanza el error: la portada se regenera completa, y un token vencido congelaría también los resultados de las jornadas.
- **Imágenes de `fbcdn.net`:** sus direcciones van firmadas y caducan; cada regeneración trae direcciones nuevas. Se aceptan solo enlaces `https` de facebook.com e imágenes `https`. El `alt` va vacío porque la API no da texto alternativo, y el texto de la publicación va debajo.
- **`FACEBOOK_API_URL`** cambia la dirección de la API; solo sirve para probar la sección con un servidor falso en la auditoría local.
- **En vivo:** una transmisión cuenta como en vivo si el panel la marcó (`en_vivo`) y su fin no ha pasado. Con la caché de una hora, encenderla o apagarla depende de que el panel revalide al guardar.
- **Imagen para compartir de cada jornada** (`jornadas/[numero]/opengraph-image.tsx`): el marcador en 1200 × 630, con las tipografías de `assets/fuentes/` en TTF (el generador no lee WOFF2 ni las de `next/font`) y el logotipo en PNG de `assets/og/`. Sus colores son una copia de los tokens en `src/lib/compartir/recursos.ts`: el generador no lee variables CSS. Es la única excepción a "ningún color literal fuera de `:root`".
- **`/compartir/[id]`** entrega una imagen guardada como JPEG de hasta 1200 px para `og:image`: las variantes están en WebP y no todas las redes ni WhatsApp muestran WebP en la vista previa. Solo lee del almacén de la liga (`leerArchivo` rechaza otros dominios) y se guarda en caché un año.
- **`SITIO_URL`** da la dirección absoluta de las imágenes para compartir, el mapa del sitio y los enlaces de "Compartir en Facebook". Sin ella se usa ligabeisbolbacabachi.com; en una vista previa de Vercel conviene definirla con la dirección de la vista previa.
- **Direcciones del sitio anterior** (`/index.html`, `/pages/*.html`) redirigen con 308 en `next.config.ts`, para que los enlaces ya compartidos en Facebook sigan funcionando.
- **`(publico)/[...resto]`** solo llama a `notFound()`: así una dirección desconocida muestra el 404 con la cabecera y el pie del sitio, y no la página en blanco de la raíz.
- **Menú del celular:** un botón con `aria-expanded` que se cierra con Escape y al cambiar de página (se compara la ruta durante el render, sin efecto). En escritorio (1000 px o más) los enlaces van en una fila y los secundarios (altas y bajas, documentos, contacto) quedan en el pie.

## Panel

- **Cada acción del panel pasa por `accionConFormulario` o `accionDirecta`** (`src/lib/panel/acciones.ts`): llama a `exigirAdministrador()`, valida con Zod, hace el cambio, deja su renglón en la bitácora con `anotar` y llama a `publicarCambios()` (`revalidatePath('/', 'layout')`), así el sitio público se actualiza al momento aunque esté en caché una hora. Los errores esperados se lanzan como `ErrorPanel` (mensaje y campos con error); un error inesperado se registra en el servidor y la pantalla dice "No se pudo guardar". `unstable_rethrow` evita atrapar las redirecciones de Next.
- **Los archivos de acciones del servidor solo exportan funciones async**; las listas de opciones viven en `src/lib/panel/catalogos.ts`.
- **`Formulario` envía con `onSubmit` y `startTransition`**, no con `<form action>`: React reinicia un formulario con `action` al terminar aunque haya error, y se perdería lo escrito. Los formularios de "agregar" se vacían solo cuando se guardan (`reiniciar`). Una acción puede pedir abrir otra página (`datos.destino`): al crear una noticia se abre su edición.
- **Ids de campos con `useId`:** en una misma página hay varios formularios con los mismos nombres (uno por encuentro, por publicación o por foto).
- **Captura de resultados:** un formulario por jornada con todos sus juegos. El estado junta el forfeit con quién no se presentó. Si se escriben carreras con el estado "Por jugar", pasa a "Se jugó" en el navegador y en el servidor. El forfeit no guarda carreras (las pone la regla de la temporada); un juego suspendido conserva el marcador parcial si se escribió. `interpretarCaptura` es pura y tiene pruebas.
- **Calendario:** no deja borrar una jornada o un encuentro con resultados, cambiar los equipos de un encuentro con resultados ni quitar un juego que ya se jugó; un equipo no puede tener dos encuentros ni jugar y descansar en la misma jornada. Una temporada nueva copia las reglas de la vigente y solo una puede ser la vigente (se cambia en una transacción).
- **Nombres:** los de jugadores y cuerpo técnico pasan por `normalizarNombre` (mayúscula inicial y acentos conocidos) y el mensaje dice cómo quedaron guardados. Un número repetido entre los jugadores activos de un equipo se rechaza.
- **Fecha de nacimiento:** se guarda en `datos_privados_jugador` junto con las notas privadas; el panel muestra la edad y la bitácora anota "capturada", no la fecha.
- **Baja contra quitar:** la baja (fecha de baja) conserva la historia y sale en Altas y bajas. "Quitar de la plantilla" es para capturas equivocadas: borra el registro y también al jugador si no está en otra plantilla.
- **Fecha de publicación de una noticia:** vacía, la noticia sale con el instante en que se publica; con una fecha pasada, queda a las 12:00 de Sonora de ese día, para subir noticias anteriores (como las de la final 2025-2026). Si la fecha no cambia, se conserva el instante original, y no se aceptan fechas futuras porque la página está en caché una hora y no hay publicación programada. Las noticias del mismo día se ordenan de la más nueva a la más antigua por su id (`instanteDePublicacion` en `lib/panel/campos.ts`).
- **Direcciones fijas al publicar:** el slug de una noticia o de un álbum ya no cambia aunque se cambie el título, para no romper enlaces compartidos.
- **Imágenes sin uso:** al reemplazar o borrar la imagen de una noticia, evento, equipo, patrocinador o foto de álbum, la anterior se borra (fila y archivos) si nadie más la usa (`borrarImagenesSinUso`). Las que quedan de formularios que no se guardaron aparecen en el Inicio del panel después de un día, con un botón para borrarlas.
- **Fotos del álbum una por una:** el navegador reduce cada foto, la sube a `/api/imagenes` y la agrega al álbum con una acción. Así una falla no detiene las demás y ninguna petición pasa del límite de 4.5 MB de Vercel.
- **Documentos por `/api/documentos`** y no por una acción: las acciones del servidor aceptan 1 MB por defecto y un reglamento en PDF suele pesar más. Se aceptan hasta 4 MB y se revisa que el archivo empiece con `%PDF-`.
- **Transmisiones:** el enlace se valida con `incrustacionDeTransmision` y de ahí sale la plataforma. "Terminar" pone la hora de fin en el momento. El Inicio avisa si una sigue marcada en vivo seis horas después de empezar. La hora de inicio es obligatoria en transmisiones y eventos.
- **Usuarios:** la clave temporal se muestra una sola vez a quien la genera y no se guarda ni se anota en la bitácora. Restablecer y desactivar cierran las sesiones de esa cuenta. Nadie puede desactivarse a sí mismo ni dejar el panel sin administradores activos. Una cuenta desactivada no entra: lo revisan `exigirAdministrador()`, `/api/imagenes` y `/api/documentos`. `src/lib/usuarios.ts` lo comparten el panel y `npm run admins:crear`.
- **Límite de intentos en local:** sin `x-forwarded-for`, todas las entradas comparten un contador (la IP queda en ceros). En Vercel cada IP tiene el suyo.
- **Estadísticas:** la pantalla explica que espera la decisión D5.

## Interfaz

- **`images.unoptimized`:** las imágenes se guardan ya en sus tres tamaños al subirlas, así que no se gastan las transformaciones mensuales del optimizador de Vercel.
- **Big Shoulders:** Next 16 la nombra `Big_Shoulders` (Google unió la versión Display). No trae métricas de respaldo, por eso la compilación avisa que no generó la fuente de respaldo.
- **Logotipo:** `public/img/logo-liga-96.webp` y `-192.webp`, recortados del original de `legado/`; `src/app/icon.png` y `apple-icon.png` son los íconos del navegador y del celular.
- **Fechas del panel en `America/Hermosillo`**, la zona de Sonora, sin horario de verano.
- **Tema claro u oscuro.** Por defecto sigue al aparato (`prefers-color-scheme`); el selector del menú (`SelectorTema`) permite fijar Claro u Oscuro y lo guarda en `localStorage` con la clave `tema`. Automático borra la clave. El tema fijado va en `<html data-tema="…">`: en `globals.css` los colores oscuros aplican con `prefers-color-scheme: dark` salvo `data-tema="claro"`, y siempre con `data-tema="oscuro"`. Los colores oscuros están escritos dos veces porque una regla no puede juntar una media query con un selector; `light-dark()` lo evitaría, pero en Safari anterior a 17.5 (iPhone sin actualizar) deja el sitio sin colores.
- **`SCRIPT_TEMA` en el `<head>`:** lee la clave antes de pintar, así que la página no parpadea en el tema equivocado. No es una cookie porque las páginas públicas se generan estáticas (`revalidate`): leer cookies en el servidor las volvería dinámicas. Por eso `<html>` lleva `suppressHydrationWarning`, y el selector lee el tema de `data-tema` con `useSyncExternalStore` (en el servidor siempre es Automático). Si el navegador bloquea `localStorage`, el selector cambia el tema de la página abierta sin guardarlo. Otra pestaña abierta se entera por el evento `storage`. La elección también aplica al panel.

## Auditoría de la interfaz

- **`npm run auditar:ui`** (con `npm run build` y `npm start` corriendo) abre Edge o Chrome sin ventana por el protocolo de depuración, sin Puppeteer, y revisa 18 páginas en 320, 390, 768 y 1366 px, en claro y oscuro, más el menú abierto, una foto ampliada y el selector de tema (elegir el tema contrario al del aparato y recargar con el tema guardado; al terminar borra la clave para no afectar las revisiones siguientes). En cada una corre axe-core con las reglas WCAG 2.2 A y AA, mide el desbordamiento horizontal y junta errores de consola y respuestas 4xx o 5xx. Deja `resumen.md` y capturas en `reportes/auditoria-ui-<fecha>-<hora>/`, y termina con error si hay problemas o si la portada pesa más de 500 KB.
- **Peso:** se mide con un celular de 390 px y densidad 2, sin caché. Cada archivo cargado se vuelve a pedir con gzip para contar lo que viaja comprimido: en esta PC, Edge recibe las respuestas sin comprimir aunque el servidor sí comprime (curl lo confirma), y Vercel siempre comprime. Cuentan los archivos del sitio y los de Blob (`*.public.blob.vercel-storage.com`), porque en producción las imágenes vienen de ahí; con `AUDITORIA_URL=https://…` la auditoría corre contra producción. Las fotos de las tarjetas cargan en diferido: según cuánto tarde la página, el cartel de la tarjeta más cercana entra o no en la medición, y eso mueve la portada de unos 325 a unos 500 KB.
- **Panel:** con `AUDITORIA_USUARIO` y `AUDITORIA_CLAVE` la auditoría entra al panel y revisa sus 27 pantallas (las de edición las encuentra siguiendo el primer enlace de cada lista) y el menú abierto. Conviene usar un administrador temporal y borrarlo al terminar.
- **Antes de cada captura se cargan las imágenes diferidas** (`loading="lazy"` pasa a `eager`); si no, las fotos fuera de la pantalla salen como bloques de color.
- **Solo cuentan las peticiones del sitio y de Blob** para esperar a que la red quede quieta y para las respuestas con error. El feed de Facebook sigue pidiendo cosas sin parar: con él, cada paso esperaba el límite de 20 segundos y la auditoría tardaba más de una hora. Por lo mismo, axe-core corre con `iframes: false`: el contenido de Facebook no es nuestro, y axe esperaba hasta un minuto la respuesta de cada `iframe`. El `iframe` en sí (su título, su tamaño) sí se revisa.

## Reglas del proyecto

- **`scripts/verificar-reglas.mjs`** recorre el repositorio (sin `node_modules`, `.next` ni `legado`):
  - TypeScript y JavaScript con el analizador de TypeScript, para no confundir `//` dentro de una URL o una expresión regular con un comentario; el texto visible de JSX no se toma como comentario.
  - CSS y SQL, quitando antes las cadenas.
  - JSON con `JSON.parse` (un comentario lo hace inválido).
  - `.gitignore`, `.env.example` y similares: líneas que empiezan con `#` o `;`.
  - Emojis con `\p{Extended_Pictographic}` más los modificadores `FE0F` y `20E3`; se permiten ©, ® y ™.
- Corre en `prebuild`, así que Vercel tampoco publica código con comentarios o emojis.

## Vercel

- **`vercel.json` fija el tipo de proyecto en Next.js.** Al importar el repositorio, Vercel lo detectó como "Other" porque en la raíz quedaba el sitio anterior.
- **Neon y Blob se conectan desde Storage**; crean `DATABASE_URL`, `DATABASE_URL_UNPOOLED` y `BLOB_STORE_ID`. Las migraciones y los scripts de carga usan `DATABASE_URL_UNPOOLED` (conexión directa, sin el pooler).
- **`next build` lee la base:** si Neon no tiene las tablas, la compilación falla.
- **`FACEBOOK_TOKEN_PAGINA`** es sensible. Es un token de página que no caduca, sacado de un token de usuario de 60 días (pasos en el README). Deja de servir si el administrador cambia su contraseña de Facebook, deja de administrar la página o le quita el permiso a la app; entonces la sección de Facebook desaparece hasta poner un token nuevo. La app de Meta se queda en modo de desarrollo: para leer la página propia no necesita revisión.
- **`scripts/preparar-produccion.ts` corre antes de cada compilación** (`prebuild`) y solo actúa en la de producción de Vercel: aplica las migraciones a Neon. Con `CARGAR_SITIO_ANTERIOR=1` carga los datos y las imágenes de `legado/` si la base está vacía; con `ADMINS_INICIALES=Usuario:clave,Usuario:clave` crea los administradores que falten con esa clave temporal (se pide cambiarla al entrar). Las dos variables se quitan después de la primera carga. Existe porque las variables de Neon son sensibles: Vercel no deja bajarlas, así que desde una PC no se puede llegar a la base de producción.

## Desarrollo local

- **PostgreSQL portátil:** binarios de `@embedded-postgres/windows-x64` 17.10 en `~/.postgres-local`, sin servicio ni permisos de administrador. La instalación con winget pedía permiso de administrador.
- **`scripts/postgres-local.mjs`** arranca `pg_ctl` desacoplado (`detached`, sin heredar la consola) para que PostgreSQL siga corriendo al cerrar la terminal; `preparar` crea el rol y la base que indica `DATABASE_URL`.
- **`"type": "module"`** en `package.json`: Vite (Vitest) y los scripts `.mjs` esperan módulos ES.
- **Variables de entorno en scripts:** `process.loadEnvFile` lee `.env.local` y luego `.env`, sin dependencias.
