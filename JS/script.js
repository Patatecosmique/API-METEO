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
        
        let cardHTML = `
            <div class="weather-card">
                <div class="weather-card-date">${capitalizedDate}</div>
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