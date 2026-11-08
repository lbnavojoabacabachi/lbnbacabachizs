# Liga de Beisbol Navojoa Ejidal, Zona Sur Bacabachi

Sitio de la liga y panel para actualizarlo. El sitio anterior está en `legado/` y sigue publicado desde la rama `main` hasta el lanzamiento.

## Requisitos

- Node 22.12 o más reciente
- PostgreSQL 17 para desarrollo (cualquier instalación; abajo, cómo usar uno portátil sin permisos de administrador)

## Primera vez

1. `npm install`
2. Copia `.env.example` a `.env.local` y llena los valores:
   - `DATABASE_URL`: rol, clave y base que usará el sitio (se crean en el paso 4).
   - `BETTER_AUTH_SECRET`: una cadena aleatoria de 32 caracteres o más.
   - `POSTGRES_ADMIN_URL`: el superusuario de tu PostgreSQL local.
   - `POSTGRES_BIN` y `POSTGRES_DATOS`: solo si usas el PostgreSQL portátil.
   - `SITIO_URL`: la dirección pública del sitio, para las imágenes de compartir y el mapa del sitio.
   - `FACEBOOK_TOKEN_PAGINA` (opcional): el token de la página de Facebook, para mostrar sus publicaciones. Ver "Publicaciones de Facebook".
3. Arranca PostgreSQL: `npm run db:iniciar` (portátil) o el servicio de tu instalación.
4. `npm run db:preparar` crea el rol y la base.
5. `npm run db:migrar` crea las tablas.
6. `npm run admins:crear -- Cope LigaAdmin` crea los administradores. Las claves temporales quedan en `~/.liga-claves-temporales.txt`; cada quien la cambia al entrar por primera vez.
7. `npm run migrar:legado` y luego `npm run migrar:imagenes` cargan los datos y las imágenes del sitio anterior. Sin `BLOB_READ_WRITE_TOKEN`, las imágenes se guardan en `.medios/`.

### PostgreSQL portátil (Windows, sin administrador)

```powershell
mkdir $env:USERPROFILE\.postgres-local; cd $env:USERPROFILE\.postgres-local
npm install @embedded-postgres/windows-x64@17.10.0-beta.17
.\node_modules\@embedded-postgres\windows-x64\native\bin\initdb.exe -D datos -U postgres -A scram-sha-256 -E UTF8 --no-locale -W
```

Luego, en `.env.local`, `POSTGRES_BIN` apunta a `node_modules/@embedded-postgres/windows-x64/native/bin` y `POSTGRES_DATOS` a `datos`, dentro de esa carpeta.

## Publicaciones de Facebook

La portada y Redes muestran las publicaciones recientes de la página de Facebook de la liga. El sitio las pide a la API de Facebook con un token de la página que no caduca. Lo saca un administrador de la página:

1. En [developers.facebook.com](https://developers.facebook.com), con su cuenta de Facebook: **Mis apps → Crear app**. Nombre: "Sitio Liga Bacabachi". Caso de uso: el de administrar una página ("Manage everything on your Page"); si no aparece, **Otro** y tipo **Empresa**.
2. En la app, agregar los permisos `pages_show_list` y `pages_read_engagement`. La app se queda en modo de desarrollo.
3. En el [Explorador de la API Graph](https://developers.facebook.com/tools/explorer): elegir la app, agregar esos dos permisos y **Generate Access Token**. Al autorizar, elegir la página de la liga.
4. Ese token dura una hora. Pegarlo en el [Depurador de tokens](https://developers.facebook.com/tools/debug/accesstoken) y presionar **Extend Access Token**: da uno de 60 días.
5. De vuelta en el Explorador, pegar el token de 60 días y consultar `me/accounts`. Junto a la página de la liga viene su `access_token`: ese es el token de la página.
6. Revisarlo en el Depurador: debe decir **Type: Page** y **Expires: Never**.
7. En Vercel, **Settings → Environment Variables**: `FACEBOOK_TOKEN_PAGINA` con ese valor, marcada como **Sensitive**, en Production. Luego volver a publicar.

El token deja de servir si el administrador cambia su contraseña de Facebook, deja de administrar la página o le quita el permiso a la app. Entonces el sitio oculta las publicaciones hasta poner uno nuevo con estos mismos pasos.

## Día a día

```bash
npm run db:iniciar   # si el PostgreSQL portátil no está corriendo
npm run dev          # http://localhost:3000, panel en http://localhost:3000/panel
```

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Sitio en modo desarrollo |
| `npm run build` | Revisa reglas y compila para producción (lee la base para generar las páginas) |
| `npm start` | Sirve la compilación en http://localhost:3000 |
| `npm run auditar:ui` | Con `npm start` corriendo: accesibilidad (axe-core), desbordamiento, errores y peso en 4 anchos, claro y oscuro. Con `AUDITORIA_USUARIO` y `AUDITORIA_CLAVE` también revisa el panel. Reporte y capturas en `reportes/` (necesita Edge o Chrome) |
| `npm run verificar` | Revisa que no haya comentarios ni emojis |
| `npm run typecheck`, `npm run lint`, `npm test` | Tipos, ESLint y pruebas |
| `npm run db:iniciar`, `db:detener`, `db:estado` | PostgreSQL portátil |
| `npm run db:preparar` | Crea el rol y la base de `DATABASE_URL` |
| `npm run db:generar -- --name <nombre>` | Genera una migración desde el esquema |
| `npm run db:migrar` | Aplica migraciones |
| `npm run admins:crear -- <usuarios>` | Crea administradores (`--restablecer` da clave temporal nueva) |
| `npm run migrar:legado` | Importa los datos del sitio anterior (`--reemplazar` para volver a importar) |
| `npm run migrar:imagenes` | Optimiza las imágenes del sitio anterior y las liga a sus registros |
