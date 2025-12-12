/**
 * Sistema de gestión de galería de fotos
 * Liga de Beisbol Navojoa Ejidal
 */

const GALLERY_STORAGE_KEY = 'liga_navojoa_gallery';

// Determinar la ruta correcta según la ubicación
function getGalleryJsonUrl() {
    const isInSubfolder = window.location.pathname.includes('/pages/');
    return isInSubfolder ? '../data/gallery.json' : 'data/gallery.json';
}

/**
 * Obtiene todas las fotos guardadas (primero intenta localStorage, luego el servidor)
 * @returns {Array} Array de fotos ordenadas por fecha (más recientes primero)
 */
function getAllGalleryPhotos() {
    // Si estamos en el panel admin, usar localStorage
    if (window.location.pathname.includes('admin-resultados.html')) {
        const stored = localStorage.getItem(GALLERY_STORAGE_KEY);
        if (stored) {
            try {
                const photos = JSON.parse(stored);
                // Ordenar por fecha (más recientes primero)
                return photos.sort((a, b) => new Date(b.date) - new Date(a.date));
            } catch (e) {
                console.error('Error al cargar fotos:', e);
                return [];
            }
        }
        return [];
    }
    
    // Para el sitio público, usar datos del servidor
    const galleryData = window.galleryData || [];
    return galleryData.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Carga las fotos desde el servidor (archivo JSON)
 * @returns {Promise} Promesa con las fotos
 */
async function loadGalleryFromServer() {
    try {
        const url = getGalleryJsonUrl();
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            window.galleryData = data;
            return data;
        }
    } catch (e) {
        console.log('Usando galería vacía (archivo no encontrado o vacío)');
    }
    window.galleryData = [];
    return [];
}

/**
 * Guarda las fotos en localStorage
 * @param {Array} photos - Array de fotos
 */
function saveGallery(photos) {
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(photos));
}

/**
 * Agrega una nueva foto
 * @param {Object} photoItem - Objeto con los datos de la foto
 * @returns {boolean} true si fue exitoso
 */
function addGalleryPhoto(photoItem) {
    try {
        const photos = getAllGalleryPhotos();
        const newItem = {
            id: Date.now().toString(),
            url: photoItem.url,
            title: photoItem.title || 'Foto de la liga',
            date: photoItem.date || new Date().toISOString().split('T')[0]
        };
        photos.push(newItem);
        saveGallery(photos);
        return true;
    } catch (e) {
        console.error('Error al agregar foto:', e);
        return false;
    }
}

/**
 * Elimina una foto
 * @param {string} id - ID de la foto
 * @returns {boolean} true si fue exitoso
 */
function deleteGalleryPhoto(id) {
    try {
        const photos = getAllGalleryPhotos();
        const filtered = photos.filter(item => item.id !== id);
        saveGallery(filtered);
        return true;
    } catch (e) {
        console.error('Error al eliminar foto:', e);
        return false;
    }
}

/**
 * Obtiene todas las fotos (para mostrar en la galería)
 * @returns {Array} Array con todas las fotos
 */
function getAllPhotos() {
    return getAllGalleryPhotos();
}

