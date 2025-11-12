/**
 * Sistema de gestión de resultados de juegos
 * Liga de Beisbol Navojoa Ejidal
 */

const STORAGE_KEY = 'liga_navojoa_results';

// Determinar la ruta correcta según la ubicación
function getResultsJsonUrl() {
    const isInSubfolder = window.location.pathname.includes('/pages/');
    return isInSubfolder ? '../data/results.json' : 'data/results.json';
}

/**
 * Obtiene todos los resultados guardados (primero intenta localStorage, luego el servidor)
 * @returns {Object} Objeto con todos los resultados
 */
function getGameResults() {
    // Si estamos en el panel admin, usar localStorage
    if (window.location.pathname.includes('admin-resultados.html')) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error al cargar resultados:', e);
                return {};
            }
        }
        return {};
    }
    
    // Para el sitio público, se cargarán desde JSON (ver loadResultsFromServer)
    return window.resultsData || {};
}

/**
 * Carga los resultados desde el servidor (archivo JSON)
 * @returns {Promise} Promesa con los resultados
 */
async function loadResultsFromServer() {
    try {
        const url = getResultsJsonUrl();
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            window.resultsData = data;
            return data;
        }
    } catch (e) {
        console.log('Usando resultados vacíos (archivo no encontrado o vacío)');
    }
    window.resultsData = {};
    return {};
}

/**
 * Obtiene el resultado de un juego específico
 * @param {number} jornada - Número de jornada
 * @param {string} homeTeam - Equipo local
 * @param {string} awayTeam - Equipo visitante
 * @returns {Object|null} Resultado del juego o null si no existe
 */
function getGameResult(jornada, homeTeam, awayTeam) {
    const results = getGameResults();
    const gameKey = `j${jornada}_${homeTeam}_${awayTeam}`;
    return results[gameKey] || null;
}

/**
 * Verifica si un juego tiene resultado guardado
 * @param {number} jornada - Número de jornada
 * @param {string} homeTeam - Equipo local
 * @param {string} awayTeam - Equipo visitante
 * @returns {boolean} true si tiene resultado
 */
function hasGameResult(jornada, homeTeam, awayTeam) {
    const result = getGameResult(jornada, homeTeam, awayTeam);
    return result !== null && result.homeScore !== '' && result.awayScore !== '';
}

/**
 * Formatea el marcador de un juego
 * @param {Object} result - Objeto con homeScore y awayScore
 * @returns {string} Marcador formateado
 */
function formatScore(result) {
    if (!result || result.homeScore === '' || result.awayScore === '') {
        return 'Por confirmar';
    }
    return `${result.homeScore} - ${result.awayScore}`;
}

/**
 * Obtiene el ganador de un juego
 * @param {Object} result - Objeto con homeScore y awayScore
 * @param {string} homeTeam - Equipo local
 * @param {string} awayTeam - Equipo visitante
 * @returns {Object} Objeto con winner (nombre del ganador) y tie (boolean)
 */
function getWinner(result, homeTeam, awayTeam) {
    if (!result || result.homeScore === '' || result.awayScore === '') {
        return { winner: null, tie: false };
    }
    
    if (result.homeScore === result.awayScore) {
        return { winner: null, tie: true };
    }
    
    return {
        winner: result.homeScore > result.awayScore ? homeTeam : awayTeam,
        tie: false
    };
}

/**
 * Cuenta las estadísticas de resultados
 * @returns {Object} Estadísticas de resultados
 */
function getResultsStats() {
    const results = getGameResults();
    const totalGames = schedule.filter(g => g.homeTeam && g.awayTeam).length;
    const gamesWithResults = Object.keys(results).length;
    const gamesWithoutResults = totalGames - gamesWithResults;
    
    return {
        total: totalGames,
        withResults: gamesWithResults,
        withoutResults: gamesWithoutResults,
        percentage: totalGames > 0 ? Math.round((gamesWithResults / totalGames) * 100) : 0
    };
}

/**
 * Exporta los resultados como JSON
 * @returns {string} JSON string con todos los resultados
 */
function exportResults() {
    const results = getGameResults();
    return JSON.stringify(results, null, 2);
}

/**
 * Importa resultados desde JSON
 * @param {string} jsonString - String JSON con los resultados
 * @returns {boolean} true si fue exitoso
 */
function importResults(jsonString) {
    try {
        const results = JSON.parse(jsonString);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
        return true;
    } catch (e) {
        console.error('Error al importar resultados:', e);
        return false;
    }
}

/**
 * Calcula la tabla de posiciones basándose en los resultados
 * @returns {Array} Array de objetos con las posiciones de cada equipo
 */
function calculateStandings() {
    const results = getGameResults();
    const teamStats = {};
    
    // Inicializar estadísticas para todos los equipos
    if (typeof teams !== 'undefined') {
        teams.forEach(team => {
            teamStats[team.name] = {
                team: team.name,
                games: 0,
                wins: 0,
                losses: 0,
                ties: 0,
                runsScored: 0,
                runsAllowed: 0,
                average: 0
            };
        });
    }
    
    // Procesar todos los resultados
    Object.entries(results).forEach(([gameKey, result]) => {
        if (!result || result.homeScore === '' || result.awayScore === '') return;
        
        // Extraer información del gameKey: j{jornada}_{homeTeam}_{awayTeam}
        const parts = gameKey.split('_');
        if (parts.length < 3) return;
        
        const homeTeam = parts.slice(1, -1).join('_');
        const awayTeam = parts[parts.length - 1];
        
        // Verificar que los equipos existan en nuestras estadísticas
        if (!teamStats[homeTeam] || !teamStats[awayTeam]) return;
        
        const homeScore = parseInt(result.homeScore);
        const awayScore = parseInt(result.awayScore);
        
        // Actualizar juegos jugados
        teamStats[homeTeam].games++;
        teamStats[awayTeam].games++;
        
        // Actualizar carreras
        teamStats[homeTeam].runsScored += homeScore;
        teamStats[homeTeam].runsAllowed += awayScore;
        teamStats[awayTeam].runsScored += awayScore;
        teamStats[awayTeam].runsAllowed += homeScore;
        
        // Determinar ganador
        if (homeScore > awayScore) {
            teamStats[homeTeam].wins++;
            teamStats[awayTeam].losses++;
        } else if (awayScore > homeScore) {
            teamStats[awayTeam].wins++;
            teamStats[homeTeam].losses++;
        } else {
            // Empate (poco común en beisbol, pero posible)
            teamStats[homeTeam].ties++;
            teamStats[awayTeam].ties++;
        }
    });
    
    // Calcular porcentaje y convertir a array
    const standingsArray = Object.values(teamStats).map(stats => {
        // Calcular porcentaje de victorias
        if (stats.games > 0) {
            stats.average = (stats.wins / stats.games).toFixed(3);
        } else {
            stats.average = '.000';
        }
        
        // Calcular diferencia de carreras
        stats.runDiff = stats.runsScored - stats.runsAllowed;
        
        return stats;
    });
    
    // Ordenar por porcentaje (mayor a menor), luego por diferencia de carreras
    standingsArray.sort((a, b) => {
        const avgDiff = parseFloat(b.average) - parseFloat(a.average);
        if (avgDiff !== 0) return avgDiff;
        
        // Si tienen el mismo porcentaje, ordenar por diferencia de carreras
        return b.runDiff - a.runDiff;
    });
    
    // Asignar posiciones
    standingsArray.forEach((team, index) => {
        team.position = index + 1;
    });
    
    return standingsArray;
}

/**
 * Obtiene las estadísticas de un equipo específico
 * @param {string} teamName - Nombre del equipo
 * @returns {Object|null} Estadísticas del equipo
 */
function getTeamStats(teamName) {
    const standings = calculateStandings();
    return standings.find(team => team.team === teamName) || null;
}

/**
 * Obtiene el líder de la liga
 * @returns {Object|null} Equipo en primer lugar
 */
function getLeader() {
    const standings = calculateStandings();
    return standings.length > 0 ? standings[0] : null;
}

