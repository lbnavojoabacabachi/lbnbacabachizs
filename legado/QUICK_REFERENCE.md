# 🚀 Referencia Rápida

Guía rápida para las tareas más comunes en el sitio web.

## 📝 Tareas Comunes

### 1. Agregar una Nueva Noticia
**Archivo**: `index.html`  
**Buscar**: `<section id="noticias" class="section">`

```html
<div class="news-card">
    <div class="news-image">📸</div>
    <div class="news-content">
        <p class="news-date">[FECHA]</p>
        <h3>[TÍTULO]</h3>
        <p>[CONTENIDO]</p>
    </div>
</div>
```

### 2. Actualizar Tabla de Posiciones
**Archivo**: `index.html`  
**Buscar**: `<section id="standing" class="section">`

```html
<tr>
    <td>[Posición]</td>
    <td>[Equipo]</td>
    <td>[JJ]</td>
    <td>[JG]</td>
    <td>[JP]</td>
    <td>[AVE]</td>
</tr>
```

### 3. Agregar un Juego
**Archivo**: `index.html`  
**Buscar**: `<section id="rol-juegos" class="section">`

```html
<div class="game-card">
    <div class="game-teams">
        <div class="game-team">[Equipo Local]</div>
        <div class="vs">VS</div>
        <div class="game-team">[Equipo Visitante]</div>
    </div>
    <div class="game-info">
        <p><strong>[Día y Fecha]</strong></p>
        <p>[Hora]</p>
        <p>[Campo]</p>
    </div>
</div>
```

### 4. Cambiar Colores del Sitio
**Archivo**: `css/styles.css`

```css
/* Buscar y reemplazar: */
#1e3c72  /* Azul principal */
#2a5298  /* Azul secundario */
#c41e3a  /* Rojo */
```

### 5. Agregar Logo de Equipo
1. Guardar imagen en: `assets/logos/nombre-equipo.png`
2. En `index.html`, buscar el equipo en la sección de equipos
3. Reemplazar el contenido de `.team-logo`:

```html
<div class="team-logo">
    <img src="assets/logos/nombre-equipo.png" alt="Nombre Equipo" style="width: 100%; height: 100%; object-fit: contain;">
</div>
```

### 6. Crear Nueva Página
1. Copiar `pages/_template.html`
2. Renombrar el archivo
3. Reemplazar `[TÍTULO]`, `[DESCRIPCIÓN]`, etc.
4. Agregar contenido en la sección principal
5. Actualizar enlaces en el menú de navegación

## 📁 Ubicación de Archivos

| Necesitas | Archivo | Ubicación |
|-----------|---------|-----------|
| Cambiar página principal | HTML | `index.html` |
| Modificar estilos | CSS | `css/styles.css` |
| Agregar funcionalidad | JavaScript | `js/main.js` |
| Actualizar datos | JavaScript | `js/data.js` |
| Nueva página | HTML | `pages/` |
| Agregar imagen | Imagen | `assets/images/` |
| Agregar logo | Imagen | `assets/logos/` |

## 🎨 Componentes Disponibles

### Grid de Equipos
```html
<div class="teams-grid">
    <div class="team-card">...</div>
</div>
```

### Card de Noticia
```html
<div class="news-card">...</div>
```

### Tabla
```html
<table class="standings-table">...</table>
```

### Card de Juego
```html
<div class="game-card">...</div>
```

### Galería
```html
<div class="gallery-grid">
    <div class="gallery-item">...</div>
</div>
```

### Card de Patrocinador
```html
<div class="sponsor-card">...</div>
```

## 🔧 Comandos Útiles

### Abrir en Navegador
Simplemente doble clic en `index.html`

### Ver Consola de Errores
1. Abrir el sitio en el navegador
2. Presionar `F12`
3. Ir a la pestaña "Console"

### Limpiar Caché del Navegador
- Chrome/Edge: `Ctrl + Shift + Delete`
- Firefox: `Ctrl + Shift + Delete`
- O simplemente: `Ctrl + F5` para recarga forzada

## 📞 Recursos

- **Documentación completa**: Ver `README.md`
- **Guía de contribución**: Ver `CONTRIBUTING.md`
- **Estructura del proyecto**: Ver `ESTRUCTURA.md`

## ⚡ Atajos de Teclado

| Acción | Atajo |
|--------|-------|
| Buscar en archivo | `Ctrl + F` |
| Guardar | `Ctrl + S` |
| Deshacer | `Ctrl + Z` |
| Rehacer | `Ctrl + Y` |
| Recargar navegador | `F5` |
| Recargar sin caché | `Ctrl + F5` |

## 🎯 Checklist para Publicar Cambios

- [ ] Guardar todos los archivos modificados
- [ ] Abrir `index.html` en el navegador
- [ ] Probar la navegación entre páginas
- [ ] Verificar en modo móvil (F12 → Toggle device toolbar)
- [ ] Revisar la consola para errores (F12 → Console)
- [ ] Hacer backup de los archivos originales
- [ ] Subir cambios al servidor

## 🆘 Solución Rápida de Problemas

| Problema | Solución |
|----------|----------|
| Los estilos no se aplican | Limpia caché con `Ctrl + F5` |
| Las imágenes no aparecen | Verifica la ruta del archivo |
| El menú no funciona | Revisa que `main.js` esté cargado |
| Cambios no se ven | Asegúrate de guardar el archivo |

---

💡 **Tip**: Mantén este archivo abierto mientras trabajas en el sitio.


