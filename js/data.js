/**
 * Datos de configuración de la Liga de Beisbol Navajoa Ejidal
 * Este archivo contiene toda la información de equipos, jugadores, etc.
 */

// Información de los equipos
const teams = [
    {
        id: 1,
        name: "Astros",
        logo: "assets/logos/teams/astros.jpeg",
        color: "#c41e3a",
        roster: []
    },
    {
        id: 2,
        name: "Venados de Batayaui",
        logo: "assets/logos/teams/venados.jpeg",
        color: "#ffd700",
        roster: []
    },
    {
        id: 3,
        name: "Guerreros de Chente Meza",
        logo: "assets/logos/teams/guerreros.jpeg",
        color: "#ffd700",
        roster: []
    },
    {
        id: 4,
        name: "Indios de Chirajobampo",
        logo: "assets/logos/teams/indios.jpeg",
        color: "#c41e3a",
        roster: []
    },
    {
        id: 5,
        name: "Chicos de Sinahuiza",
        logo: "assets/logos/teams/chicos.jpeg",
        color: "#ff8c00",
        roster: []
    },
    {
        id: 6,
        name: "Rancheros de Buayums",
        logo: "assets/logos/teams/rancheros.jpeg",
        color: "#ffd700",
        roster: []
    },
    {
        id: 7,
        name: "Tigrillos de Bacabachi",
        logo: "assets/logos/teams/tigrillos.jpeg",
        color: "#1e3c72",
        roster: []
    },
    {
        id: 8,
        name: "Rojos de Bacabachi",
        logo: "assets/logos/teams/rojos.jpeg",
        color: "#c41e3a",
        roster: []
    },
    {
        id: 9,
        name: "Saneal",
        logo: "assets/logos/teams/saneal.jpeg",
        color: "#ffd700",
        roster: []
    }
];

// Calendario de juegos - Temporada 2024-2025
const schedule = [
    // PRIMERA VUELTA
    // Jornada 1 - 25 de octubre de 2025
    { jornada: 1, date: "2025-10-25", homeTeam: "Venados de Batayaui", awayTeam: "Chicos de Sinahuiza", status: "completed" },
    { jornada: 1, date: "2025-10-25", homeTeam: "Astros", awayTeam: "Tigrillos de Bacabachi", status: "completed" },
    { jornada: 1, date: "2025-10-25", homeTeam: "Rojos de Bacabachi", awayTeam: "Rancheros de Buayums", status: "completed" },
    { jornada: 1, date: "2025-10-25", homeTeam: "Guerreros de Chente Meza", awayTeam: "Indios de Chirajobampo", status: "completed" },
    { jornada: 1, descansa: "Saneal" },
    
    // Jornada 2 - 09 de noviembre del 2025
    { jornada: 2, date: "2025-11-09", homeTeam: "Chicos de Sinahuiza", awayTeam: "Astros", status: "completed" },
    { jornada: 2, date: "2025-11-09", homeTeam: "Rancheros de Buayums", awayTeam: "Saneal", status: "completed" },
    { jornada: 2, date: "2025-11-09", homeTeam: "Tigrillos de Bacabachi", awayTeam: "Guerreros de Chente Meza", status: "completed" },
    { jornada: 2, date: "2025-11-09", homeTeam: "Rojos de Bacabachi", awayTeam: "Venados de Batayaui", status: "completed" },
    { jornada: 2, descansa: "Indios de Chirajobampo" },
    
    // Jornada 3 - 16 de noviembre del 2025
    { jornada: 3, date: "2025-11-16", homeTeam: "Guerreros de Chente Meza", awayTeam: "Rojos de Bacabachi", status: "pending" },
    { jornada: 3, date: "2025-11-16", homeTeam: "Saneal", awayTeam: "Chicos de Sinahuiza", status: "pending" },
    { jornada: 3, date: "2025-11-16", homeTeam: "Indios de Chirajobampo", awayTeam: "Tigrillos de Bacabachi", status: "pending" },
    { jornada: 3, date: "2025-11-16", homeTeam: "Astros", awayTeam: "Rancheros de Buayums", status: "pending" },
    { jornada: 3, descansa: "Venados de Batayaui" },
    
    // Jornada 4 - 23 de noviembre del 2025
    { jornada: 4, date: "2025-11-23", homeTeam: "Rojos de Bacabachi", awayTeam: "Saneal", status: "pending" },
    { jornada: 4, date: "2025-11-23", homeTeam: "Tigrillos de Bacabachi", awayTeam: "Chicos de Sinahuiza", status: "pending" },
    { jornada: 4, date: "2025-11-23", homeTeam: "Rancheros de Buayums", awayTeam: "Guerreros de Chente Meza", status: "pending" },
    { jornada: 4, date: "2025-11-23", homeTeam: "Venados de Batayaui", awayTeam: "Indios de Chirajobampo", status: "pending" },
    { jornada: 4, descansa: "Astros" },
    
    // Jornada 5 - 30 de noviembre del 2025
    { jornada: 5, date: "2025-11-30", homeTeam: "Chicos de Sinahuiza", awayTeam: "Rojos de Bacabachi", status: "pending" },
    { jornada: 5, date: "2025-11-30", homeTeam: "Indios de Chirajobampo", awayTeam: "Astros", status: "pending" },
    { jornada: 5, date: "2025-11-30", homeTeam: "Guerreros de Chente Meza", awayTeam: "Venados de Batayaui", status: "pending" },
    { jornada: 5, date: "2025-11-30", homeTeam: "Saneal", awayTeam: "Tigrillos de Bacabachi", status: "pending" },
    { jornada: 5, descansa: "Rancheros de Buayums" },
    
    // Jornada 6 - 07 de diciembre del 2025
    { jornada: 6, date: "2025-12-07", homeTeam: "Tigrillos de Bacabachi", awayTeam: "Rancheros de Buayums", status: "pending" },
    { jornada: 6, date: "2025-12-07", homeTeam: "Venados de Batayaui", awayTeam: "Saneal", status: "pending" },
    { jornada: 6, date: "2025-12-07", homeTeam: "Guerreros de Chente Meza", awayTeam: "Astros", status: "pending" },
    { jornada: 6, date: "2025-12-07", homeTeam: "Chicos de Sinahuiza", awayTeam: "Indios de Chirajobampo", status: "pending" },
    { jornada: 6, descansa: "Rojos de Bacabachi" },
    
    // Jornada 7 - 14 de diciembre del 2025
    { jornada: 7, date: "2025-12-14", homeTeam: "Astros", awayTeam: "Rojos de Bacabachi", status: "pending" },
    { jornada: 7, date: "2025-12-14", homeTeam: "Saneal", awayTeam: "Indios de Chirajobampo", status: "pending" },
    { jornada: 7, date: "2025-12-14", homeTeam: "Rancheros de Buayums", awayTeam: "Chicos de Sinahuiza", status: "pending" },
    { jornada: 7, date: "2025-12-14", homeTeam: "Tigrillos de Bacabachi", awayTeam: "Venados de Batayaui", status: "pending" },
    { jornada: 7, descansa: "Guerreros de Chente Meza" },
    
    // Jornada 8 - 21 de diciembre del 2025
    { jornada: 8, date: "2025-12-21", homeTeam: "Venados de Batayaui", awayTeam: "Astros", status: "pending" },
    { jornada: 8, date: "2025-12-21", homeTeam: "Rojos de Bacabachi", awayTeam: "Tigrillos de Bacabachi", status: "pending" },
    { jornada: 8, date: "2025-12-21", homeTeam: "Indios de Chirajobampo", awayTeam: "Rancheros de Buayums", status: "pending" },
    { jornada: 8, date: "2025-12-21", homeTeam: "Guerreros de Chente Meza", awayTeam: "Saneal", status: "pending" },
    { jornada: 8, descansa: "Chicos de Sinahuiza" },
    
    // Jornada 9 - 28 de diciembre del 2025
    { jornada: 9, date: "2025-12-28", homeTeam: "Indios de Chirajobampo", awayTeam: "Rojos de Bacabachi", status: "pending" },
    { jornada: 9, date: "2025-12-28", homeTeam: "Chicos de Sinahuiza", awayTeam: "Guerreros de Chente Meza", status: "pending" },
    { jornada: 9, date: "2025-12-28", homeTeam: "Rancheros de Buayums", awayTeam: "Venados de Batayaui", status: "pending" },
    { jornada: 9, date: "2025-12-28", homeTeam: "Astros", awayTeam: "Saneal", status: "pending" },
    { jornada: 9, descansa: "Tigrillos de Bacabachi" },
    
    // SEGUNDA VUELTA
    // Jornada 10 - 04 de enero del 2026
    { jornada: 10, date: "2026-01-04", homeTeam: "Chicos de Sinahuiza", awayTeam: "Venados de Batayaui", status: "pending" },
    { jornada: 10, date: "2026-01-04", homeTeam: "Tigrillos de Bacabachi", awayTeam: "Astros", status: "pending" },
    { jornada: 10, date: "2026-01-04", homeTeam: "Rancheros de Buayums", awayTeam: "Rojos de Bacabachi", status: "pending" },
    { jornada: 10, date: "2026-01-04", homeTeam: "Indios de Chirajobampo", awayTeam: "Guerreros de Chente Meza", status: "pending" },
    { jornada: 10, descansa: "Saneal" },
    
    // Jornada 11 - 11 de enero del 2026
    { jornada: 11, date: "2026-01-11", homeTeam: "Astros", awayTeam: "Chicos de Sinahuiza", status: "pending" },
    { jornada: 11, date: "2026-01-11", homeTeam: "Saneal", awayTeam: "Rancheros de Buayums", status: "pending" },
    { jornada: 11, date: "2026-01-11", homeTeam: "Guerreros de Chente Meza", awayTeam: "Tigrillos de Bacabachi", status: "pending" },
    { jornada: 11, date: "2026-01-11", homeTeam: "Venados de Batayaui", awayTeam: "Rojos de Bacabachi", status: "pending" },
    { jornada: 11, descansa: "Indios de Chirajobampo" },
    
    // Jornada 12 - 18 de enero del 2026
    { jornada: 12, date: "2026-01-18", homeTeam: "Rojos de Bacabachi", awayTeam: "Guerreros de Chente Meza", status: "pending" },
    { jornada: 12, date: "2026-01-18", homeTeam: "Chicos de Sinahuiza", awayTeam: "Saneal", status: "pending" },
    { jornada: 12, date: "2026-01-18", homeTeam: "Tigrillos de Bacabachi", awayTeam: "Indios de Chirajobampo", status: "pending" },
    { jornada: 12, date: "2026-01-18", homeTeam: "Rancheros de Buayums", awayTeam: "Astros", status: "pending" },
    { jornada: 12, descansa: "Venados de Batayaui" },
    
    // Jornada 13 - 25 de enero del 2026
    { jornada: 13, date: "2026-01-25", homeTeam: "Saneal", awayTeam: "Rojos de Bacabachi", status: "pending" },
    { jornada: 13, date: "2026-01-25", homeTeam: "Chicos de Sinahuiza", awayTeam: "Tigrillos de Bacabachi", status: "pending" },
    { jornada: 13, date: "2026-01-25", homeTeam: "Guerreros de Chente Meza", awayTeam: "Rancheros de Buayums", status: "pending" },
    { jornada: 13, date: "2026-01-25", homeTeam: "Indios de Chirajobampo", awayTeam: "Venados de Batayaui", status: "pending" },
    { jornada: 13, descansa: "Astros" },
    
    // Jornada 14 - 01 de febrero del 2026
    { jornada: 14, date: "2026-02-01", homeTeam: "Rojos de Bacabachi", awayTeam: "Chicos de Sinahuiza", status: "pending" },
    { jornada: 14, date: "2026-02-01", homeTeam: "Astros", awayTeam: "Indios de Chirajobampo", status: "pending" },
    { jornada: 14, date: "2026-02-01", homeTeam: "Venados de Batayaui", awayTeam: "Guerreros de Chente Meza", status: "pending" },
    { jornada: 14, date: "2026-02-01", homeTeam: "Tigrillos de Bacabachi", awayTeam: "Saneal", status: "pending" },
    { jornada: 14, descansa: "Rancheros de Buayums" },
    
    // Jornada 15 - 08 de febrero del 2026
    { jornada: 15, date: "2026-02-08", homeTeam: "Rancheros de Buayums", awayTeam: "Tigrillos de Bacabachi", status: "pending" },
    { jornada: 15, date: "2026-02-08", homeTeam: "Saneal", awayTeam: "Venados de Batayaui", status: "pending" },
    { jornada: 15, date: "2026-02-08", homeTeam: "Astros", awayTeam: "Guerreros de Chente Meza", status: "pending" },
    { jornada: 15, date: "2026-02-08", homeTeam: "Indios de Chirajobampo", awayTeam: "Chicos de Sinahuiza", status: "pending" },
    { jornada: 15, descansa: "Rojos de Bacabachi" },
    
    // Jornada 16 - 15 de febrero del 2026
    { jornada: 16, date: "2026-02-15", homeTeam: "Rojos de Bacabachi", awayTeam: "Astros", status: "pending" },
    { jornada: 16, date: "2026-02-15", homeTeam: "Indios de Chirajobampo", awayTeam: "Saneal", status: "pending" },
    { jornada: 16, date: "2026-02-15", homeTeam: "Chicos de Sinahuiza", awayTeam: "Rancheros de Buayums", status: "pending" },
    { jornada: 16, date: "2026-02-15", homeTeam: "Venados de Batayaui", awayTeam: "Tigrillos de Bacabachi", status: "pending" },
    { jornada: 16, descansa: "Guerreros de Chente Meza" },
    
    // Jornada 17 - 22 de febrero del 2026
    { jornada: 17, date: "2026-02-22", homeTeam: "Astros", awayTeam: "Venados de Batayaui", status: "pending" },
    { jornada: 17, date: "2026-02-22", homeTeam: "Tigrillos de Bacabachi", awayTeam: "Rojos de Bacabachi", status: "pending" },
    { jornada: 17, date: "2026-02-22", homeTeam: "Rancheros de Buayums", awayTeam: "Indios de Chirajobampo", status: "pending" },
    { jornada: 17, date: "2026-02-22", homeTeam: "Saneal", awayTeam: "Guerreros de Chente Meza", status: "pending" },
    { jornada: 17, descansa: "Chicos de Sinahuiza" },
    
    // Jornada 18 - 01 de marzo del 2026
    { jornada: 18, date: "2026-03-01", homeTeam: "Rojos de Bacabachi", awayTeam: "Indios de Chirajobampo", status: "pending" },
    { jornada: 18, date: "2026-03-01", homeTeam: "Guerreros de Chente Meza", awayTeam: "Chicos de Sinahuiza", status: "pending" },
    { jornada: 18, date: "2026-03-01", homeTeam: "Venados de Batayaui", awayTeam: "Rancheros de Buayums", status: "pending" },
    { jornada: 18, date: "2026-03-01", homeTeam: "Saneal", awayTeam: "Astros", status: "pending" },
    { jornada: 18, descansa: "Tigrillos de Bacabachi" }
];

// Tabla de posiciones (inicial)
const standings = [
    { position: 1, team: "Astros", games: 0, wins: 0, losses: 0, average: ".000" },
    { position: 2, team: "Venados de Batayaui", games: 0, wins: 0, losses: 0, average: ".000" },
    { position: 3, team: "Guerreros de Chente Meza", games: 0, wins: 0, losses: 0, average: ".000" },
    { position: 4, team: "Indios de Chirajobampo", games: 0, wins: 0, losses: 0, average: ".000" },
    { position: 5, team: "Chicos de Sinahuiza", games: 0, wins: 0, losses: 0, average: ".000" },
    { position: 6, team: "Rancheros de Buayums", games: 0, wins: 0, losses: 0, average: ".000" },
    { position: 7, team: "Tigrillos de Bacabachi", games: 0, wins: 0, losses: 0, average: ".000" },
    { position: 8, team: "Rojos de Bacabachi", games: 0, wins: 0, losses: 0, average: ".000" },
    { position: 9, team: "Saneal", games: 0, wins: 0, losses: 0, average: ".000" }
];

// Noticias
const news = [
    {
        id: 1,
        title: "Inicio de Temporada 2024-2025",
        date: "2025-11-10",
        content: "La liga arranca con gran emoción este fin de semana. Los 12 equipos están listos para demostrar su talento en el diamante.",
        image: "assets/images/news1.jpg"
    },
    {
        id: 2,
        title: "Nuevas Incorporaciones",
        date: "2025-11-08",
        content: "Varios equipos presentan refuerzos de calidad para esta temporada. Conoce las altas más destacadas en nuestra sección.",
        image: "assets/images/news2.jpg"
    },
    {
        id: 3,
        title: "Inauguración del Torneo",
        date: "2025-11-05",
        content: "Gran ceremonia de apertura con la presencia de autoridades locales y representantes de todos los equipos participantes.",
        image: "assets/images/news3.jpg"
    }
];

// Información de contacto
const contactInfo = {
    email: "contacto@ligaejidal.com",
    phone: "(642) 123-4567",
    location: "Zona Sur Bacabachi, Navajoa",
    hours: {
        weekdays: "9:00 AM - 6:00 PM",
        saturday: "10:00 AM - 2:00 PM",
        sunday: "Cerrado"
    }
};

// Temporada actual
const currentSeason = {
    year: "2024-2025",
    startDate: "2025-10-25",
    endDate: "2026-03-01",
    totalJornadas: 18,
    primeraVuelta: 9,
    segundaVuelta: 9
};

// Exportar datos (si se usa módulos en el futuro)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        teams,
        schedule,
        standings,
        news,
        contactInfo,
        currentSeason
    };
}

