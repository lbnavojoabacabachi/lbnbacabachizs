/**
 * Liga de Beisbol Navajoa Ejidal - Zona Sur Bacabachi
 * JavaScript principal del sitio web
 * Temporada 2024-2025
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Liga de Beisbol Navajoa Ejidal - Sitio Web Cargado');
    
    // Inicializar funcionalidades
    initializeNavigation();
    initializeTeamCards();
    loadUpcomingGames();
    loadStandingsTable();
    loadNewsSection();
    initAdminShortcut();
    
});

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
            console.log(`Equipo seleccionado: ${teamName}`);
            // Aquí se puede agregar funcionalidad para mostrar más información del equipo
        });
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
                ${index === 0 ? '🏆' : ''}
            </td>
            <td>${team.games}</td>
            <td style="color: #28a745; font-weight: bold;">${team.wins}</td>
            <td style="color: #dc3545;">${team.losses}</td>
            <td style="font-weight: bold;">${team.average}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Si no hay resultados, mostrar mensaje
    if (standings.every(team => team.games === 0)) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: #666;">
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
        html += `
            <div class="news-card">
                <div class="news-image">${item.emoji}</div>
                <div class="news-content">
                    <p class="news-date">${formattedDate}</p>
                    <h3>${item.title}</h3>
                    <p>${item.content}</p>
                </div>
            </div>
        `;
    });

    newsGrid.innerHTML = html;
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
    if (typeof getGameResult === 'function') {
        const result = getGameResult(game.jornada, game.homeTeam, game.awayTeam);
        if (result && result.homeScore !== '' && result.awayScore !== '') {
            statusText = `${result.homeScore} - ${result.awayScore}`;
            statusColor = '#c41e3a';
            
            // Determinar ganador para resaltar
            if (result.homeScore > result.awayScore) {
                statusText += ' 🏆';
            } else if (result.awayScore > result.homeScore) {
                statusText = '🏆 ' + statusText;
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


