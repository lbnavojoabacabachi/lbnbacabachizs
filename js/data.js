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
        roster: [
            { number: 1, name: "URIEL RAMIREZ", birthDate: "", category: "LOCAL" },
            { number: 2, name: "HERNAN RAMIREZ", birthDate: "", category: "LOCAL" },
            { number: 3, name: "CARLOS MOROYOQUI", birthDate: "", category: "LOCAL" },
            { number: 4, name: "CRISTIAN LOPEZ", birthDate: "", category: "LOCAL" },
            { number: 5, name: "PEDRO COTA", birthDate: "", category: "LOCAL" },
            { number: 6, name: "MARTIN SOMBRA", birthDate: "", category: "LOCAL" },
            { number: 7, name: "JESUS CANO", birthDate: "", category: "LOCAL" },
            { number: 8, name: "EDGAR AYALA", birthDate: "", category: "LOCAL" },
            { number: 9, name: "ELIER SOMBRA", birthDate: "", category: "LOCAL" },
            { number: 10, name: "RAMON RAMIREZ", birthDate: "", category: "LOCAL" },
            { number: 11, name: "RENE MOROYOQUI", birthDate: "", category: "LOCAL" },
            { number: 12, name: "PABLO GIL", birthDate: "", category: "LOCAL" },
            { number: 13, name: "HEYDEN GIL", birthDate: "", category: "LOCAL" },
            { number: 14, name: "ANGEL OSORIO", birthDate: "", category: "LOCAL" },
            { number: 15, name: "RAMON ALBERTO YOCUPICIO", birthDate: "", category: "LOCAL" },
            { number: 16, name: "FELICIANO SOMBRA", birthDate: "", category: "LOCAL" },
            { number: 17, name: "GUSTAVO ESCALANTE", birthDate: "", category: "LOCAL" },
            { number: 18, name: "JOSE YOCUPICIO", birthDate: "", category: "LOCAL" },
            { number: 19, name: "FERNANDO VERDUGO", birthDate: "", category: "LOCAL" },
            { number: 20, name: "ERICK MENDIVIL", birthDate: "", category: "LOCAL" },
            { number: 21, name: "ROBERTO SOMBRA", birthDate: "", category: "LOCAL" },
            { number: 22, name: "HECTOR NEYOY", birthDate: "", category: "LOCAL" },
            { number: 23, name: "HECTOR GONZALES", birthDate: "", category: "LOCAL" },
            { number: 24, name: "JESUS AYALA", birthDate: "", category: "LOCAL" },
            { number: 25, name: "EVERARDO CABRERA", birthDate: "", category: "LOCAL" },
            { number: 26, name: "ANGEL FELIX", birthDate: "", category: "LOCAL" },
            { number: 27, name: "JESUS ROBINSON", birthDate: "", category: "LOCAL" },
            { number: 28, name: "MIGUEL ANTONIO VEGA", birthDate: "", category: "LOCAL" },
            { number: 29, name: "JESUS DAVID ZAZUETA VALENZUELA", birthDate: "", category: "LOCAL" },
            { number: 30, name: "OSCAR MENDOZA", birthDate: "", category: "LOCAL" },
            { number: 31, name: "RODOLFO SOMBRA", birthDate: "", category: "LOCAL" },
            { number: 32, name: "GERARDO CABRERA", birthDate: "", category: "LOCAL" }
        ],
        staff: {
            delegado: "CRISTIAN ANTONIO LOPEZ",
            manager: "",
            coach: ""
        }
    },
    {
        id: 2,
        name: "Venados de Batayaui",
        logo: "assets/logos/teams/venados.jpeg",
        color: "#ffd700",
        roster: [
            { number: 1, name: "VICTOR VALENZUELA GARCIA", birthDate: "", category: "LOCAL" },
            { number: 2, name: "CARLOS MIGUEL MOROYOQUI AYALA", birthDate: "", category: "LOCAL" },
            { number: 3, name: "JORGE VICENTE SALAZAR MOROYOQUI", birthDate: "", category: "LOCAL" },
            { number: 4, name: "JOSE ROSARIO VALENZUELA MOROYOQUI", birthDate: "", category: "LOCAL" },
            { number: 5, name: "ELIAS MANUEL GIL VALENZUELA", birthDate: "", category: "LOCAL" },
            { number: 6, name: "OSCAR FRANCISCO GIL BORBON", birthDate: "", category: "LOCAL" },
            { number: 7, name: "BLADIMIR BARRERAS YOCUPICIO", birthDate: "", category: "LOCAL" },
            { number: 8, name: "JUAN PEDRO YOCUPICIO YOCUPICIO", birthDate: "", category: "LOCAL" },
            { number: 9, name: "PABLO ALONSO GUTIERREZ VERDUGO", birthDate: "", category: "LOCAL" },
            { number: 10, name: "JESUS OMAR GUTIERREZ VERDUGO", birthDate: "", category: "LOCAL" },
            { number: 11, name: "FELIZARDO ZAZUETA YOCUPICIO", birthDate: "", category: "LOCAL" },
            { number: 12, name: "ENRIQUE ANTONIO GUTIERREZ VERDUGO", birthDate: "", category: "LOCAL" },
            { number: 13, name: "MARTIN RENE MOROYOQUI BUITIMEA", birthDate: "", category: "LOCAL" },
            { number: 14, name: "JESUS FRANCISCO PIÑA YOCUPICIO", birthDate: "", category: "LOCAL" },
            { number: 15, name: "MANUEL BARRERAS CAZARES", birthDate: "", category: "LOCAL" },
            { number: 16, name: "JUAN LUIS BARRERAS GARCIA", birthDate: "", category: "LOCAL" },
            { number: 17, name: "VICTOR YOCUPICIO GUTIERREZ", birthDate: "", category: "LOCAL" },
            { number: 18, name: "RAFAEL BORBON MUÑOZ", birthDate: "", category: "LOCAL" },
            { number: 19, name: "HEBERTO GUTIERREZ BENCOMO", birthDate: "", category: "LOCAL" },
            { number: 20, name: "LUIS CARLOS YOCUPICIO GARCIA", birthDate: "", category: "LOCAL" },
            { number: 21, name: "EVERARDO YOCUPICIO GUTIERREZ", birthDate: "", category: "LOCAL" },
            { number: 22, name: "EDUARDO YOCUPICIO GUTIERREZ", birthDate: "", category: "LOCAL" },
            { number: 23, name: "JUAN DE JESUS ALCANTAR MOROYOQUI", birthDate: "", category: "LOCAL" },
            { number: 24, name: "JESUS ADRIAN GOCOBACHI VALENZUELA", birthDate: "", category: "LOCAL" },
            { number: 25, name: "GUADALUPE VALENZUELA BARRERAS", birthDate: "", category: "LOCAL" },
            { number: 26, name: "CRISTIAN JESUS SILLAS VALENZUELA", birthDate: "", category: "LOCAL" },
            { number: 27, name: "MANUEL BARRERAS MOROYOQUI", birthDate: "", category: "LOCAL" },
            { number: 28, name: "FIDEL ANGUAMEA BUSTAMANTE", birthDate: "", category: "LOCAL" },
            { number: 29, name: "JAIME AYALA RUIZ", birthDate: "", category: "LOCAL" },
            { number: 30, name: "MARCOS HERNANDEZ CAMACHO", birthDate: "", category: "LOCAL" }
        ],
        staff: {
            delegado: "",
            manager: "JAIME AYALA RUIZ",
            coach: ""
        }
    },
    {
        id: 3,
        name: "Guerreros de Chente Meza",
        logo: "assets/logos/teams/guerreros.jpeg",
        color: "#ffd700",
        roster: [
            { number: 1, name: "JESUS MEZA", birthDate: "", category: "LOCAL" },
            { number: 2, name: "MARCOS MEZA", birthDate: "", category: "LOCAL" },
            { number: 3, name: "EFREN MEZA", birthDate: "", category: "LOCAL" },
            { number: 4, name: "CARLOS MEZA", birthDate: "", category: "LOCAL" },
            { number: 5, name: "ARTURO MEZA", birthDate: "", category: "LOCAL" },
            { number: 6, name: "VICENTE MEZA", birthDate: "", category: "LOCAL" },
            { number: 7, name: "MARCOS MEZA JR.", birthDate: "", category: "LOCAL" },
            { number: 8, name: "OBED MEZA", birthDate: "", category: "LOCAL" },
            { number: 9, name: "KEVIN MEZA", birthDate: "", category: "LOCAL" },
            { number: 10, name: "LUIS MEZA", birthDate: "", category: "LOCAL" },
            { number: 11, name: "FERNANDO BORBON", birthDate: "", category: "LOCAL" },
            { number: 12, name: "DIEGO BORBON", birthDate: "", category: "LOCAL" },
            { number: 13, name: "JOSE MEZA", birthDate: "", category: "LOCAL" },
            { number: 14, name: "ALBERTO MEZA", birthDate: "", category: "LOCAL" },
            { number: 15, name: "GAEL MEZA", birthDate: "", category: "LOCAL" },
            { number: 16, name: "ROSARIO GUTIERREZ", birthDate: "", category: "LOCAL" },
            { number: 17, name: "JOEL REYES", birthDate: "", category: "LOCAL" },
            { number: 18, name: "JOSE ORTEGA", birthDate: "", category: "LOCAL" },
            { number: 19, name: "RICARDO YOCUPICIO", birthDate: "", category: "LOCAL" },
            { number: 20, name: "ARON YOCUPICIO", birthDate: "", category: "NUEVO VALOR" },
            { number: 21, name: "JAIME SIARI", birthDate: "", category: "LOCAL" }
        ],
        staff: {
            delegado: "JESUS FERNANDO BORBON",
            manager: "",
            coach: ""
        }
    },
    {
        id: 4,
        name: "Indios de Chirajobampo",
        logo: "assets/logos/teams/indios.jpeg",
        color: "#c41e3a",
        roster: [
            { number: 1, name: "JESUS ANTONIO FLORES BUSTAMANTE", birthDate: "2011-08-14", category: "NOVATO" },
            { number: 2, name: "YOSMAR JACOB RAMIREZ AYALA", birthDate: "2008-03-12", category: "LOCAL" },
            { number: 3, name: "CRISTIAN EMANUEL VERDUGO GASTELUM", birthDate: "2008-05-03", category: "NOVATO" },
            { number: 4, name: "DAVID JESUS ROJAS BUSTAMANTE", birthDate: "2006-09-31", category: "LOCAL" },
            { number: 5, name: "JOSE JIOBANY VERDUGO GASTELUM", birthDate: "2007-07-18", category: "LOCAL" },
            { number: 6, name: "ALEXANDER AYALA MOROYOQUI", birthDate: "2008-12-08", category: "LOCAL" },
            { number: 7, name: "ROSENDO COTA VAZQUEZ", birthDate: "1980-03-01", category: "LOCAL" },
            { number: 8, name: "BLAS IVAN BUSTAMANTE MOROYOQUI", birthDate: "1991-02-03", category: "LOCAL" },
            { number: 9, name: "IRAN GONZALO YOCUPICIO BUSTAMANTE", birthDate: "2012-04-05", category: "LOCAL" },
            { number: 10, name: "FRANCISCO ALEJANDRO YOCUPICIO VALENZUELA", birthDate: "2000-04-29", category: "LOCAL" },
            { number: 11, name: "JOSE JULIAN CRUZ GALVEZ", birthDate: "2009-07-20", category: "NOVATO" },
            { number: 12, name: "EDGAR RODRIGO YEVISMEA YOCUPICIO", birthDate: "2000-03-13", category: "LOCAL" },
            { number: 13, name: "EVER ERUBIEL BUSTAMANTE MOROYOQUI", birthDate: "2000-03-08", category: "LOCAL" },
            { number: 14, name: "LUIS REY ALDAMA BORBON", birthDate: "2004-08-25", category: "LOCAL" },
            { number: 15, name: "CARLOS EDUARDO ALCANTAR BORBON", birthDate: "2009-03-23", category: "LOCAL" },
            { number: 16, name: "FRANCISCO ERNESTO CARDENAS CRUZ", birthDate: "2009-09-09", category: "LOCAL" },
            { number: 17, name: "SANTIAGO YOCUPICIO YOCUPICIO", birthDate: "2001-05-24", category: "NOVATO" }
        ],
        staff: {
            delegado: "",
            manager: "JUAN RAMON GASTELUM VALENZUELA",
            coach: ""
        }
    },
    {
        id: 5,
        name: "Chicos de Sinahuiza",
        logo: "assets/logos/teams/chicos.jpeg",
        color: "#ff8c00",
        roster: [
            { number: 1, name: "ADRIAN YOCUPICIO", birthDate: "", category: "LOCAL" },
            { number: 2, name: "ANGEL ACUÑA", birthDate: "", category: "LOCAL" },
            { number: 3, name: "LUIS ENRIQUE MENDIVIL", birthDate: "", category: "LOCAL" },
            { number: 4, name: "ERIC GIL", birthDate: "", category: "LOCAL" },
            { number: 5, name: "LEONEL AYALA", birthDate: "", category: "LOCAL" },
            { number: 6, name: "LENNY MIRANDA", birthDate: "", category: "LOCAL" },
            { number: 7, name: "LUIS RAMIREZ", birthDate: "", category: "LOCAL" },
            { number: 8, name: "JOSE JUAN GIL", birthDate: "", category: "LOCAL" },
            { number: 9, name: "F MOROYOQUI", birthDate: "", category: "LOCAL" },
            { number: 10, name: "MARIO F. VALENCIA", birthDate: "", category: "LOCAL" },
            { number: 11, name: "RAMON SOMBRA", birthDate: "", category: "LOCAL" },
            { number: 12, name: "JOAQUIN YOCUPICIO", birthDate: "", category: "LOCAL" },
            { number: 13, name: "SILVIO VALENZUELA", birthDate: "", category: "LOCAL" },
            { number: 14, name: "GUILLERMO FELIX", birthDate: "", category: "LOCAL" },
            { number: 15, name: "JESUS MOROYOQUI", birthDate: "", category: "LOCAL" },
            { number: 16, name: "EDUARDO ONTIVEROS", birthDate: "", category: "LOCAL" },
            { number: 17, name: "JESUS AROON VALENCIA", birthDate: "", category: "LOCAL" },
            { number: 18, name: "JESUS MARIO FIGUEROA", birthDate: "", category: "LOCAL" },
            { number: 19, name: "JAVIER YOCUPICIO", birthDate: "", category: "LOCAL" },
            { number: 20, name: "JAVIER ZAMORA", birthDate: "", category: "LOCAL" },
            { number: 21, name: "ESTEBAN VALENZUELA", birthDate: "", category: "LOCAL" },
            { number: 22, name: "IKER VALENCIA", birthDate: "", category: "NUEVO VALOR" },
            { number: 23, name: "ALAN AYALA", birthDate: "", category: "NUEVO VALOR" },
            { number: 24, name: "MOISES ACUÑA", birthDate: "", category: "NUEVO VALOR" },
            { number: 25, name: "JULIO VALENZUELA", birthDate: "", category: "NUEVO VALOR" }
        ],
        staff: {
            delegado: "NOE VELARDE YOCUPICIO",
            manager: "MARIO AROON VALENCIA YOCUPICIO",
            coach: "HERNAN RAMIREZ SOMBRA"
        }
    },
    {
        id: 6,
        name: "Rancheros de Buayums",
        logo: "assets/logos/teams/rancheros.jpeg",
        color: "#ffd700",
        roster: [
            { number: 1, name: "OLIVER ANTONIO BORBON VALENZUELA", birthDate: "", category: "LOCAL" },
            { number: 2, name: "JOSE MISAEL GUTIERREZ YOCUPICIO", birthDate: "", category: "NUEVO VALOR" },
            { number: 3, name: "RAMON ANTONIO VEGA VEGA", birthDate: "", category: "LOCAL" },
            { number: 4, name: "JESUS ANGEL MIRANDA YOCUPICIO", birthDate: "", category: "NUEVO VALOR" },
            { number: 5, name: "JOSE ANGEL MIRANDA SOTO", birthDate: "", category: "NUEVO VALOR" },
            { number: 6, name: "JUAN PABLO MONTAÑO MENDIVIL", birthDate: "", category: "LOCAL" },
            { number: 7, name: "MIGUEL EDUARDO GIL BARRAZA", birthDate: "", category: "LOCAL" },
            { number: 8, name: "JOSE ALEXANDER GIL BARRAZA", birthDate: "", category: "LOCAL" },
            { number: 9, name: "JESUS ALAN ALVAREZ VALENZUELA", birthDate: "", category: "LOCAL" },
            { number: 10, name: "JULIO EDUARDO YOCUPICIO LEYVA", birthDate: "", category: "LOCAL" },
            { number: 11, name: "ADAN EMILIO YOCUPICIO CALDERA", birthDate: "", category: "LOCAL" },
            { number: 12, name: "JOSE ANGEL PARRA AGUILERA", birthDate: "", category: "LOCAL" },
            { number: 13, name: "ISRAEL SOMBRA VALENZUELA", birthDate: "", category: "LOCAL" },
            { number: 14, name: "RUBEN YOCUPICIO BORBON", birthDate: "", category: "LOCAL" },
            { number: 15, name: "JUAN SEBASTIAN YOCUPICIO BORBON", birthDate: "", category: "LOCAL" },
            { number: 16, name: "RODRIGO YOCUPICIO BORBON", birthDate: "", category: "LOCAL" },
            { number: 17, name: "JESUS HECTOR BARRERAS MENDOZA", birthDate: "", category: "LOCAL" },
            { number: 18, name: "OMAR ROSARIO ARMENTA YOCUPICIO", birthDate: "", category: "LOCAL" },
            { number: 19, name: "JOSE MIGUEL ARMENTA GIL", birthDate: "", category: "LOCAL" },
            { number: 20, name: "ISSAC ALEJANDRO YOCUPICIO ONTIVEROS", birthDate: "", category: "LOCAL" },
            { number: 21, name: "LUIS MARIO YOCUPICIO GIL", birthDate: "", category: "LOCAL" },
            { number: 22, name: "JARET JESUS YOCUPICIO GIL", birthDate: "", category: "LOCAL" },
            { number: 23, name: "CARMELO YOCUPICIO YOCUPICIO", birthDate: "", category: "LOCAL" },
            { number: 24, name: "ALEJANDRO ESCALANTE MENDOZA", birthDate: "", category: "LOCAL" },
            { number: 25, name: "LUIS GERARDO DOMINGUEZ VERDUGO", birthDate: "", category: "LOCAL" }
        ],
        staff: {
            delegado: "",
            manager: "CARLOS MANUEL BARRAZA BORBON",
            coach: ""
        }
    },
    {
        id: 7,
        name: "Tigrillos de Bacabachi",
        logo: "assets/logos/teams/tigrillos.jpeg",
        color: "#1e3c72",
        roster: [
            { number: 1, name: "JESUS ADRIAN ACOSTA LOPEZ", birthDate: "", category: "LOCAL" },
            { number: 2, name: "DAVID HERNANDEZ ALVARADO", birthDate: "", category: "LOCAL" },
            { number: 3, name: "LUIS FERNANDO ACOSTA LOPEZ", birthDate: "", category: "LOCAL" },
            { number: 4, name: "ALBERTO ACOSTA LOPEZ", birthDate: "", category: "LOCAL" },
            { number: 5, name: "JORGE ACOSTA LOPEZ", birthDate: "", category: "LOCAL" },
            { number: 6, name: "JESUS ACOSTA LOPEZ", birthDate: "", category: "LOCAL" },
            { number: 7, name: "JESUS ARMANDO ACOSTA LOPEZ", birthDate: "", category: "LOCAL" },
            { number: 8, name: "JOSE ANTONIO ACUÑA SOLIS", birthDate: "", category: "REFUERZO" },
            { number: 9, name: "LUIS FERNANDO ACUÑA SOLIS", birthDate: "", category: "LOCAL" },
            { number: 10, name: "LUIS ANTONIO ACUÑA SOLIS", birthDate: "", category: "LOCAL" },
            { number: 11, name: "ANDRES ADRIAN AGUIAR VALENCIA", birthDate: "", category: "LOCAL" },
            { number: 12, name: "JESUS ALBERTO AGUIAR VALENCIA", birthDate: "", category: "LOCAL" },
            { number: 13, name: "JESUS FRANCISCO AGUIAR VALENCIA", birthDate: "", category: "LOCAL" },
            { number: 14, name: "ADAIR MISAEL AYALA ONTIVEROS", birthDate: "", category: "NUEVO VALOR" },
            { number: 15, name: "FRANCISCO JAVIER AYALA ONTIVEROS", birthDate: "", category: "LOCAL" },
            { number: 16, name: "GILBERTO AYALA ONTIVEROS", birthDate: "", category: "LOCAL" },
            { number: 17, name: "JORGE AYALA ONTIVEROS", birthDate: "", category: "LOCAL" },
            { number: 18, name: "RAMIRO AYALA ONTIVEROS", birthDate: "", category: "LOCAL" },
            { number: 19, name: "JOSE LUIS BORQUEZ OCHOA", birthDate: "", category: "LOCAL" },
            { number: 20, name: "LUIS ALBERTO CORTEZ AGUIAR", birthDate: "", category: "LOCAL" },
            { number: 21, name: "LUIS FERNANDO CORTEZ AGUIAR", birthDate: "", category: "LOCAL" },
            { number: 22, name: "JOSE LUIS COTA ONTIVEROS", birthDate: "", category: "LOCAL" },
            { number: 23, name: "JESUS MAURICIO COTA ONTIVEROS", birthDate: "", category: "NOVATO" },
            { number: 24, name: "LUIS FERNANDO COTA ONTIVEROS", birthDate: "", category: "LOCAL" },
            { number: 25, name: "RAMIRO COTA ONTIVEROS", birthDate: "", category: "LOCAL" }
        ],
        staff: {
            delegado: "JESUS ISAAC VALENCIA ORTEGA",
            manager: "ISRAEL MIRANDA",
            coach: "LUIS FERNANDO LOPEZ GOYCOLEA"
        }
    },
    {
        id: 8,
        name: "Rojos de Bacabachi",
        logo: "assets/logos/teams/rojos.jpeg",
        color: "#c41e3a",
        roster: [
            { number: 1, name: "LUIS EDER GIL", birthDate: "", category: "LOCAL" },
            { number: 2, name: "NATANAEL YOCUPICIO", birthDate: "", category: "LOCAL" },
            { number: 3, name: "RANULFO GIL", birthDate: "", category: "LOCAL" },
            { number: 4, name: "JUAN CARLOS COTA", birthDate: "", category: "LOCAL" },
            { number: 5, name: "LUIS MOROYOQUI", birthDate: "", category: "LOCAL" },
            { number: 6, name: "MARCOS FELIX", birthDate: "", category: "LOCAL" },
            { number: 7, name: "ANTONIO FLORES", birthDate: "", category: "LOCAL" },
            { number: 8, name: "JESUS VALENZUELA", birthDate: "", category: "LOCAL" },
            { number: 9, name: "RUBEN BORBON", birthDate: "", category: "LOCAL" },
            { number: 10, name: "OSCAR VEGA", birthDate: "", category: "LOCAL" },
            { number: 11, name: "AXEL FELIX", birthDate: "", category: "LOCAL" },
            { number: 12, name: "MARCOPOLO ALDAMA", birthDate: "", category: "LOCAL" },
            { number: 13, name: "RAMON DORAME", birthDate: "", category: "LOCAL" },
            { number: 14, name: "GAEL DORAME", birthDate: "", category: "LOCAL" },
            { number: 15, name: "JESUS BORBON", birthDate: "", category: "LOCAL" },
            { number: 16, name: "NOE ALDAMA", birthDate: "", category: "LOCAL" },
            { number: 17, name: "IRVIN MIRANDA", birthDate: "", category: "LOCAL" },
            { number: 18, name: "EVER MOROYOQUI", birthDate: "", category: "LOCAL" },
            { number: 19, name: "EDGAR MOROYOQUI", birthDate: "", category: "LOCAL" }
        ],
        staff: {
            delegado: "",
            manager: "",
            coach: ""
        }
    },
    {
        id: 9,
        name: "Saneal",
        logo: "assets/logos/teams/saneal.jpeg",
        color: "#ffd700",
        roster: [
            { number: 1, name: "JESUS ALFREDO BUITIMEA ENCINAS", birthDate: "", category: "LOCAL" },
            { number: 2, name: "LUIS GUADALUPE IBAÑEZ MOROYOQUI", birthDate: "", category: "LOCAL" },
            { number: 3, name: "MELCHOR MENDIVIL GIL", birthDate: "", category: "LOCAL" },
            { number: 4, name: "RAMON DAREY MENDIVIL ONTIVEROS", birthDate: "", category: "LOCAL" },
            { number: 5, name: "SILVIO ONTIVEROS DORAME", birthDate: "", category: "LOCAL" },
            { number: 6, name: "FERNANDO VALENZUELA YOCUPICIO", birthDate: "", category: "LOCAL" },
            { number: 7, name: "TRANQUILINO MOROYOQUI", birthDate: "", category: "LOCAL" },
            { number: 8, name: "JESUS ALFREDO BUITIMEA MUÑOZ", birthDate: "", category: "LOCAL" },
            { number: 9, name: "CRISOFORO BUITIMEA MUÑOZ", birthDate: "", category: "LOCAL" },
            { number: 10, name: "OLEGARIO MUÑOZ B.", birthDate: "", category: "LOCAL" },
            { number: 11, name: "GAEL O. MUÑOZ BORBON", birthDate: "", category: "LOCAL" },
            { number: 12, name: "RONALDO MUÑOZ BORBON", birthDate: "", category: "LOCAL" },
            { number: 13, name: "ALEJANDRO ANDRAGA CANO", birthDate: "", category: "LOCAL" },
            { number: 14, name: "GABRIEL ANDRES MENDIVIL O.", birthDate: "", category: "LOCAL" },
            { number: 15, name: "OSCAR JOSUE MENDIVIL IBAÑEZ", birthDate: "", category: "LOCAL" },
            { number: 16, name: "FRANCISCO ARTURO CARRAZCO O.", birthDate: "", category: "LOCAL" },
            { number: 17, name: "HECTOR MANUEL CARRAZCO O.", birthDate: "", category: "LOCAL" },
            { number: 18, name: "JOSE MUÑOZ RUIZ", birthDate: "", category: "LOCAL" },
            { number: 19, name: "ADRIAN VALENZUELA GOCOBACHI", birthDate: "", category: "LOCAL" },
            { number: 20, name: "OCTAVIO JEOL PALOMARES", birthDate: "", category: "LOCAL" },
            { number: 21, name: "PAVEL VALENZUELA", birthDate: "", category: "LOCAL" },
            { number: 22, name: "JAREL MENDIVIL", birthDate: "", category: "LOCAL" },
            { number: 23, name: "CARTO ALBERTO BUITIMEA MUÑOZ", birthDate: "", category: "LOCAL" },
            { number: 24, name: "ANDRES ONTIVEROS BACASEHUA", birthDate: "", category: "LOCAL" },
            { number: 25, name: "ANDRES MENDIVIL ONTIVEROS", birthDate: "", category: "LOCAL" }
        ],
        staff: {
            delegado: "NARCISO BUITIMEA TEAL",
            manager: "JESUS BUITIMEA MUÑOZ",
            coach: "ALEGARIO MUÑOZ BUITIMEA"
        }
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
    { jornada: 3, date: "2025-11-16", homeTeam: "Guerreros de Chente Meza", awayTeam: "Rojos de Bacabachi", status: "completed" },
    { jornada: 3, date: "2025-11-16", homeTeam: "Saneal", awayTeam: "Chicos de Sinahuiza", status: "completed" },
    { jornada: 3, date: "2025-11-16", homeTeam: "Indios de Chirajobampo", awayTeam: "Tigrillos de Bacabachi", status: "completed" },
    { jornada: 3, date: "2025-11-16", homeTeam: "Astros", awayTeam: "Rancheros de Buayums", status: "completed" },
    { jornada: 3, descansa: "Venados de Batayaui" },
    
    // Jornada 4 - 23 de noviembre del 2025
    { jornada: 4, date: "2025-11-23", homeTeam: "Rojos de Bacabachi", awayTeam: "Saneal", status: "completed" },
    { jornada: 4, date: "2025-11-23", homeTeam: "Tigrillos de Bacabachi", awayTeam: "Chicos de Sinahuiza", status: "completed" },
    { jornada: 4, date: "2025-11-23", homeTeam: "Rancheros de Buayums", awayTeam: "Guerreros de Chente Meza", status: "completed" },
    { jornada: 4, date: "2025-11-23", homeTeam: "Venados de Batayaui", awayTeam: "Indios de Chirajobampo", status: "completed" },
    { jornada: 4, descansa: "Astros" },
    
    // Jornada 5 - 30 de noviembre del 2025
    { jornada: 5, date: "2025-11-30", homeTeam: "Chicos de Sinahuiza", awayTeam: "Rojos de Bacabachi", status: "completed" },
    { jornada: 5, date: "2025-11-30", homeTeam: "Indios de Chirajobampo", awayTeam: "Astros", status: "completed" },
    { jornada: 5, date: "2025-11-30", homeTeam: "Guerreros de Chente Meza", awayTeam: "Venados de Batayaui", status: "completed" },
    { jornada: 5, date: "2025-11-30", homeTeam: "Saneal", awayTeam: "Tigrillos de Bacabachi", status: "completed" },
    { jornada: 5, descansa: "Rancheros de Buayums" },
    
    // Jornada 6 - 07 de diciembre del 2025
    { jornada: 6, date: "2025-12-07", homeTeam: "Tigrillos de Bacabachi", awayTeam: "Rancheros de Buayums", status: "completed" },
    { jornada: 6, date: "2025-12-07", homeTeam: "Venados de Batayaui", awayTeam: "Saneal", status: "completed" },
    { jornada: 6, date: "2025-12-07", homeTeam: "Guerreros de Chente Meza", awayTeam: "Astros", status: "completed" },
    { jornada: 6, date: "2025-12-07", homeTeam: "Chicos de Sinahuiza", awayTeam: "Indios de Chirajobampo", status: "completed" },
    { jornada: 6, descansa: "Rojos de Bacabachi" },
    
    // Jornada 7 - 14 de diciembre del 2025
    { jornada: 7, date: "2025-12-14", homeTeam: "Astros", awayTeam: "Rojos de Bacabachi", status: "completed" },
    { jornada: 7, date: "2025-12-14", homeTeam: "Saneal", awayTeam: "Indios de Chirajobampo", status: "completed" },
    { jornada: 7, date: "2025-12-14", homeTeam: "Rancheros de Buayums", awayTeam: "Chicos de Sinahuiza", status: "completed" },
    { jornada: 7, date: "2025-12-14", homeTeam: "Tigrillos de Bacabachi", awayTeam: "Venados de Batayaui", status: "completed" },
    { jornada: 7, descansa: "Guerreros de Chente Meza" },
    
    // Jornada 8 - 21 de diciembre del 2025
    { jornada: 8, date: "2025-12-21", homeTeam: "Venados de Batayaui", awayTeam: "Astros", status: "completed" },
    { jornada: 8, date: "2025-12-21", homeTeam: "Rojos de Bacabachi", awayTeam: "Tigrillos de Bacabachi", status: "completed" },
    { jornada: 8, date: "2025-12-21", homeTeam: "Indios de Chirajobampo", awayTeam: "Rancheros de Buayums", status: "completed" },
    { jornada: 8, date: "2025-12-21", homeTeam: "Guerreros de Chente Meza", awayTeam: "Saneal", status: "completed" },
    { jornada: 8, descansa: "Chicos de Sinahuiza" },
    
    // Jornada 9 - 28 de diciembre del 2025
    { jornada: 9, date: "2025-12-28", homeTeam: "Venados de Batayaui", awayTeam: "Rancheros de Buayums", status: "completed" },
    { jornada: 9, date: "2025-12-28", homeTeam: "Astros", awayTeam: "Saneal", status: "completed" },
    { jornada: 9, date: "2025-12-28", homeTeam: "Rojos de Bacabachi", awayTeam: "Indios de Chirajobampo", status: "completed" },
    { jornada: 9, date: "2025-12-28", homeTeam: "Chicos de Sinahuiza", awayTeam: "Guerreros de Chente Meza", status: "completed" },
    { jornada: 9, descansa: "Tigrillos de Bacabachi" },
    
    // SEGUNDA VUELTA
    // Jornada 10 - 11 de enero del 2026
    { jornada: 10, date: "2026-01-11", homeTeam: "Venados de Batayaui", awayTeam: "Chicos de Sinahuiza", status: "completed" },
    { jornada: 10, date: "2026-01-11", homeTeam: "Astros", awayTeam: "Tigrillos de Bacabachi", status: "completed" },
    { jornada: 10, date: "2026-01-11", homeTeam: "Rojos de Bacabachi", awayTeam: "Rancheros de Buayums", status: "completed" },
    { jornada: 10, date: "2026-01-11", homeTeam: "Guerreros de Chente Meza", awayTeam: "Indios de Chirajobampo", status: "completed" },
    { jornada: 10, descansa: "Saneal" },
    
    // Jornada 11 - 25 de enero del 2026 (recorrida por Juego de Estrellas)
    { jornada: 11, date: "2026-01-25", homeTeam: "Astros", awayTeam: "Chicos de Sinahuiza", status: "pending" },
    { jornada: 11, date: "2026-01-25", homeTeam: "Saneal", awayTeam: "Rancheros de Buayums", status: "pending" },
    { jornada: 11, date: "2026-01-25", homeTeam: "Guerreros de Chente Meza", awayTeam: "Tigrillos de Bacabachi", status: "pending" },
    { jornada: 11, date: "2026-01-25", homeTeam: "Venados de Batayaui", awayTeam: "Rojos de Bacabachi", status: "pending" },
    { jornada: 11, descansa: "Indios de Chirajobampo" },
    
    // Jornada 12 - 01 de febrero del 2026
    { jornada: 12, date: "2026-02-01", homeTeam: "Rojos de Bacabachi", awayTeam: "Guerreros de Chente Meza", status: "pending" },
    { jornada: 12, date: "2026-02-01", homeTeam: "Chicos de Sinahuiza", awayTeam: "Saneal", status: "pending" },
    { jornada: 12, date: "2026-02-01", homeTeam: "Tigrillos de Bacabachi", awayTeam: "Indios de Chirajobampo", status: "pending" },
    { jornada: 12, date: "2026-02-01", homeTeam: "Rancheros de Buayums", awayTeam: "Astros", status: "pending" },
    { jornada: 12, descansa: "Venados de Batayaui" },
    
    // Jornada 13 - 08 de febrero del 2026
    { jornada: 13, date: "2026-02-08", homeTeam: "Saneal", awayTeam: "Rojos de Bacabachi", status: "pending" },
    { jornada: 13, date: "2026-02-08", homeTeam: "Chicos de Sinahuiza", awayTeam: "Tigrillos de Bacabachi", status: "pending" },
    { jornada: 13, date: "2026-02-08", homeTeam: "Guerreros de Chente Meza", awayTeam: "Rancheros de Buayums", status: "pending" },
    { jornada: 13, date: "2026-02-08", homeTeam: "Indios de Chirajobampo", awayTeam: "Venados de Batayaui", status: "pending" },
    { jornada: 13, descansa: "Astros" },
    
    // Jornada 14 - 15 de febrero del 2026
    { jornada: 14, date: "2026-02-15", homeTeam: "Rojos de Bacabachi", awayTeam: "Chicos de Sinahuiza", status: "pending" },
    { jornada: 14, date: "2026-02-15", homeTeam: "Astros", awayTeam: "Indios de Chirajobampo", status: "pending" },
    { jornada: 14, date: "2026-02-15", homeTeam: "Venados de Batayaui", awayTeam: "Guerreros de Chente Meza", status: "pending" },
    { jornada: 14, date: "2026-02-15", homeTeam: "Tigrillos de Bacabachi", awayTeam: "Saneal", status: "pending" },
    { jornada: 14, descansa: "Rancheros de Buayums" },
    
    // Jornada 15 - 22 de febrero del 2026
    { jornada: 15, date: "2026-02-22", homeTeam: "Rancheros de Buayums", awayTeam: "Tigrillos de Bacabachi", status: "pending" },
    { jornada: 15, date: "2026-02-22", homeTeam: "Saneal", awayTeam: "Venados de Batayaui", status: "pending" },
    { jornada: 15, date: "2026-02-22", homeTeam: "Astros", awayTeam: "Guerreros de Chente Meza", status: "pending" },
    { jornada: 15, date: "2026-02-22", homeTeam: "Indios de Chirajobampo", awayTeam: "Chicos de Sinahuiza", status: "pending" },
    { jornada: 15, descansa: "Rojos de Bacabachi" },
    
    // Jornada 16 - 01 de marzo del 2026
    { jornada: 16, date: "2026-03-01", homeTeam: "Rojos de Bacabachi", awayTeam: "Astros", status: "pending" },
    { jornada: 16, date: "2026-03-01", homeTeam: "Indios de Chirajobampo", awayTeam: "Saneal", status: "pending" },
    { jornada: 16, date: "2026-03-01", homeTeam: "Chicos de Sinahuiza", awayTeam: "Rancheros de Buayums", status: "pending" },
    { jornada: 16, date: "2026-03-01", homeTeam: "Venados de Batayaui", awayTeam: "Tigrillos de Bacabachi", status: "pending" },
    { jornada: 16, descansa: "Guerreros de Chente Meza" },
    
    // Jornada 17 - 08 de marzo del 2026
    { jornada: 17, date: "2026-03-08", homeTeam: "Astros", awayTeam: "Venados de Batayaui", status: "pending" },
    { jornada: 17, date: "2026-03-08", homeTeam: "Tigrillos de Bacabachi", awayTeam: "Rojos de Bacabachi", status: "pending" },
    { jornada: 17, date: "2026-03-08", homeTeam: "Rancheros de Buayums", awayTeam: "Indios de Chirajobampo", status: "pending" },
    { jornada: 17, date: "2026-03-08", homeTeam: "Saneal", awayTeam: "Guerreros de Chente Meza", status: "pending" },
    { jornada: 17, descansa: "Chicos de Sinahuiza" },
    
    // Jornada 18 - 15 de marzo del 2026
    { jornada: 18, date: "2026-03-15", homeTeam: "Rojos de Bacabachi", awayTeam: "Indios de Chirajobampo", status: "pending" },
    { jornada: 18, date: "2026-03-15", homeTeam: "Guerreros de Chente Meza", awayTeam: "Chicos de Sinahuiza", status: "pending" },
    { jornada: 18, date: "2026-03-15", homeTeam: "Venados de Batayaui", awayTeam: "Rancheros de Buayums", status: "pending" },
    { jornada: 18, date: "2026-03-15", homeTeam: "Saneal", awayTeam: "Astros", status: "pending" },
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
    email: "Ligabacabachi@ligaejidal.com",
    phone: "(642) 426-9561",
    location: "Boulevard los pinos s/n, Bacabachi, Navojoa, Sonora",
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

