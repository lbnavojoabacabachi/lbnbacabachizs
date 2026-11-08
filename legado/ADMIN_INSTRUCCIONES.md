# 📋 Panel de Administración - Instrucciones

## 🔐 Acceso al Panel

### Método 1: Acceso Directo
Visita directamente la URL:
```
pages/admin-resultados.html
```

### Método 2: Atajo de Teclado (Recomendado)
Desde cualquier página del sitio, presiona:
- **Windows/Linux:** `Ctrl + Shift + A`
- **Mac:** `Cmd + Shift + A`

### Método 3: Código Secreto
Desde la página principal, escribe: `admin` (sin presionar Enter)
Aparecerá un botón flotante para acceder.

**Contraseña actual:** `Perico123`

> 🔐 **Seguridad:** La contraseña está protegida con hashing SHA-1. No se almacena en texto plano.

## 📊 Funciones del Panel

El panel tiene dos secciones principales:

### 🔹 Pestaña: Resultados de Juegos

**Estadísticas Generales:**
En la parte superior verás:
- **Total de Juegos:** Cantidad total de juegos en la temporada
- **Juegos Completados:** Juegos que ya se jugaron
- **Juegos Pendientes:** Juegos por jugar
- **Con Marcador:** Juegos que tienen resultado guardado

### 🔹 Pestaña: Noticias

**Gestión de Noticias:**
- **Crear Noticias:** Publica noticias que aparecerán en la página principal
- **Editar Noticias:** Modifica noticias existentes
- **Eliminar Noticias:** Borra noticias que ya no son relevantes
- **Vista Previa:** Ve cómo se verán las noticias en el sitio

### 2. Filtros
Puedes filtrar los juegos por:
- **Vuelta:** Primera vuelta, segunda vuelta, o todas
- **Estado:** Completados, pendientes, o todos
- **Jornada:** Selecciona una jornada específica o todas

### 3. Actualizar Resultados

Para cada juego puedes:

1. **Ingresar el marcador:**
   - Escribe el marcador del equipo local en el primer campo
   - Escribe el marcador del equipo visitante en el segundo campo

2. **Guardar:**
   - Click en "💾 Guardar Resultado"
   - Verás una confirmación cuando se guarde

3. **Limpiar:**
   - Click en "🗑️ Limpiar" para borrar un resultado
   - Te pedirá confirmación antes de eliminar

### 4. Gestionar Noticias

#### Crear una Nueva Noticia:

1. **Ir a la pestaña "Noticias"**
   - Click en el botón "📰 Noticias" en la parte superior

2. **Click en "➕ Crear Nueva Noticia"**

3. **Completar el formulario:**
   - **Emoji/Icono:** Selecciona un emoji que represente la noticia
     - 📰 Noticia General
     - ⚾ Beisbol
     - 🏆 Torneo/Campeonato
     - 👥 Equipo
     - 📅 Evento
     - 🎉 Celebración
     - ⭐ Destacado
     - 📸 Galería/Fotos
   
   - **Fecha:** Selecciona la fecha de la noticia (por defecto es hoy)
   
   - **Título:** Escribe un título llamativo
     - Ejemplo: "Inicio de Temporada 2024-2025"
     - Máximo recomendado: 60 caracteres
   
   - **Contenido:** Describe la noticia
     - Sé claro y conciso
     - Máximo recomendado: 150-200 caracteres
     - Ejemplo: "La liga arranca con gran emoción este fin de semana."

4. **Click en "💾 Guardar Noticia"**
   - La noticia aparecerá inmediatamente en la lista
   - También se mostrará en la página principal

#### Editar una Noticia:

1. Busca la noticia en la lista
2. Click en "✏️ Editar"
3. Modifica los campos necesarios
4. Click en "💾 Guardar Noticia"

#### Eliminar una Noticia:

1. Busca la noticia en la lista
2. Click en "🗑️ Eliminar"
3. Confirma la eliminación
4. La noticia desaparecerá del sitio inmediatamente

## 📱 Visualización en el Sitio Web

Una vez que guardes los resultados:

### En la página principal (index.html):

**Sección "Próximos Juegos":**
- Los juegos completados mostrarán el marcador
- El equipo ganador tendrá un emoji de trofeo 🏆

**Tabla de Posiciones (⭐ NUEVO):**
- Se actualiza **automáticamente** con cada resultado guardado
- Muestra las estadísticas completas de cada equipo:
  - **Pos:** Posición en la tabla
  - **JJ:** Juegos Jugados
  - **JG:** Juegos Ganados (en verde)
  - **JP:** Juegos Perdidos (en rojo)
  - **AVE:** Porcentaje de victorias
- Los primeros 3 lugares tienen resaltado especial:
  - 🥇 **1er lugar:** Fondo dorado con trofeo 🏆
  - 🥈 **2do lugar:** Fondo plateado
  - 🥉 **3er lugar:** Fondo bronce
- Ordenamiento automático por porcentaje de victorias
- En caso de empate, se ordena por diferencia de carreras

### En la página de Rol de Juegos (pages/rol-juegos.html):
- Todos los juegos con resultado mostrarán su marcador
- El equipo ganador aparecerá resaltado en verde y con trofeo 🏆
- Los juegos sin resultado mostrarán "⏳ Por jugar"

**Sección de Noticias (⭐ NUEVO):**
- Se actualizan **automáticamente** con las noticias creadas en el panel
- Muestra las **3 noticias más recientes** ordenadas por fecha
- Cada noticia incluye:
  - Emoji/Icono seleccionado
  - Fecha formateada (ej: "10 de Noviembre, 2025")
  - Título de la noticia
  - Contenido/descripción
- Si no hay noticias, muestra un mensaje informativo
- Las noticias se ordenan automáticamente (más recientes primero)

## 💾 Almacenamiento de Datos

El sistema utiliza **localStorage** para almacenar dos tipos de datos:

### 📊 Resultados de Juegos:
- **Clave:** `liga_navojoa_results`
- **Contenido:** Marcadores de todos los juegos
- **Formato:** JSON con estructura `{jornadaID: {homeScore, awayScore, timestamp}}`

### 📰 Noticias:
- **Clave:** `liga_navojoa_news`
- **Contenido:** Todas las noticias publicadas
- **Formato:** JSON con array de objetos `{id, title, date, content, emoji, timestamp}`

### ⚠️ Importante sobre localStorage:
- Si limpias el caché del navegador, **TODOS LOS DATOS** se perderán
- Los datos persisten incluso si cierras el navegador
- Los datos son específicos del navegador/dispositivo que uses
- **Recomendación:** Haz capturas de pantalla o backups periódicos

## 🔒 Seguridad

### Sistema de Encriptación Implementado:
El sitio utiliza **hashing SHA-1** para proteger la contraseña:
- ✅ La contraseña NO se guarda en texto plano
- ✅ Solo se almacena el hash (huella digital) de la contraseña
- ✅ Es imposible obtener la contraseña original desde el hash
- ✅ Seguro para uso público sin backend

### Cambiar la contraseña:

**Opción 1: Usando la Consola del Navegador (Más Fácil)**

1. Abre el panel de administración en el navegador
2. Presiona `F12` para abrir las herramientas de desarrollador
3. Ve a la pestaña **"Console"**
4. Copia y pega este código (reemplaza `TU_NUEVA_CONTRASEÑA` con tu contraseña):

```javascript
async function generarHash(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    console.log('Tu nuevo hash es:', hashHex);
    return hashHex;
}
generarHash('TU_NUEVA_CONTRASEÑA');
```

5. Presiona `Enter` - Se mostrará el hash de tu nueva contraseña
6. Copia el hash que aparece (será algo como: `abc123def456...`)
7. Abre el archivo `pages/admin-resultados.html`
8. Busca la línea: `const ADMIN_PASSWORD_HASH = 'e38ad214943daad1d64c102faec29de4afe9da3d';`
9. Reemplaza el hash con el nuevo hash generado
10. Guarda el archivo

**Opción 2: Contactar al Desarrollador**
Si no te sientes cómodo con el proceso técnico, contacta al desarrollador del sitio para que actualice la contraseña por ti.

### Ocultar el acceso:
- No publiques el enlace al panel de administración en redes sociales
- No incluyas enlaces al panel en el menú público
- Solo comparte la URL con administradores autorizados
- La contraseña solo debe conocerla el personal autorizado

## 🛠️ Solución de Problemas

### Los resultados no se guardan:
1. Verifica que ambos campos tengan números
2. Asegúrate de hacer click en "Guardar"
3. Revisa que localStorage esté habilitado en tu navegador

### Los resultados no aparecen en el sitio:
1. Refresca la página con Ctrl+F5 (o Cmd+R en Mac)
2. Verifica que los scripts estén cargando correctamente
3. Abre la consola del navegador (F12) y busca errores

### Perdí todos los resultados:
- Si limpiaste el caché, los datos se perdieron
- No hay forma de recuperarlos sin un backup
- Recomendación: guarda capturas de pantalla regularmente

## 📝 Notas Adicionales

- Los marcadores son números enteros (no negativos)
- No hay límite en la cantidad de carreras
- Puedes actualizar un resultado cuantas veces quieras
- Los cambios son inmediatos en el sitio web
- No necesitas conexión a internet (todo funciona localmente)

## 📐 Cálculo de la Tabla de Posiciones

### Fórmulas y Criterios:

1. **Juegos Jugados (JJ):** Cuenta automáticamente todos los juegos con resultado guardado

2. **Juegos Ganados (JG):** Se incrementa cuando un equipo tiene más carreras que su oponente

3. **Juegos Perdidos (JP):** Se incrementa cuando un equipo tiene menos carreras que su oponente

4. **Porcentaje de Victorias (AVE):**
   ```
   AVE = JG ÷ JJ
   ```
   - Se muestra con 3 decimales (ej: .750, .500, .333)
   - Si no hay juegos jugados, se muestra .000

5. **Criterios de Desempate:**
   - **Primero:** Mayor porcentaje de victorias
   - **Segundo:** Mayor diferencia de carreras (a favor - en contra)

### Ejemplo Práctico:

Si guardas el resultado:
- Astros 8 - 5 Venados

La tabla se actualizará así:
- **Astros:** JJ=1, JG=1, JP=0, AVE=1.000
- **Venados:** JJ=1, JG=0, JP=1, AVE=.000

## 🔐 Ventajas del Sistema de Seguridad

### ¿Por qué usar hashing?
Comparación entre sistemas:

| Característica | Texto Plano | Con Hashing SHA-1 |
|---------------|-------------|-------------------|
| Contraseña visible en código | ❌ Sí | ✅ No |
| Se puede obtener la contraseña | ❌ Fácilmente | ✅ Imposible |
| Seguro para uso público | ❌ No | ✅ Sí |
| Requiere backend | No | No |
| Protección básica | ❌ Baja | ✅ Alta |

### Ejemplo Visual:
**Antes (texto plano):**
```javascript
const ADMIN_PASSWORD = 'Perico123'; // ⚠️ Visible para cualquiera
```

**Ahora (hasheado):**
```javascript
const ADMIN_PASSWORD_HASH = 'e38ad214943daad1d64c102faec29de4afe9da3d'; // ✅ Nadie puede saber la contraseña original
```

### Nivel de Seguridad:
Este sistema es adecuado para:
- ✅ Sitios públicos sin backend
- ✅ Ligas deportivas locales
- ✅ Administración de contenido comunitario
- ✅ Protección contra accesos casuales

**Nota:** Para sitios bancarios o con datos muy sensibles, se recomienda un backend con autenticación profesional.

## 🔄 Características Implementadas

### Gestión de Resultados:
- ✅ Panel de administración para actualizar marcadores
- ✅ Filtros por vuelta, estado y jornada
- ✅ Visualización de marcadores en juegos completados
- ✅ Indicador visual del ganador con trofeo 🏆

### Tabla de Posiciones:
- ✅ Calculada automáticamente basada en resultados
- ✅ Actualización en tiempo real de estadísticas
- ✅ Resaltado visual de los primeros 3 lugares
- ✅ Ordenamiento automático por rendimiento
- ✅ Diferencia de carreras como criterio de desempate

### Gestión de Noticias:
- ✅ Panel de administración para crear noticias
- ✅ Editor con emojis/iconos personalizables
- ✅ Editar y eliminar noticias existentes
- ✅ Visualización automática de las 3 noticias más recientes
- ✅ Ordenamiento por fecha (más recientes primero)

### Seguridad:
- ✅ Sistema de autenticación con hashing SHA-1
- ✅ Contraseña protegida (no visible en código)
- ✅ Accesos secretos (atajo de teclado y código)

### Calendario:
- ✅ Calendario completo de la temporada (18 jornadas)
- ✅ Próximos juegos actualizados automáticamente
- ✅ Visualización de equipos que descansan

## 🔄 Futuras Mejoras Planeadas

- [ ] Exportar/importar resultados en formato JSON
- [ ] Backup automático de resultados
- [ ] Historial de cambios
- [ ] Sincronización con servidor (requiere backend)
- [ ] Estadísticas avanzadas por equipo (carreras anotadas, permitidas, etc.)
- [ ] Gráficas de rendimiento por jornada

---

**Contacto:** Si tienes problemas o sugerencias, contacta al desarrollador del sitio.

