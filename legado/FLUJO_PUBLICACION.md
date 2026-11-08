# 🔄 Flujo de Publicación de Datos

## 📋 Sistema de Doble Almacenamiento

El sitio utiliza **dos fuentes de datos diferentes** según quién accede:

### 👤 Administrador (Panel Admin)
- **Fuente:** `localStorage` del navegador
- **Ubicación:** Local en tu PC
- **Alcance:** Solo tú ves estos datos
- **Propósito:** Trabajar sin afectar el sitio público

### 🌐 Usuarios Públicos (Sitio Web)
- **Fuente:** Archivos JSON en el servidor
- **Ubicación:** `data/results.json` y `data/news.json`
- **Alcance:** Todos los usuarios ven estos datos
- **Propósito:** Datos oficiales del sitio

---

## 🎯 Flujo de Trabajo Completo

### 1️⃣ **Trabajar Localmente (Panel Admin)**

```
Panel Admin (localhost o tu PC)
├── Actualizar resultados de juegos
├── Crear/editar noticias
└── Todo se guarda en localStorage (solo tú lo ves)
```

**Pasos:**
1. Accede al panel admin (`Ctrl+Shift+A`)
2. Actualiza resultados y noticias
3. Todo se guarda automáticamente en tu navegador
4. Los usuarios públicos AÚN NO ven los cambios

---

### 2️⃣ **Exportar Datos**

```
Panel Admin → Pestaña "💾 Backup de Datos"
├── Click "📊 Exportar Resultados"
│   └── Descarga: resultados_liga_2025-11-12.json
│
└── Click "📰 Exportar Noticias"
    └── Descarga: noticias_liga_2025-11-12.json
```

**Archivos descargados:**
- `resultados_liga_2025-11-12.json` (fecha actual)
- `noticias_liga_2025-11-12.json` (fecha actual)

---

### 3️⃣ **Preparar Archivos para Publicar**

**Renombra los archivos:**

| Archivo Descargado | → | Renombrar a |
|-------------------|---|-------------|
| `resultados_liga_2025-11-12.json` | → | `results.json` |
| `noticias_liga_2025-11-12.json` | → | `news.json` |

---

### 4️⃣ **Subir al Servidor**

**Usando FTP/SFTP o Panel de Hosting:**

1. Conéctate a tu servidor web
2. Navega a la carpeta: `data/`
3. **Reemplaza** los archivos existentes:
   - `data/results.json` ← Tu nuevo archivo
   - `data/news.json` ← Tu nuevo archivo
4. Confirma la subida

**Estructura del servidor:**
```
tu-sitio.com/
├── index.html
├── css/
├── js/
├── pages/
└── data/
    ├── results.json  ← Reemplazar este
    └── news.json     ← Reemplazar este
```

---

### 5️⃣ **Verificar Publicación**

1. Abre el sitio web en modo **incógnito** (Ctrl+Shift+N)
2. Recarga la página (F5)
3. Verifica que los cambios aparezcan:
   - ✅ Marcadores de juegos actualizados
   - ✅ Noticias nuevas visibles
   - ✅ Tabla de posiciones actualizada

---

## 🔍 Comparación: localStorage vs JSON del Servidor

| Característica | localStorage (Admin) | JSON Servidor (Público) |
|----------------|---------------------|------------------------|
| **Quién lo ve** | Solo el administrador | Todos los usuarios |
| **Dónde está** | Navegador del admin | Servidor web |
| **Cómo se actualiza** | Automático al guardar | Manual (exportar + subir) |
| **Cuándo usar** | Trabajar sin publicar | Publicar cambios oficiales |
| **Persistencia** | Solo en ese navegador | Permanente en servidor |

---

## ⚙️ Casos de Uso

### 📝 Caso 1: Actualizar Resultados de la Jornada 5

```
1. Accede al Panel Admin
2. Ve a "📊 Resultados de Juegos"
3. Ingresa los marcadores de Jornada 5
4. Guarda cada resultado
5. Exporta "Resultados" → resultados_liga_2025-11-15.json
6. Renombra a: results.json
7. Sube a: data/results.json en el servidor
8. ✅ Todos ven los resultados actualizados
```

### 📰 Caso 2: Publicar Nueva Noticia

```
1. Accede al Panel Admin
2. Ve a "📰 Noticias"
3. Crea nueva noticia
4. Exporta "Noticias" → noticias_liga_2025-11-15.json
5. Renombra a: news.json
6. Sube a: data/news.json en el servidor
7. ✅ La noticia aparece en la página principal
```

### 🔄 Caso 3: Actualización Completa

```
1. Actualiza resultados Y noticias en el Panel Admin
2. Exporta AMBOS archivos
3. Renombra ambos (results.json y news.json)
4. Sube ambos al servidor
5. ✅ Sitio completamente actualizado
```

---

## 💡 Consejos y Mejores Prácticas

### ✅ Hacer Antes de Publicar:
1. **Verifica datos en el panel admin** - Asegúrate que todo esté correcto
2. **Exporta con fecha** - Los archivos incluyen fecha para versionado
3. **Guarda backup** - Conserva los JSON anteriores antes de reemplazar
4. **Prueba en incógnito** - Verifica que los cambios se vean correctamente

### ❌ Evitar:
1. **No subir archivos sin renombrar** - Deben llamarse `results.json` y `news.json`
2. **No editar JSON manualmente** - Usa siempre el panel admin
3. **No olvidar exportar** - Los cambios en localStorage NO se publican solos
4. **No borrar archivos JSON** - Siempre reemplázalos, no los elimines

---

## 🆘 Solución de Problemas

### ❓ "Los cambios no aparecen en el sitio"

**Verifica:**
1. ¿Renombraste los archivos correctamente?
2. ¿Los subiste a la carpeta `data/` correcta?
3. ¿Recargaste con Ctrl+F5 (limpiar caché)?
4. ¿Probaste en modo incógnito?

### ❓ "Los archivos JSON no se cargan"

**Posibles causas:**
1. **Ruta incorrecta** - Verifica que estén en `data/`
2. **Nombres incorrectos** - Deben ser `results.json` y `news.json`
3. **Permisos del servidor** - Los archivos deben ser legibles (chmod 644)
4. **Formato JSON inválido** - Usa solo archivos exportados del panel

### ❓ "Perdí los datos del localStorage"

**Solución:**
1. Si tienes un backup JSON previo, importa los datos
2. Si no, los datos están perdidos (localStorage no persiste entre navegadores)
3. **Prevención:** Exporta backups regularmente

---

## 📦 Estructura de Archivos JSON

### `results.json`:
```json
{
  "j1_Astros_Venados de Batayaui": {
    "homeScore": 5,
    "awayScore": 3,
    "timestamp": "2025-11-10T15:30:00.000Z"
  }
}
```

### `news.json`:
```json
[
  {
    "id": "1699999999999",
    "title": "Inicio de Temporada",
    "date": "2025-11-10",
    "content": "La liga arranca...",
    "emoji": "⚾",
    "timestamp": "2025-11-10T12:00:00.000Z"
  }
]
```

---

## 🔐 Seguridad

- ✅ Solo administradores tienen acceso al panel
- ✅ Publicación manual = control total sobre qué se publica
- ✅ Los archivos JSON son de solo lectura para usuarios públicos
- ✅ localStorage del admin es privado (no accesible por otros)

---

**¿Dudas?** Revisa `ADMIN_INSTRUCCIONES.md` para más información sobre el panel de administración.

