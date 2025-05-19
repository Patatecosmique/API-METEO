const meteoToken = "726b1c99c171e7c9d93155a0b1721f138a48d4c33ad10e533f84fbbd55d62140";
let map = null;
let marker = null;

// Initialiser la page
document.addEventListener("DOMContentLoaded", function() {
    // Gérer le slider de jours
    const forecastDaysSlider = document.getElementById("forecast-days");
    const forecastDaysValue = document.getElementById("forecast-days-value");
    
    forecastDaysSlider.addEventListener("input", function() {
        const days = this.value;
        forecastDaysValue.textContent = `${days} jour${days > 1 ? 's' : ''}`;
    });
    
    // Initialiser le bouton de thème
    const themeSwitch = document.getElementById("theme-switch");
    const themeIcon = document.getElementById("theme-icon");
    
    // Vérifier si un thème est déjà sauvegardé
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        themeIcon.textContent = "☀️";
    }
    
    themeSwitch.addEventListener("click", function() {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
        const newTheme = currentTheme === "light" ? "dark" : "light";
        
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        
        // Changer l'icône
        themeIcon.textContent = newTheme === "dark" ? "☀️" : "🌙";
    });
});

// Fonction pour obtenir l'URL de l'icône météo basée sur le code de condition météo
function getWeatherIconUrl(weatherCode) {
    // URLs de base pour les icônes météo
    const baseUrl = "https://openweathermap.org/img/wn/";
    
    // Mapper les codes météo de Météo Concept vers les codes d'icônes OpenWeatherMap
    // Documentation des codes Météo Concept: https://api.meteo-concept.com/documentation#code-weather
    const iconMap = {
        0: "01d", // Soleil
        1: "02d", // Peu nuageux
        2: "03d", // Ciel voilé
        3: "04d", // Nuageux
        4: "04d", // Très nuageux
        5: "09d", // Couvert
        6: "09d", // Brouillard
        7: "09d", // Brouillard givrant
        10: "10d", // Pluie faible
        11: "09d", // Pluie modérée
        12: "09d", // Pluie forte
        13: "13d", // Neige faible
        14: "13d", // Neige modérée
        15: "13d", // Neige forte
        16: "13d", // Grêle
        20: "11d", // Averses de pluie locales et faibles
        21: "11d", // Averses de pluie locales
        22: "11d", // Averses locales et fortes
        30: "11d", // Averses de neige localisées et faibles
        31: "13d", // Averses de neige localisées
        32: "13d", // Averses de neige localisées et fortes
        40: "09d", // Orages locaux et faibles
        41: "11d", // Orages locaux
        42: "11d", // Orages locaux et forts
        43: "11d", // Orages locaux et forts
        44: "11d", // Orages locaux et forts
        45: "11d", // Orages locaux et forts
        46: "11d", // Orages locaux et forts
        47: "11d", // Orages locaux et forts
        48: "11d", // Orages locaux et forts
        60: "13d", // Averses de neige faibles
        61: "13d", // Averses de neige
        62: "13d", // Averses de neige fortes
        63: "13d", // Averses de neige fortes
        64: "13d", // Averses de neige fortes
        65: "13d", // Averses de neige fortes
        66: "13d", // Averses de neige fortes
        67: "13d", // Averses de neige fortes
        68: "13d", // Averses de neige fortes
        70: "13d", // Averses de neige faibles
        71: "13d", // Averses de neige
        72: "13d", // Averses de neige fortes
        73: "13d", // Averses de neige fortes
        74: "13d", // Averses de neige fortes
        75: "13d", // Averses de neige fortes
        76: "13d", // Averses de neige fortes
        77: "13d", // Averses de neige fortes
        78: "13d", // Averses de neige fortes
        100: "01n", // Soleil (nuit)
        101: "02n", // Peu nuageux (nuit)
        102: "03n", // Ciel voilé (nuit)
        103: "04n", // Nuageux (nuit)
        104: "04n", // Très nuageux (nuit)
        105: "09n", // Couvert (nuit)
        106: "09n", // Brouillard (nuit)
        107: "09n", // Brouillard givrant (nuit)
        110: "10n", // Pluie faible (nuit)
        111: "09n", // Pluie modérée (nuit)
        112: "09n", // Pluie forte (nuit)
        113: "13n", // Neige faible (nuit)
        114: "13n", // Neige modérée (nuit)
        115: "13n", // Neige forte (nuit)
        116: "13n", // Grêle (nuit)
        120: "11n", // Averses de pluie locales et faibles (nuit)
        121: "11n", // Averses de pluie locales (nuit)
        122: "11n", // Averses locales et fortes (nuit)
        130: "11n", // Averses de neige localisées et faibles (nuit)
        131: "13n", // Averses de neige localisées (nuit)
        132: "13n", // Averses de neige localisées et fortes (nuit)
        140: "09n", // Orages locaux et faibles (nuit)
        141: "11n", // Orages locaux (nuit)
        142: "11n", // Orages locaux et forts (nuit)
    };
    
    // Obtenir le code d'icône correspondant ou utiliser une icône par défaut
    const iconCode = iconMap[weatherCode] || "50d"; // 50d est l'icône brouillard par défaut
    
    // Construire l'URL complète
    return `${baseUrl}${iconCode}@2x.png`;
}

// Fonction pour obtenir la description météo basée sur le code
function getWeatherDescription(weatherCode) {
    const descriptions = {
        0: "Ensoleillé",
        1: "Peu nuageux",
        2: "Ciel voilé",
        3: "Nuageux",
        4: "Très nuageux",
        5: "Couvert",
        6: "Brouillard",
        7: "Brouillard givrant",
        10: "Pluie faible",
        11: "Pluie modérée",
        12: "Pluie forte",
        13: "Neige faible",
        14: "Neige modérée",
        15: "Neige forte",
        16: "Grêle",
        20: "Averses de pluie faibles",
        21: "Averses de pluie",
        22: "Averses de pluie fortes",
        30: "Averses de neige faibles",
        31: "Averses de neige",
        32: "Averses de neige fortes",
        40: "Orages faibles",
        41: "Orages",
        42: "Orages forts",
        100: "Nuit claire",
        101: "Nuit peu nuageuse",
        102: "Nuit avec ciel voilé",
        103: "Nuit nuageuse",
        104: "Nuit très nuageuse",
        105: "Nuit couverte",
        106: "Nuit avec brouillard",
        107: "Nuit avec brouillard givrant",
        110: "Nuit avec pluie faible",
        111: "Nuit avec pluie modérée",
        112: "Nuit avec pluie forte",
        113: "Nuit avec neige faible",
        114: "Nuit avec neige modérée",
        115: "Nuit avec neige forte",
        116: "Nuit avec grêle",
        120: "Nuit avec averses de pluie faibles",
        121: "Nuit avec averses de pluie",
        122: "Nuit avec averses de pluie fortes",
    };
    
    return descriptions[weatherCode] || "Conditions météo inconnues";
}

async function getWeather() {
    const zip = document.getElementById("zipcode").value.trim();
    const forecastDays = parseInt(document.getElementById("forecast-days").value);
    const resultDiv = document.getElementById("result");
    const mapContainer = document.getElementById("map-container");
    const forecastCardsContainer = document.getElementById("forecast-cards-container");
    
    // Récupérer les options d'affichage
    const showLatLng = document.getElementById("show-lat-lng").checked;
    const showRain = document.getElementById("show-rain").checked;
    const showWind = document.getElementById("show-wind").checked;
    const showWindDir = document.getElementById("show-wind-dir").checked;
    
    resultDiv.innerHTML = "<div class='loading'>Chargement des données météo...</div>";
    forecastCardsContainer.innerHTML = "";
    
    try {
        // Récupérer les informations de la commune
        const geoRes = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${zip}&fields=nom,centre&format=json`);
        const communes = await geoRes.json();

        if (!communes.length) {
            resultDiv.innerHTML = "<p>Aucune commune trouvée pour ce code postal.</p>";
            mapContainer.style.display = "none";
            return;
        }

        const { nom, centre } = communes[0];
        const [lng, lat] = centre.coordinates;

        // Récupérer les données météo
        const meteoRes = await fetch(`https://api.meteo-concept.com/api/forecast/daily?token=${meteoToken}&latlng=${lat},${lng}`);
        const meteoData = await meteoRes.json();
        
        // Limiter le nombre de prévisions selon le choix de l'utilisateur
        const forecasts = meteoData.forecast.slice(0, forecastDays);
        
        // Afficher les informations de la commune
        let resultHTML = `
            <h2>Météo pour ${nom}</h2>
        `;
        
        if (showLatLng) {
            resultHTML += `
                <div class="geo-info">
                    <p><strong>🌍 Coordonnées :</strong> Latitude ${lat.toFixed(4)}, Longitude ${lng.toFixed(4)}</p>
                </div>
            `;
        }
        
        resultDiv.innerHTML = resultHTML;
        
        // Afficher la carte
        displayMap(lat, lng, nom);
        
        // Afficher les cartes de prévision
        displayForecastCards(forecasts, showRain, showWind, showWindDir);
        
    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = "<p>Erreur lors de la récupération des données météo.</p>";
        mapContainer.style.display = "none";
    }
}

function displayMap(lat, lng, locationName) {
    const mapContainer = document.getElementById("map-container");
    mapContainer.style.display = "block";
    
    // Initialiser la carte si elle n'existe pas déjà
    if (!map) {
        map = L.map('map').setView([lat, lng], 13);
        
        // Ajouter une couche de tuiles OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    } else {
        map.setView([lat, lng], 13);
    }
    
    // Ajouter ou mettre à jour le marqueur
    if (marker) {
        marker.setLatLng([lat, lng]);
    } else {
        marker = L.marker([lat, lng]).addTo(map);
    }
    
    marker.bindPopup(`<b>${locationName}</b>`).openPopup();
}

function displayForecastCards(forecasts, showRain, showWind, showWindDir) {
    const forecastCardsContainer = document.getElementById("forecast-cards-container");
    forecastCardsContainer.innerHTML = "";
    
    // Formater les dates en français
    const dateFormatter = new Intl.DateTimeFormat('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
    });
    
    forecasts.forEach(forecast => {
        const date = new Date(forecast.datetime);
        const formattedDate = dateFormatter.format(date);
        const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
        
        // Obtenir l'URL de l'icône météo et la description
        const weatherIconUrl = getWeatherIconUrl(forecast.weather);
        const weatherDescription = getWeatherDescription(forecast.weather);
        
        let cardHTML = `
            <div class="weather-card">
                <div class="weather-card-date">${capitalizedDate}</div>
                <div class="weather-card-icon">
                    <img src="${weatherIconUrl}" alt="${weatherDescription}" title="${weatherDescription}" class="weather-icon">
                    <p class="weather-description">${weatherDescription}</p>
                </div>
                <div class="weather-card-temps">
                    <div class="weather-temp-min">
                        <span class="temp-icon">❄️</span>
                        <div>${forecast.tmin}°C</div>
                    </div>
                    <div class="weather-temp-max">
                        <span class="temp-icon">🔥</span>
                        <div>${forecast.tmax}°C</div>
                    </div>
                </div>
                <div class="weather-card-details">
                    <div>
                        <span>☀️ Ensoleillement :</span>
                        <span>${forecast.sun_hours || 'N/A'} h</span>
                    </div>
                    <div>
                        <span>☔ Probabilité pluie :</span>
                        <span>${forecast.probarain || '0'}%</span>
                    </div>
        `;
        
        // Ajouter les informations supplémentaires selon les options
        if (showRain) {
            cardHTML += `
                    <div>
                        <span>💧 Cumul pluie :</span>
                        <span>${forecast.rr10 || '0'} mm</span>
                    </div>
            `;
        }
        
        if (showWind) {
            cardHTML += `
                    <div>
                        <span>💨 Vent moyen :</span>
                        <span>${forecast.wind10m || 'N/A'} km/h</span>
                    </div>
            `;
        }
        
        if (showWindDir) {
            const direction = getWindDirection(forecast.dirwind10m);
            cardHTML += `
                    <div>
                        <span>🧭 Direction vent :</span>
                        <span>${direction} (${forecast.dirwind10m || 'N/A'}°)</span>
                    </div>
            `;
        }
        
        cardHTML += `
                </div>
            </div>
        `;
        
        forecastCardsContainer.innerHTML += cardHTML;
    });
}

// Fonction utilitaire pour convertir les degrés en direction du vent
function getWindDirection(degrees) {
    if (degrees === undefined || degrees === null) return 'N/A';
    
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}