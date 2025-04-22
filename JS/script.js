const meteoToken = "726b1c99c171e7c9d93155a0b1721f138a48d4c33ad10e533f84fbbd55d62140";

async function getWeather() {
    const zip = document.getElementById("zipcode").value.trim();
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "Chargement...";

    try {
        const geoRes = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${zip}&fields=nom,centre&format=json`);
        const communes = await geoRes.json();

        if (!communes.length) {
            resultDiv.innerHTML = "<p>Aucune commune trouvée pour ce code postal.</p>";
            return;
        }

        const { nom, centre } = communes[0];
        const [lng, lat] = centre.coordinates;

        const meteoRes = await fetch(`https://api.meteo-concept.com/api/forecast/daily?token=${meteoToken}&latlng=${lat},${lng}`);
        const meteoData = await meteoRes.json();
        const today = meteoData.forecast[0];

        const tmin = today.tmin;
        const tmax = today.tmax;
        const avg = ((tmin + tmax) / 2).toFixed(1);
        const rain = today.probarain ?? "N/A";
        const sun = today.sun_hours ?? "N/A";

        resultDiv.innerHTML = `
  <h2>Météo pour ${nom}</h2>
  <ul>
    <li><strong>\uD83C\uDF21️ Température minimale :</strong> ${tmin}°C</li>
    <li><strong>\uD83C\uDF21️ Température maximale :</strong> ${tmax}°C</li>
    <li><strong>\uD83C\uDF24️ Moyenne estimée :</strong> ${avg}°C</li>
    <li><strong>☔ Probabilité de pluie :</strong> ${rain}%</li>
    <li><strong>☀️ Heures d'ensoleillement :</strong> ${sun} h</li>
  </ul>
`;
    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = "<p>Erreur lors de la récupération des données météo.</p>";
    }
}