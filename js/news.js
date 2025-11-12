/**
 * Sistema de gestión de noticias
 * Liga de Beisbol Navojoa Ejidal
 */

const NEWS_STORAGE_KEY = 'liga_navojoa_news';

/**
 * Obtiene todas las noticias guardadas
 * @returns {Array} Array de noticias ordenadas por fecha (más recientes primero)
 */
function getAllNews() {
    const stored = localStorage.getItem(NEWS_STORAGE_KEY);
    if (stored) {
        try {
            const news = JSON.parse(stored);
            // Ordenar por fecha (más recientes primero)
            return news.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (e) {
            console.error('Error al cargar noticias:', e);
            return [];
        }
    }
    return [];
}

/**
 * Guarda las noticias en localStorage
 * @param {Array} news - Array de noticias
 */
function saveNews(news) {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(news));
}

/**
 * Agrega una nueva noticia
 * @param {Object} newsItem - Objeto con los datos de la noticia
 * @returns {boolean} true si fue exitoso
 */
function addNews(newsItem) {
    try {
        const news = getAllNews();
        const newItem = {
            id: Date.now().toString(),
            title: newsItem.title,
            date: newsItem.date || new Date().toISOString().split('T')[0],
            content: newsItem.content,
            emoji: newsItem.emoji || '📰',
            featured: newsItem.featured || false,
            timestamp: new Date().toISOString()
        };
        news.push(newItem);
        saveNews(news);
        return true;
    } catch (e) {
        console.error('Error al agregar noticia:', e);
        return false;
    }
}

/**
 * Actualiza una noticia existente
 * @param {string} id - ID de la noticia
 * @param {Object} updates - Objeto con los campos a actualizar
 * @returns {boolean} true si fue exitoso
 */
function updateNews(id, updates) {
    try {
        const news = getAllNews();
        const index = news.findIndex(item => item.id === id);
        if (index !== -1) {
            news[index] = { ...news[index], ...updates };
            saveNews(news);
            return true;
        }
        return false;
    } catch (e) {
        console.error('Error al actualizar noticia:', e);
        return false;
    }
}

/**
 * Elimina una noticia
 * @param {string} id - ID de la noticia
 * @returns {boolean} true si fue exitoso
 */
function deleteNews(id) {
    try {
        const news = getAllNews();
        const filtered = news.filter(item => item.id !== id);
        saveNews(filtered);
        return true;
    } catch (e) {
        console.error('Error al eliminar noticia:', e);
        return false;
    }
}

/**
 * Obtiene una noticia específica por ID
 * @param {string} id - ID de la noticia
 * @returns {Object|null} Noticia o null si no existe
 */
function getNewsById(id) {
    const news = getAllNews();
    return news.find(item => item.id === id) || null;
}

/**
 * Obtiene las últimas N noticias
 * @param {number} limit - Cantidad de noticias a obtener
 * @returns {Array} Array con las últimas noticias
 */
function getLatestNews(limit = 3) {
    const news = getAllNews();
    return news.slice(0, limit);
}

/**
 * Formatea una fecha para mostrar
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha formateada
 */
function formatNewsDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} de ${month}, ${year}`;
}

/**
 * Exporta las noticias como JSON
 * @returns {string} JSON string con todas las noticias
 */
function exportNews() {
    const news = getAllNews();
    return JSON.stringify(news, null, 2);
}

/**
 * Importa noticias desde JSON
 * @param {string} jsonString - String JSON con las noticias
 * @returns {boolean} true si fue exitoso
 */
function importNews(jsonString) {
    try {
        const news = JSON.parse(jsonString);
        if (Array.isArray(news)) {
            saveNews(news);
            return true;
        }
        return false;
    } catch (e) {
        console.error('Error al importar noticias:', e);
        return false;
    }
}

