# Guía de Contribución

## 📋 Cómo actualizar el contenido del sitio

Esta guía te ayudará a realizar actualizaciones comunes en el sitio web de la liga.

### 1. Actualizar Noticias

Para agregar una nueva noticia en la página principal (`index.html`):

1. Abre `index.html`
2. Busca la sección `<section id="noticias" class="section">`
3. Duplica uno de los bloques `<div class="news-card">` existentes
4. Modifica el contenido:
   - Fecha en `.news-date`
   - Título en `<h3>`
   - Contenido en `<p>`

### 2. Actualizar Tabla de Posiciones

Para actualizar la tabla de posiciones:

1. Abre `index.html`
2. Busca `<section id="standing" class="section">`
3. Modifica los valores en las celdas `<td>`:
   - JJ: Juegos Jugados
   - JG: Juegos Ganados
   - JP: Juegos Perdidos
   - AVE: Promedio

### 3. Actualizar Calendario de Juegos

Para agregar o modificar juegos:

1. Abre `index.html`
2. Busca `<section id="rol-juegos" class="section">`
3. Duplica un `<div class="game-card">` para agregar más juegos
4. Modifica:
   - Nombres de equipos
   - Fecha y hora
   - Campo de juego

### 4. Agregar Logos de Equipos

1. Coloca los archivos de logo en la carpeta `assets/logos/`
2. Nombra los archivos según el equipo: `aguilas.png`, `tigres.png`, etc.
3. En `index.html`, busca cada `.team-logo`
4. Cambia el contenido por: `<img src="assets/logos/nombre-equipo.png" alt="Nombre Equipo">`

### 5. Modificar Estilos

Para cambiar colores, fuentes o diseño:

1. Abre `css/styles.css`
2. Busca la sección relevante (están comentadas)
3. Modifica los valores CSS según necesites

**Colores principales de la liga:**
- Azul principal: `#1e3c72`
- Azul secundario: `#2a5298`
- Rojo: `#c41e3a`

### 6. Agregar Funcionalidad JavaScript

Para agregar interactividad:

1. Abre `js/main.js`
2. Agrega tus funciones al final del archivo
3. Llama a las funciones desde `DOMContentLoaded` si es necesario

### 7. Actualizar Datos de Equipos

Para modificar información de equipos (futuro uso con JavaScript):

1. Abre `js/data.js`
2. Modifica el array `teams` con la información de cada equipo
3. Los cambios se reflejarán cuando implementemos funcionalidad dinámica

## 🔧 Estructura de Archivos

```
/
├── index.html              # Página principal (modificar para contenido principal)
├── css/
│   └── styles.css          # Estilos (modificar para cambiar diseño)
├── js/
│   ├── main.js             # JavaScript principal (agregar funcionalidades)
│   └── data.js             # Datos de equipos (actualizar información)
├── assets/
│   ├── images/             # Imágenes generales (agregar fotos)
│   └── logos/              # Logos de equipos (agregar logos)
└── pages/                  # Páginas adicionales (agregar nuevas secciones)
```

## 📝 Consejos

1. **Respaldo**: Siempre haz una copia de seguridad antes de modificar archivos
2. **Pruebas**: Abre `index.html` en tu navegador después de cada cambio
3. **Consistencia**: Mantén el mismo formato y estilo en todas las secciones
4. **Comentarios**: Agrega comentarios en el código para documentar cambios importantes

## 🚨 Problemas Comunes

### Los estilos no se aplican
- Verifica que la ruta en `<link rel="stylesheet" href="css/styles.css">` sea correcta
- Limpia la caché del navegador (Ctrl + F5)

### Las imágenes no se muestran
- Verifica que la ruta sea correcta
- Asegúrate de que el archivo exista en la carpeta indicada
- Revisa que el nombre del archivo coincida (mayúsculas/minúsculas)

### El JavaScript no funciona
- Abre la consola del navegador (F12) para ver errores
- Verifica que la ruta en `<script src="js/main.js">` sea correcta

## 📧 Soporte

Si necesitas ayuda adicional, contacta al administrador del sitio:
- Email: contacto@ligaejidal.com
- Tel: (642) 123-4567


