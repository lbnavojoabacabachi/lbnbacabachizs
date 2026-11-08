# 📸 Guía de Optimización y Organización de Fotos

## 🎯 Recomendaciones Generales

### 1. **Optimización de Imágenes ANTES de Subir**

#### Herramientas Recomendadas:
- **TinyPNG** (https://tinypng.com/) - Comprime JPG y PNG sin pérdida visible de calidad
- **Squoosh** (https://squoosh.app/) - Herramienta de Google con más opciones
- **ImageOptim** (Mac) - Comprime imágenes automáticamente
- **GIMP** o **Photoshop** - Para redimensionar y ajustar calidad

#### Tamaños Recomendados:
- **Fotos completas**: Máximo 1920px de ancho, calidad 80-85%
- **Miniaturas**: La galería muestra imágenes de ~250px, pero carga las completas
- **Peso máximo**: 200-500 KB por foto (idealmente menos de 300 KB)

#### Formato:
- ✅ **JPG** para fotos (mejor compresión)
- ✅ **PNG** solo si necesitas transparencia
- ❌ Evitar archivos muy pesados (>1MB)

---

## 📁 Organización de Archivos

### Estructura Recomendada:

```
assets/images/fotos/
  ├── 2025-01/
  │   ├── juego-estrellas/
  │   │   ├── 2025-01-18-juego-estrellas-01.jpg
  │   │   ├── 2025-01-18-juego-estrellas-02.jpg
  │   │   └── 2025-01-18-juego-estrellas-03.jpg
  │   ├── jornada-1/
  │   │   ├── 2025-01-20-astros-vs-venados-01.jpg
  │   │   └── 2025-01-20-rojos-vs-chicos-01.jpg
  │   └── campeonatos/
  │       ├── 2025-01-25-campeon-jonronero.jpg
  │       └── 2025-01-25-campeon-corredor.jpg
  ├── 2025-02/
  └── eventos-especiales/
```

### Convención de Nombres:

**Formato**: `YYYY-MM-DD-descripcion-numero.jpg`

**Ejemplos**:
- ✅ `2025-01-18-juego-estrellas-01.jpg`
- ✅ `2025-01-20-astros-vs-venados-01.jpg`
- ✅ `2025-01-25-campeon-jonronero.jpg`
- ❌ `DSC09797 - copia - copia.JPG.jpeg` (evitar)
- ❌ `foto1.jpg` (muy genérico)

**Ventajas**:
- Orden cronológico automático
- Fácil de encontrar por fecha
- Evita duplicados
- Nombres descriptivos

---

## 🔧 Proceso Recomendado

### Paso 1: Preparar las Fotos

1. **Redimensionar** a máximo 1920px de ancho
2. **Comprimir** usando TinyPNG o similar
3. **Renombrar** siguiendo la convención: `YYYY-MM-DD-descripcion-numero.jpg`
4. **Verificar** que pesen menos de 500 KB

### Paso 2: Organizar en Carpetas

1. Crear carpeta por mes: `2025-01/`, `2025-02/`, etc.
2. Dentro, crear subcarpetas por evento si hay muchas fotos
3. Mover las fotos a sus carpetas correspondientes

### Paso 3: Actualizar gallery.json

```json
[
    {
        "id": 1,
        "url": "assets/images/fotos/2025-01/juego-estrellas/2025-01-18-juego-estrellas-01.jpg",
        "title": "Juego de Estrellas 2025 - Zona Poniente vs Zona Oriente",
        "date": "2025-01-18"
    },
    {
        "id": 2,
        "url": "assets/images/fotos/2025-01/jornada-1/2025-01-20-astros-vs-venados-01.jpg",
        "title": "Jornada 1 - Astros vs Venados",
        "date": "2025-01-20"
    }
]
```

---

## ⚡ Mejoras Implementadas

### Lazy Loading
- ✅ Las imágenes se cargan solo cuando son visibles
- ✅ Mejora el tiempo de carga inicial de la página
- ✅ Reduce el consumo de datos en móviles

### Cómo Funciona:
- Las imágenes tienen un placeholder (gradiente) inicialmente
- Se cargan automáticamente cuando el usuario hace scroll
- Carga anticipada de 50px antes de que sean visibles

---

## 📋 Checklist Antes de Subir Fotos

- [ ] Foto redimensionada a máximo 1920px de ancho
- [ ] Foto comprimida (peso < 500 KB)
- [ ] Nombre descriptivo siguiendo convención
- [ ] Formato JPG (a menos que necesites PNG)
- [ ] Carpeta de destino creada (mes/evento)
- [ ] Entrada agregada en `data/gallery.json` con título descriptivo

---

## 🛠️ Herramientas Útiles

### Para Comprimir:
1. **TinyPNG** - https://tinypng.com/
2. **Squoosh** - https://squoosh.app/
3. **ImageOptim** - https://imageoptim.com/

### Para Redimensionar:
1. **GIMP** - https://www.gimp.org/ (gratis)
2. **Photoshop** - (de pago)
3. **IrfanView** - https://www.irfanview.com/ (Windows, gratis)
4. **Preview** (Mac) - Herramienta nativa

### Para Renombrar Múltiples Archivos:
1. **Bulk Rename Utility** (Windows)
2. **Renamer** (Mac)
3. **PowerToys** (Windows) - Rename tool

---

## 💡 Consejos Adicionales

1. **Backup**: Mantén las fotos originales en otra carpeta antes de comprimir
2. **Títulos descriptivos**: Usa títulos claros en `gallery.json` para mejor SEO
3. **Fechas correctas**: Usa la fecha real del evento, no la fecha de subida
4. **Orden**: Las fotos se muestran por fecha (más recientes primero)
5. **Cantidad**: No subas demasiadas fotos a la vez (máximo 20-30 por carga)

---

## 🚨 Problemas Comunes y Soluciones

### Problema: Las fotos cargan muy lento
**Solución**: Comprime las fotos antes de subirlas. Usa TinyPNG.

### Problema: Las fotos se ven borrosas
**Solución**: No comprimas demasiado. Mantén calidad 80-85%.

### Problema: No encuentro una foto específica
**Solución**: Usa nombres descriptivos y organiza por carpetas por fecha/evento.

### Problema: Las fotos ocupan mucho espacio
**Solución**: Comprime todas las fotos existentes y elimina duplicados.

---

## 📊 Estadísticas Ideales

| Tipo de Foto | Ancho Máximo | Peso Ideal | Calidad |
|--------------|--------------|------------|---------|
| Foto completa | 1920px | 200-400 KB | 80-85% |
| Foto de evento | 1920px | 300-500 KB | 80-85% |
| Foto de grupo | 1920px | 250-400 KB | 80-85% |

---

## ✅ Ejemplo Completo

**Antes**:
- Archivo: `DSC09797 - copia - copia.JPG.jpeg` (2.5 MB)
- Ubicación: `assets/images/fotos/` (sin organización)

**Después**:
- Archivo: `2025-01-18-juego-estrellas-01.jpg` (280 KB)
- Ubicación: `assets/images/fotos/2025-01/juego-estrellas/`
- En gallery.json:
```json
{
    "id": 1,
    "url": "assets/images/fotos/2025-01/juego-estrellas/2025-01-18-juego-estrellas-01.jpg",
    "title": "Juego de Estrellas 2025 - Equipos en el campo",
    "date": "2025-01-18"
}
```

---

**Última actualización**: Enero 2025
**Implementado**: Lazy loading para mejor rendimiento
