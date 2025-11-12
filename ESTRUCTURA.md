# 📁 Estructura Completa del Proyecto

## Vista General

Este documento detalla la estructura completa del sitio web de la Liga de Beisbol Navajoa Ejidal.

```
lbnbacabachizs/
│
├── 📄 index.html                    # Página principal del sitio
│
├── 📁 css/
│   └── 📄 styles.css                # Estilos principales (todos los estilos del sitio)
│
├── 📁 js/
│   ├── 📄 main.js                   # JavaScript principal (interactividad)
│   └── 📄 data.js                   # Datos de equipos, calendario, etc.
│
├── 📁 assets/
│   ├── 📁 images/                   # Imágenes generales (fotos, banners, etc.)
│   │   └── (vacía - agregar imágenes aquí)
│   │
│   └── 📁 logos/                    # Logos de equipos y patrocinadores
│       └── (vacía - agregar logos aquí)
│
├── 📁 pages/                        # Páginas adicionales del sitio
│   ├── 📄 rosters.html              # Página de rosters de equipos
│   ├── 📄 estadisticas.html         # Página de estadísticas
│   └── 📄 contacto.html             # Página de contacto
│
├── 📄 README.md                     # Documentación principal del proyecto
├── 📄 CONTRIBUTING.md               # Guía para actualizar contenido
├── 📄 ESTRUCTURA.md                 # Este archivo - estructura del proyecto
└── 📄 .gitignore                    # Archivos a ignorar en git
```

## 📋 Descripción de Archivos

### Archivos Principales

#### `index.html`
- **Propósito**: Página principal del sitio web
- **Contiene**:
  - Header con logo y navegación
  - Banner de bienvenida
  - Grid de 12 equipos
  - Últimas noticias (3 noticias destacadas)
  - Tabla de posiciones (6 equipos visibles)
  - Próximos juegos (3 juegos)
  - Galería de fotos
  - Sección de patrocinadores
  - Footer con información de contacto

### Carpeta CSS

#### `css/styles.css`
- **Propósito**: Todos los estilos del sitio web
- **Secciones**:
  - Reset y configuración base
  - Header y navegación (con submenú)
  - Banner principal
  - Secciones y contenedores
  - Grids de equipos
  - Cards de noticias
  - Tabla de posiciones
  - Calendario de juegos
  - Galería
  - Patrocinadores
  - Footer
  - Media queries para responsive

### Carpeta JavaScript

#### `js/main.js`
- **Propósito**: Funcionalidad principal del sitio
- **Funciones actuales**:
  - `initializeNavigation()`: Scroll suave para enlaces internos
  - `initializeTeamCards()`: Interactividad de tarjetas de equipos
- **Funciones preparadas para el futuro**:
  - `updateStandings()`: Actualizar tabla de posiciones
  - `loadNews()`: Cargar noticias dinámicamente
  - `loadSchedule()`: Cargar calendario de juegos

#### `js/data.js`
- **Propósito**: Almacenamiento de datos estructurados
- **Contiene**:
  - Array de 12 equipos con id, nombre, logo y color
  - Calendario de juegos
  - Tabla de posiciones inicial
  - Noticias
  - Información de contacto
  - Datos de temporada actual

### Carpeta Assets

#### `assets/images/`
- **Propósito**: Almacenar imágenes generales del sitio
- **Uso recomendado**:
  - Fotos de juegos para la galería
  - Imágenes para noticias
  - Banners promocionales
  - Fotos de eventos

#### `assets/logos/`
- **Propósito**: Almacenar logos de equipos y patrocinadores
- **Archivos sugeridos**:
  - `aguilas.png`
  - `tigres.png`
  - `leones.png`
  - `broncos.png`
  - `diablos.png`
  - `potros.png`
  - `vaqueros.png`
  - `halcones.png`
  - `osos.png`
  - `pumas.png`
  - `rayos.png`
  - `sultanes.png`
  - `sponsor-1.png`, `sponsor-2.png`, etc.

### Carpeta Pages

#### `pages/rosters.html`
- **Propósito**: Mostrar rosters completos de cada equipo
- **Estado**: Estructura creada, contenido pendiente

#### `pages/estadisticas.html`
- **Propósito**: Mostrar líderes de bateo y pitcheo
- **Estado**: Estructura creada, datos pendientes

#### `pages/contacto.html`
- **Propósito**: Información de contacto y ubicación
- **Estado**: Completa con información básica

### Archivos de Documentación

#### `README.md`
- Documentación principal del proyecto
- Características del sitio
- Instrucciones de uso
- Roadmap de mejoras futuras

#### `CONTRIBUTING.md`
- Guía paso a paso para actualizar contenido
- Instrucciones para modificar noticias, juegos, estadísticas
- Solución a problemas comunes

#### `.gitignore`
- Archivos y carpetas a ignorar en control de versiones

## 🎨 Paleta de Colores

| Color | Código Hex | Uso |
|-------|-----------|-----|
| Azul Principal | `#1e3c72` | Headers, títulos, elementos principales |
| Azul Secundario | `#2a5298` | Navegación, submenús |
| Rojo | `#c41e3a` | Acentos, hover, bordes importantes |
| Gris Oscuro | `#333` | Texto principal |
| Gris Claro | `#f5f5f5` | Fondos de cards, alternancia de filas |

## 📱 Características Responsive

El sitio está optimizado para:
- 📱 **Móviles**: < 768px (navegación vertical, grid 2 columnas)
- 📱 **Tablets**: 768px - 1024px (navegación adaptable)
- 💻 **Desktop**: > 1024px (vista completa con todos los elementos)

## 🔄 Flujo de Navegación

```
index.html (Inicio)
    │
    ├─► pages/rosters.html (Rosters de Equipos)
    │
    ├─► pages/estadisticas.html (Estadísticas)
    │
    ├─► pages/contacto.html (Contacto)
    │
    └─► Anclas internas:
        ├─ #equipos (Grid de equipos)
        ├─ #noticias (Últimas noticias)
        ├─ #standing (Tabla de posiciones)
        ├─ #rol-juegos (Próximos juegos)
        ├─ #galeria (Galería de fotos)
        └─ #patrocinadores (Patrocinadores)
```

## ✅ Estado Actual del Proyecto

### Completado ✓
- [x] Estructura de carpetas organizada
- [x] Separación de HTML, CSS y JavaScript
- [x] Página principal completamente funcional
- [x] Navegación con submenús
- [x] Diseño responsive
- [x] Páginas secundarias (estructura base)
- [x] Sistema de datos preparado para contenido dinámico
- [x] Documentación completa

### Pendiente 📝
- [ ] Agregar logos reales de equipos
- [ ] Llenar rosters con jugadores reales
- [ ] Conectar estadísticas con datos reales
- [ ] Implementar galería de fotos funcional
- [ ] Agregar logos de patrocinadores
- [ ] Crear páginas faltantes (Altas y Bajas, Formatos)
- [ ] Implementar sistema de noticias dinámico
- [ ] Agregar redes sociales

## 🚀 Próximos Pasos Recomendados

1. **Contenido Visual**:
   - Agregar logos de equipos en `assets/logos/`
   - Subir fotos para la galería en `assets/images/`

2. **Información de Equipos**:
   - Completar rosters en `pages/rosters.html`
   - Actualizar datos en `js/data.js`

3. **Funcionalidad Dinámica**:
   - Implementar carga dinámica de noticias
   - Conectar tabla de posiciones con datos reales
   - Sistema de actualización automática

4. **Páginas Adicionales**:
   - Crear página de Altas y Bajas
   - Crear página de Formatos y Documentos
   - Página individual para cada equipo

## 📞 Información de Contacto

**Liga de Beisbol Navajoa Ejidal**
- 📧 Email: contacto@ligaejidal.com
- 📱 Teléfono: (642) 123-4567
- 📍 Ubicación: Zona Sur Bacabachi, Navajoa

---

**Temporada 2024-2025** | Última actualización: Noviembre 2025


