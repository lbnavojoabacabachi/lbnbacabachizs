# 📋 Plan de Reorganización de Fotos

## 📁 Estructura Actual

```
assets/images/fotos/
  └── 2025-2026/
      ├── inauguración/
      │   ├── 1.jpeg - 11.jpg
      └── Juego de Estrellas/
          └── [50+ archivos con nombres largos]
```

## ✅ Cambios Realizados

1. **gallery.json actualizado** con rutas correctas
2. **Fotos de inauguración** ya están organizadas
3. **Fotos del Juego de Estrellas** agregadas al JSON con títulos descriptivos

## 🔄 Estructura Recomendada (Opcional - Para Futuro)

Si quieres reorganizar completamente siguiendo el formato estándar:

```
assets/images/fotos/
  ├── 2025-01/
  │   ├── inauguracion/
  │   │   ├── 2025-01-01-inauguracion-01.jpg
  │   │   ├── 2025-01-01-inauguracion-02.jpg
  │   │   └── ...
  │   └── juego-estrellas/
  │       ├── 2025-01-18-juego-estrellas-equipo-poniente.jpg
  │       ├── 2025-01-18-juego-estrellas-equipo-oriente.jpg
  │       ├── 2025-01-18-juego-estrellas-campeon-jonronero.jpg
  │       └── ...
  └── 2025-02/
      └── [futuros eventos]
```

## 📝 Recomendaciones para Archivos del Juego de Estrellas

### Archivos que necesitan mejor nombre:

**Actual** → **Recomendado**

- `campeon jonronero - copia - copia.JPG-min.jpeg` → `2025-01-18-juego-estrellas-campeon-jonronero.jpg`
- `campeon corredor - copia - copia.JPG-min.jpeg` → `2025-01-18-juego-estrellas-campeon-corredor.jpg`
- `campeon tiro - copia - copia.JPG-min.jpeg` → `2025-01-18-juego-estrellas-campeon-tiro.jpg`
- `catcher campeon - copia - copia.JPG-min.jpeg` → `2025-01-18-juego-estrellas-campeon-catcher.jpg`
- `presidium liga.JPG-min.jpeg` → `2025-01-18-juego-estrellas-presidium-liga.jpg`
- `poniente.JPG-min.jpeg` → `2025-01-18-juego-estrellas-equipo-poniente.jpg`
- `oriente.JPG-min.jpeg` → `2025-01-18-juego-estrellas-equipo-oriente.jpg`
- `DSC09797 - copia - copia.JPG-min.jpeg` → `2025-01-18-juego-estrellas-01.jpg`
- `DSC09798 - copia - copia.JPG-min.jpeg` → `2025-01-18-juego-estrellas-02.jpg`
- etc.

## 🎯 Estado Actual

✅ **gallery.json actualizado** - Todas las fotos están referenciadas correctamente
✅ **Rutas funcionando** - Las fotos se cargarán desde sus ubicaciones actuales
✅ **Títulos descriptivos** - Agregados títulos claros para cada foto

## 📌 Próximos Pasos (Opcional)

Si quieres optimizar más:

1. **Renombrar archivos** del Juego de Estrellas con nombres más limpios
2. **Comprimir imágenes** si pesan mucho (>500 KB)
3. **Reorganizar estructura** a formato `2025-01/` en lugar de `2025-2026/`
4. **Actualizar rutas** en gallery.json después de renombrar

## ⚠️ Nota Importante

**NO es necesario reorganizar ahora** - La estructura actual funciona perfectamente. 
Los cambios sugeridos son para mejor organización a largo plazo.

Las fotos ya están funcionando correctamente con las rutas actualizadas en `gallery.json`.
