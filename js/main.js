/**
 * Liga de Beisbol Navajoa Ejidal - Zona Sur Bacabachi
 * JavaScript principal del sitio web
 * Temporada 2025-2026
 */

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Liga de Beisbol Navajoa Ejidal - Sitio Web Cargado');
    
    // Cargar datos desde el servidor si no estamos en el panel admin
    if (!window.location.pathname.includes('admin-resultados.html')) {
        await loadDataFromServer();
    }
    
    // Inicializar funcionalidades
    initializeMobileMenu();
    initializeNavigation();
    initializeTeamCards();
    loadUpcomingGames();
    loadStandingsTable();
    loadNewsSection();
    loadGallerySection();
    initAdminShortcut();
    initAllStarCards();
    
});

/**
 * Carga los datos desde el servidor (archivos JSON)
 */
async function loadDataFromServer() {
    console.log('📥 Cargando datos desde el servidor...');
    
    try {
        // Cargar resultados, noticias y galería en paralelo
        await Promise.all([
            loadResultsFromServer(),
            loadNewsFromServer(),
            loadGalleryFromServer()
        ]);
        console.log('✅ Datos cargados correctamente');
        
        // Actualizar la tabla de posiciones después de cargar los resultados
        if (typeof loadStandingsTable === 'function') {
            loadStandingsTable();
        }
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
    }
}

/**
 * Inicializa el menú hamburguesa para dispositivos móviles
 */
function initializeMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const submenuToggles = document.querySelectorAll('.has-submenu > a');
    
    if (!menuToggle || !navMenu) return;
    
    // Toggle del menú principal
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Manejo de submenús en móvil
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            // Solo prevenir en móvil
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const parentLi = this.parentElement;
                parentLi.classList.toggle('active');
                
                // Cerrar otros submenús abiertos
                const siblings = Array.from(parentLi.parentElement.children);
                siblings.forEach(sibling => {
                    if (sibling !== parentLi && sibling.classList.contains('has-submenu')) {
                        sibling.classList.remove('active');
                    }
                });
            }
        });
    });
    
    // Cerrar menú al hacer clic en un enlace del menú
    const menuLinks = navMenu.querySelectorAll('a:not(.submenu-toggle)');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                
                // Cerrar submenús
                document.querySelectorAll('.has-submenu').forEach(item => {
                    item.classList.remove('active');
                });
            }
        });
    });
    
    // Cerrar menú al hacer clic fuera de él
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            
            // Cerrar submenús
            document.querySelectorAll('.has-submenu').forEach(item => {
                item.classList.remove('active');
            });
        }
    });
    
    // Ajustar comportamiento al cambiar el tamaño de la ventana
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                navMenu.style.display = '';
                
                // Limpiar estados de submenús
                document.querySelectorAll('.has-submenu').forEach(item => {
                    item.classList.remove('active');
                });
            }
        }, 250);
    });
}

/**
 * Inicializa la navegación del sitio
 */
function initializeNavigation() {
    // Suavizar el scroll al hacer clic en enlaces internos
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId !== '#' && targetId !== '#inicio') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

/**
 * Inicializa las tarjetas de equipos
 */
function initializeTeamCards() {
    const teamCards = document.querySelectorAll('.team-card');
    
    teamCards.forEach(card => {
        card.addEventListener('click', function() {
            const teamName = this.querySelector('h3').textContent;
            openRosterModal(teamName);
        });
    });
    
    // Inicializar el modal de roster
    initializeRosterModal();
}

/**
 * Abre el modal con el roster del equipo
 * @param {string} teamName - Nombre del equipo
 */
function openRosterModal(teamName) {
    if (typeof teams === 'undefined' || typeof getTeamByName !== 'function') {
        console.error('Los datos de equipos no están disponibles');
        return;
    }
    
    const team = getTeamByName(teamName);
    if (!team) {
        console.error(`Equipo no encontrado: ${teamName}`);
        return;
    }
    
    const modal = document.getElementById('rosterModal');
    const modalBody = document.getElementById('rosterModalBody');
    
    if (!modal || !modalBody) return;
    
    // Renderizar el roster usando la función existente
    if (typeof renderTeamRoster === 'function') {
        modalBody.innerHTML = renderTeamRoster(team);
    } else {
        modalBody.innerHTML = `
            <div class="roster-empty">
                <p>Error al cargar el roster. Por favor intenta más tarde.</p>
            </div>
        `;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal del roster
 */
function closeRosterModal() {
    const modal = document.getElementById('rosterModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Inicializa el modal de roster
 */
function initializeRosterModal() {
    const modal = document.getElementById('rosterModal');
    const closeBtn = document.getElementById('rosterModalClose');
    
    if (!modal || !closeBtn) return;
    
    // Cerrar al hacer clic en el botón de cerrar
    closeBtn.addEventListener('click', closeRosterModal);
    
    // Cerrar al hacer clic fuera del contenido
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeRosterModal();
        }
    });
    
    // Cerrar con la tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeRosterModal();
        }
    });
}

/**
 * Carga y muestra la tabla de posiciones basándose en los resultados
 */
function loadStandingsTable() {
    const tbody = document.querySelector('#standings-table tbody');
    if (!tbody) return;
    
    // Verificar si la función calculateStandings está disponible
    if (typeof calculateStandings !== 'function') {
        console.warn('calculateStandings no está disponible');
        return;
    }
    
    const standings = calculateStandings();
    
    // Limpiar la tabla
    tbody.innerHTML = '';
    
    // Generar las filas
    standings.forEach((team, index) => {
        const row = document.createElement('tr');
        
        // Resaltar los primeros 3 lugares
        if (index === 0) {
            row.style.background = 'linear-gradient(135deg, #fff9e6 0%, #fffbf0 100%)';
            row.style.borderLeft = '4px solid #ffd700';
        } else if (index === 1) {
            row.style.background = 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)';
            row.style.borderLeft = '4px solid #c0c0c0';
        } else if (index === 2) {
            row.style.background = 'linear-gradient(135deg, #fff0e6 0%, #fff5ed 100%)';
            row.style.borderLeft = '4px solid #cd7f32';
        }
        
        row.innerHTML = `
            <td style="font-weight: bold;">${team.position}</td>
            <td style="text-align: left; font-weight: ${index < 3 ? 'bold' : 'normal'};">
                ${team.team}
            </td>
            <td>${team.games}</td>
            <td style="color: #28a745; font-weight: bold;">${team.wins}</td>
            <td style="color: #dc3545;">${team.losses}</td>
            <td style="color: #6c757d;">${team.ties}</td>
            <td style="font-weight: bold;">${team.average}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Si no hay resultados, mostrar mensaje
    if (standings.every(team => team.games === 0)) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: #666;">
                    La tabla se actualizará automáticamente conforme se registren los resultados de los juegos
                </td>
            </tr>
        `;
    }
}

/**
 * Función para actualizar la tabla de posiciones (para uso futuro)
 */
function updateStandings(data) {
    // Esta función se implementará cuando conectemos con datos reales
    console.log('Actualizando tabla de posiciones...', data);
    loadStandingsTable();
}

/**
 * Carga la sección de noticias dinámicamente
 */
function loadNewsSection() {
    const newsGrid = document.getElementById('news-grid');
    if (!newsGrid) return;

    // Verificar si la función getLatestNews está disponible
    if (typeof getLatestNews !== 'function') {
        console.warn('getLatestNews no está disponible');
        return;
    }

    const news = getLatestNews(3); // Obtener las 3 noticias más recientes

    if (news.length === 0) {
        // Mostrar mensaje cuando no hay noticias
        newsGrid.innerHTML = `
            <div class="news-card" style="grid-column: 1 / -1;">
                <div class="news-image">📰</div>
                <div class="news-content">
                    <p class="news-date">Próximamente</p>
                    <h3>Noticias en Camino</h3>
                    <p>Las últimas noticias de la liga se publicarán aquí. Mantente atento a nuestras actualizaciones.</p>
                </div>
            </div>
        `;
        return;
    }

    // Renderizar noticias
    let html = '';
    news.forEach(item => {
        const formattedDate = formatNewsDate(item.date);
        const hasImage = item.image ? true : false;
        const imageContent = item.image 
            ? `<img src="${item.image}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` 
            : item.emoji;
        html += `
            <div class="news-card">
                <div class="news-image ${hasImage ? 'has-image' : ''}" data-image="${item.image || ''}" data-title="${item.title}">${imageContent}</div>
                <div class="news-content">
                    <p class="news-date">${formattedDate}</p>
                    <h3>${item.title}</h3>
                    <p>${item.content}</p>
                </div>
            </div>
        `;
    });

    newsGrid.innerHTML = html;
    
    // Agregar event listeners para abrir imágenes en modal
    const newsImages = newsGrid.querySelectorAll('.news-image.has-image');
    newsImages.forEach(imageDiv => {
        imageDiv.addEventListener('click', function() {
            const imageSrc = this.getAttribute('data-image');
            const title = this.getAttribute('data-title');
            if (imageSrc) {
                openImageModal(imageSrc, title);
            }
        });
    });
}

/**
 * Carga y muestra la galería de fotos dinámicamente
 */
function loadGallerySection() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;

    // Verificar si la función getAllPhotos está disponible
    if (typeof getAllPhotos !== 'function') {
        console.warn('getAllPhotos no está disponible');
        return;
    }

    const photos = getAllPhotos();

    if (photos.length === 0) {
        // Mostrar mensaje cuando no hay fotos
        galleryGrid.innerHTML = `
            <div class="gallery-item" style="grid-column: 1 / -1; height: 200px; display: flex; align-items: center; justify-content: center; flex-direction: column; color: #666;">
                <div style="font-size: 3em; margin-bottom: 10px;">📸</div>
                <p style="text-align: center;">Las fotos se cargarán aquí</p>
                <p style="text-align: center; font-size: 0.9em; margin-top: 5px;">Agrega URLs de fotos de Facebook en data/gallery.json</p>
            </div>
        `;
        return;
    }

    // Renderizar fotos
    let html = '';
    photos.forEach((photo, index) => {
        html += `
            <div class="gallery-item" style="background-image: url('${photo.url}'); cursor: pointer;" 
                 onclick="openImageModal('${photo.url}', '${(photo.title || '').replace(/'/g, "\\'")}')" 
                 title="${photo.title || 'Ver foto en tamaño completo'}">
                <div class="gallery-overlay">
                    <span class="gallery-title">${photo.title || ''}</span>
                </div>
            </div>
        `;
    });

    galleryGrid.innerHTML = html;
    
    // Inicializar el modal
    initializeImageModal();
}

/**
 * Inicializa el modal de imágenes
 */
function initializeImageModal() {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    const closeBtn = document.getElementById('modalClose');
    
    if (!modal || !modalImage || !closeBtn) return;
    
    // Cerrar al hacer clic en el botón de cerrar
    closeBtn.addEventListener('click', closeImageModal);
    
    // Cerrar al hacer clic fuera de la imagen
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeImageModal();
        }
    });
    
    // Cerrar con la tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeImageModal();
        }
    });
}

/**
 * Abre el modal con una imagen
 * @param {string} imageUrl - URL de la imagen
 * @param {string} caption - Título o descripción de la imagen
 */
function openImageModal(imageUrl, caption) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    
    if (!modal || !modalImage) return;
    
    modalImage.src = imageUrl;
    modalImage.alt = caption || 'Imagen de la galería';
    
    if (modalCaption) {
        modalCaption.textContent = caption || '';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
}

/**
 * Cierra el modal de imágenes
 */
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restaurar scroll del body
}

/**
 * Función para cargar noticias (para uso futuro)
 */
function loadNews() {
    // Esta función se implementará cuando tengamos un sistema de noticias dinámico
    console.log('Cargando noticias...');
    loadNewsSection();
}

/**
 * Función para cargar el calendario de juegos (para uso futuro)
 */
function loadSchedule() {
    // Esta función se implementará cuando tengamos datos dinámicos del calendario
    console.log('Cargando calendario de juegos...');
}

/**
 * Carga y muestra los próximos juegos basándose en la fecha actual
 */
function loadUpcomingGames() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate date comparison
    
    // Encontrar la próxima jornada
    const nextJornada = findNextJornada(today);
    
    if (nextJornada) {
        displayUpcomingGames(nextJornada);
    } else {
        displayNoGames();
    }
}

/**
 * Encuentra la próxima jornada basándose en la fecha actual
 * @param {Date} currentDate - Fecha actual
 * @returns {number|null} - Número de jornada o null si no hay próximos juegos
 */
function findNextJornada(currentDate) {
    // Agrupar juegos por jornada
    const jornadasMap = {};
    
    schedule.forEach(game => {
        if (game.date) {
            const jornada = game.jornada;
            if (!jornadasMap[jornada]) {
                jornadasMap[jornada] = {
                    date: new Date(game.date + 'T00:00:00'),
                    games: []
                };
            }
            jornadasMap[jornada].games.push(game);
        }
    });
    
    // Encontrar la jornada más cercana que sea hoy o en el futuro
    let nextJornada = null;
    let closestDate = null;
    
    for (const jornada in jornadasMap) {
        const jornadaDate = jornadasMap[jornada].date;
        
        if (jornadaDate >= currentDate) {
            if (!closestDate || jornadaDate < closestDate) {
                closestDate = jornadaDate;
                nextJornada = parseInt(jornada);
            }
        }
    }
    
    return nextJornada;
}

/**
 * Muestra los juegos de una jornada específica
 * @param {number} jornadaNum - Número de jornada a mostrar
 */
function displayUpcomingGames(jornadaNum) {
    const games = schedule.filter(game => game.jornada === jornadaNum);
    
    if (games.length === 0) {
        displayNoGames();
        return;
    }
    
    // Obtener la fecha y el equipo que descansa
    const gameDate = games.find(g => g.date)?.date;
    const teamResting = games.find(g => g.descansa)?.descansa;
    
    // Actualizar el título
    const titleElement = document.getElementById('proximos-juegos-title');
    if (titleElement) {
        titleElement.textContent = `📅 Próximos Juegos - Jornada ${jornadaNum}`;
    }
    
    // Actualizar la fecha
    if (gameDate) {
        const dateElement = document.getElementById('proximos-juegos-date');
        if (dateElement) {
            dateElement.innerHTML = `<strong>${formatGameDate(gameDate)}</strong>`;
        }
    }
    
    // Generar HTML de los juegos
    const gamesContainer = document.getElementById('games-container');
    if (gamesContainer) {
        gamesContainer.innerHTML = games
            .filter(game => game.homeTeam && game.awayTeam)
            .map(game => createGameCard(game))
            .join('');
    }
    
    // Mostrar equipo que descansa
    if (teamResting) {
        const restingElement = document.getElementById('equipo-descansa');
        if (restingElement) {
            restingElement.textContent = `Descansa: ${teamResting}`;
        }
    }
}

/**
 * Crea el HTML para una tarjeta de juego
 * @param {Object} game - Objeto del juego
 * @returns {string} - HTML de la tarjeta
 */
function createGameCard(game) {
    const date = formatGameDate(game.date);
    let statusText = 'Por confirmar';
    let statusColor = '#666';
    
    // Verificar si hay resultado guardado
    if (typeof getGameResult === 'function' && typeof hasGameResult === 'function') {
        const result = getGameResult(game.jornada, game.homeTeam, game.awayTeam);
        if (hasGameResult(game.jornada, game.homeTeam, game.awayTeam)) {
            statusColor = '#c41e3a';
            
            // Formato nuevo: con game1 y game2
            if (result.game1 && result.game2) {
                const g1 = result.game1;
                const g2 = result.game2;
                let homeWins = 0;
                let awayWins = 0;
                
                // Verificar forfeit en juego 1
                let game1Text = '';
                if (g1.forfeit) {
                    game1Text = 'FORFEIT';
                    // Determinar quién ganó por forfeit
                    const homeTeam = game.homeTeam;
                    if (g1.forfeitTeam === homeTeam) {
                        awayWins++; // El visitante gana si el local hizo forfeit
                    } else {
                        homeWins++; // El local gana si el visitante hizo forfeit
                    }
                } else if (g1.homeScore !== undefined && g1.awayScore !== undefined) {
                    game1Text = `${g1.homeScore}-${g1.awayScore}`;
                    if (g1.homeScore > g1.awayScore) homeWins++;
                    else if (g1.awayScore > g1.homeScore) awayWins++;
                }
                
                // Verificar forfeit en juego 2
                let game2Text = '';
                if (g2.forfeit) {
                    game2Text = 'FORFEIT';
                    // Determinar quién ganó por forfeit
                    const homeTeam = game.homeTeam;
                    if (g2.forfeitTeam === homeTeam) {
                        awayWins++; // El visitante gana si el local hizo forfeit
                    } else {
                        homeWins++; // El local gana si el visitante hizo forfeit
                    }
                } else if (g2.homeScore !== undefined && g2.awayScore !== undefined) {
                    game2Text = `${g2.homeScore}-${g2.awayScore}`;
                    if (g2.homeScore > g2.awayScore) homeWins++;
                    else if (g2.awayScore > g2.homeScore) awayWins++;
                }
                
                statusText = `J1: ${game1Text} | J2: ${game2Text}`;
            } 
            // Formato antiguo: solo homeScore y awayScore
            else if (result.homeScore !== '' && result.awayScore !== '') {
                statusText = `${result.homeScore} - ${result.awayScore}`;
            }
        }
    }
    
    return `
        <div class="game-card">
            <div class="game-teams">
                <div class="game-team">${game.homeTeam}</div>
                <div class="vs">VS</div>
                <div class="game-team">${game.awayTeam}</div>
            </div>
            <div class="game-info">
                <p><strong>${date}</strong></p>
                <p style="color: ${statusColor}; font-weight: bold; font-size: 1.1em;">${statusText}</p>
            </div>
        </div>
    `;
}

/**
 * Formatea una fecha en formato legible
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {string} - Fecha formateada
 */
function formatGameDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    
    return `${dayName} ${day} ${month}`;
}

/**
 * Muestra un mensaje cuando no hay próximos juegos
 */
function displayNoGames() {
    const titleElement = document.getElementById('proximos-juegos-title');
    if (titleElement) {
        titleElement.textContent = '📅 Calendario de Juegos';
    }
    
    const dateElement = document.getElementById('proximos-juegos-date');
    if (dateElement) {
        dateElement.textContent = '';
    }
    
    const gamesContainer = document.getElementById('games-container');
    if (gamesContainer) {
        gamesContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <p style="font-size: 1.2em; margin-bottom: 10px;">🏆 ¡La temporada ha finalizado!</p>
                <p>Gracias por seguir la Liga de Beisbol Navojoa Ejidal</p>
            </div>
        `;
    }
    
    const restingElement = document.getElementById('equipo-descansa');
    if (restingElement) {
        restingElement.textContent = '';
    }
}

/**
 * Inicializa los event listeners para las tarjetas del Juego de Estrellas
 * y oculta la sección después de la fecha del evento
 */
function initAllStarCards() {
    const allStarSection = document.querySelector('.all-star-highlight');
    if (!allStarSection) return;
    
    // Verificar si el evento ya pasó (18 de enero de 2026)
    const eventDate = new Date('2026-01-18T23:59:59');
    const today = new Date();
    
    if (today > eventDate) {
        // Ocultar la sección si el evento ya pasó
        allStarSection.style.display = 'none';
        return;
    }
    
    // Si el evento no ha pasado, agregar event listeners para las imágenes
    const allStarCards = allStarSection.querySelectorAll('.all-star-card');
    
    allStarCards.forEach(card => {
        card.addEventListener('click', function() {
            const imageSrc = this.getAttribute('data-image');
            const title = this.getAttribute('data-title');
            if (imageSrc) {
                openImageModal(imageSrc, title);
            }
        });
    });
}

/**
 * Inicializa el atajo de teclado para acceder al panel de administración
 * Presiona Ctrl+Shift+A (o Cmd+Shift+A en Mac) para acceder
 */
function initAdminShortcut() {
    let keySequence = [];
    const secretCode = ['a', 'd', 'm', 'i', 'n']; // Escribir "admin"
    let timeout;
    
    document.addEventListener('keydown', function(e) {
        // Atajo de teclado: Ctrl+Shift+A (o Cmd+Shift+A)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            accessAdminPanel();
            return;
        }
        
        // Código secreto: escribir "admin"
        clearTimeout(timeout);
        keySequence.push(e.key.toLowerCase());
        
        // Mantener solo los últimos 5 caracteres
        if (keySequence.length > secretCode.length) {
            keySequence.shift();
        }
        
        // Verificar si coincide con el código
        if (keySequence.join('') === secretCode.join('')) {
            keySequence = [];
            showAdminHint();
        }
        
        // Resetear después de 2 segundos de inactividad
        timeout = setTimeout(() => {
            keySequence = [];
        }, 2000);
    });
}

/**
 * Muestra una pista sobre cómo acceder al panel de administración
 */
function showAdminHint() {
    const hint = document.createElement('div');
    hint.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #c41e3a 0%, #8b1429 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        cursor: pointer;
    `;
    hint.innerHTML = `
        <strong>🔓 Panel de Administración</strong><br>
        <span style="font-size: 0.9em;">Click aquí para acceder</span>
    `;
    
    hint.addEventListener('click', accessAdminPanel);
    document.body.appendChild(hint);
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        hint.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => hint.remove(), 300);
    }, 5000);
}

/**
 * Redirige al panel de administración
 */
function accessAdminPanel() {
    const isIndex = window.location.pathname.endsWith('index.html') || 
                    window.location.pathname.endsWith('/') ||
                    !window.location.pathname.includes('.html');
    
    if (isIndex) {
        window.location.href = 'pages/admin-resultados.html';
    } else {
        window.location.href = 'admin-resultados.html';
    }
}


