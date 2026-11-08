/**
 * Sistema de visualización de rosters
 * Liga de Beisbol Navojoa Ejidal
 */

/**
 * Obtiene un equipo por su ID
 * @param {number} teamId - ID del equipo
 * @returns {Object|null} Equipo o null si no existe
 */
function getTeamById(teamId) {
    if (typeof teams === 'undefined') {
        console.error('El array teams no está definido');
        return null;
    }
    return teams.find(team => team.id === teamId) || null;
}

/**
 * Obtiene un equipo por su nombre
 * @param {string} teamName - Nombre del equipo
 * @returns {Object|null} Equipo o null si no existe
 */
function getTeamByName(teamName) {
    if (typeof teams === 'undefined') {
        console.error('El array teams no está definido');
        return null;
    }
    return teams.find(team => team.name === teamName) || null;
}

/**
 * Renderiza todos los rosters en la página
 */
function renderAllRosters() {
    const container = document.getElementById('rosters-container');
    if (!container || typeof teams === 'undefined') {
        console.error('No se encontró el contenedor de rosters o teams no está definido');
        return;
    }

    let html = '';

    teams.forEach(team => {
        html += renderTeamRoster(team);
    });

    container.innerHTML = html;
}

/**
 * Renderiza el roster de un equipo
 * @param {Object} team - Objeto del equipo
 * @returns {string} HTML del roster
 */
function renderTeamRoster(team) {
    const hasRoster = team.roster && team.roster.length > 0;
    
    let html = `
        <div class="roster-section" data-team-id="${team.id}">
            <div class="roster-header">
                <img src="${team.logo}" alt="${team.name}" class="roster-logo" onerror="this.style.display='none'">
                <div class="roster-header-info">
                    <h3>${team.name}</h3>
                    ${team.staff ? `
                        <div class="roster-staff">
                            ${team.staff.delegado ? `<p><strong>Delegado:</strong> ${team.staff.delegado}</p>` : ''}
                            ${team.staff.manager ? `<p><strong>Manager:</strong> ${team.staff.manager}</p>` : ''}
                            ${team.staff.coach ? `<p><strong>Coach:</strong> ${team.staff.coach}</p>` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
    `;

    if (hasRoster) {
        html += `
            <div class="roster-table-container">
                <table class="roster-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        team.roster.forEach(player => {
            const categoryClass = getCategoryClass(player.category);
            html += `
                <tr class="${categoryClass}">
                    <td class="player-number">${player.number || '-'}</td>
                    <td class="player-name">${player.name || '-'}</td>
                    <td class="player-category"><span class="category-badge">${player.category || 'LOCAL'}</span></td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
    } else {
        html += `
            <div class="roster-empty">
                <p>El roster de este equipo aún no está disponible.</p>
            </div>
        `;
    }

    html += `</div>`;

    return html;
}

/**
 * Obtiene la clase CSS según la categoría del jugador
 * @param {string} category - Categoría del jugador
 * @returns {string} Clase CSS
 */
function getCategoryClass(category) {
    const categoryMap = {
        'LOCAL': 'category-local',
        'REFUERZO': 'category-refuerzo',
        'NUEVO VALOR': 'category-nuevo-valor',
        'NOVATO': 'category-novato',
        'FORANEO': 'category-foraneo'
    };
    return categoryMap[category] || 'category-local';
}

/**
 * Inicializa la página de rosters cuando se carga
 */
document.addEventListener('DOMContentLoaded', function() {
    // Solo ejecutar si estamos en la página de rosters
    if (window.location.pathname.includes('rosters.html')) {
        renderAllRosters();
    }
});

