# 📁 Carpeta de Datos (data/)

Esta carpeta contiene los archivos JSON que alimentan el sitio web público.

## 📄 Archivos:

### `results.json`
- **Contenido:** Resultados de todos los juegos
- **Formato:** Objeto JSON con resultados por jornada
- **Actualización:** Manual (exportar desde panel admin)

### `news.json`
- **Contenido:** Todas las noticias publicadas
- **Formato:** Array JSON con noticias
- **Actualización:** Manual (exportar desde panel admin)

## 🔄 Cómo Actualizar:

1. Accede al **Panel de Administración**
2. Ve a la pestaña **"💾 Backup de Datos"**
3. Exporta los archivos deseados
4. Renombra:
   - `resultados_liga_YYYY-MM-DD.json` → `results.json`
   - `noticias_liga_YYYY-MM-DD.json` → `news.json`
5. **Reemplaza** los archivos en esta carpeta

## ⚠️ Importante:

- **NO edites estos archivos manualmente** - Usa el panel admin
- **NO borres los archivos** - Siempre reemplázalos
- **Mantén backups** - Guarda copias antes de reemplazar
- **Verifica formato JSON** - Debe ser válido

## 📖 Documentación Completa:

Ver `FLUJO_PUBLICACION.md` en la raíz del proyecto para instrucciones detalladas.

