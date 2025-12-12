# 📷 Instrucciones para Agregar Fotos de Facebook a la Galería

## Cómo Obtener URLs de Fotos de Facebook

### Método 1: Desde el Navegador (Más Fácil)

1. **Abre tu página de Facebook** en el navegador
2. **Haz clic derecho** sobre la foto que quieres usar
3. Selecciona **"Copiar dirección de imagen"** o **"Copy image address"**
4. La URL será algo como: `https://scontent.f...fbcdn.net/v/...`

### Método 2: Desde la Ficha de la Foto

1. **Haz clic** en la foto para verla en tamaño completo
2. **Haz clic derecho** sobre la imagen grande
3. Selecciona **"Abrir imagen en nueva pestaña"** o **"Open image in new tab"**
4. **Copia la URL** de la barra de direcciones de la nueva pestaña

### Método 3: Usando el Inspector (Para URLs Más Estables)

1. **Haz clic derecho** sobre la foto
2. Selecciona **"Inspeccionar"** o **"Inspect"**
3. Busca el elemento `<img>` en el código
4. Copia la URL del atributo `src`

## Cómo Agregar las Fotos al Sitio

### Opción A: Editar el archivo JSON directamente

Edita el archivo `data/gallery.json` y agrega las fotos en este formato:

```json
[
    {
        "id": 1,
        "url": "https://URL_DE_TU_FOTO_DE_FACEBOOK",
        "title": "Título descriptivo de la foto",
        "date": "2025-01-15"
    },
    {
        "id": 2,
        "url": "https://OTRA_URL_DE_FACEBOOK",
        "title": "Otra foto del equipo",
        "date": "2025-01-20"
    }
]
```

### Formato de los Datos

- **id**: Número único (1, 2, 3, ...)
- **url**: URL completa de la imagen de Facebook
- **title**: Título o descripción de la foto (opcional, puede estar vacío)
- **date**: Fecha en formato YYYY-MM-DD

## Notas Importantes

⚠️ **Las URLs de Facebook pueden cambiar o expirar** con el tiempo. Si esto sucede:

1. **Re-descarga las fotos** de Facebook
2. **Guárdalas localmente** en `assets/images/`
3. **Usa rutas relativas** en lugar de URLs de Facebook:
   ```json
   {
       "url": "assets/images/foto1.jpg",
       "title": "Mi foto",
       "date": "2025-01-15"
   }
   ```

## Ejemplo Completo

```json
[
    {
        "id": 1,
        "url": "https://scontent.fxyz1-1.fna.fbcdn.net/v/t39.30808-6/photo.jpg",
        "title": "Juego del 15 de enero - Astros vs Venados",
        "date": "2025-01-15"
    },
    {
        "id": 2,
        "url": "assets/images/juego-2.jpg",
        "title": "Celebración del campeonato",
        "date": "2025-01-20"
    }
]
```

## Consejos

- ✅ Usa títulos descriptivos para mejor experiencia de usuario
- ✅ Ordena las fotos por fecha (las más recientes primero)
- ✅ Para mejor rendimiento, guarda las fotos localmente si planeas mantenerlas permanentemente
- ✅ Las fotos se mostrarán automáticamente en el sitio después de actualizar el archivo JSON

