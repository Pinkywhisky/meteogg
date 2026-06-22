# MeteoGG

MeteoGG est une application mobile météo française construite avec React Native, Expo SDK 54 et JavaScript.

La version actuelle conserve la météo réelle via Open-Meteo, la recherche manuelle par ville, la géolocalisation GPS au démarrage, les détails météo avancés, les prévisions météo sur 7 jours et l'autocomplétion mondiale des villes.

## Fonctionnalités

- Météo réelle via Open-Meteo.
- Géolocalisation GPS au démarrage.
- Reverse geocoding avec Expo Location pour afficher la ville détectée.
- Recherche manuelle par ville via l'icône loupe.
- Autocomplétion mondiale des villes via Open-Meteo Geocoding API.
- Priorisation du pays détecté par GPS dans les suggestions.
- Prévisions météo sur 7 jours.
- Direction du vent affichée en points cardinaux lisibles.
- Détails météo avancés : lever/coucher du soleil, UV, pluie du jour et qualité de l'air.
- Fallback automatique sur Bezons si la localisation est refusée ou indisponible.
- Gestion des états loading, error et success.
- Compatible Expo Go Android.

## Architecture

```text
MeteoGG/
├── App.js
├── app.json
├── package.json
├── assets/
│   ├── icon.png
│   ├── splash.png
│   └── images/
├── src/
│   ├── components/
│   │   ├── ForecastCard.js
│   │   ├── ForecastList.js
│   │   ├── Header.js
│   │   ├── SearchBar.js
│   │   ├── WeatherCard.js
│   │   └── WeatherDetails.js
│   ├── screens/
│   │   └── HomeScreen.js
│   ├── services/
│   │   ├── locationService.js
│   │   └── weatherService.js
│   ├── data/
│   │   └── mockWeather.js
│   ├── styles/
│   │   └── theme.js
│   ├── hooks/
│   ├── navigation/
│   │   └── AppNavigator.js
│   └── utils/
└── README.md
```

- `HomeScreen.js` orchestre l'état de l'écran et appelle uniquement les services.
- `SearchBar.js` contient le champ de recherche, son bouton et la liste de suggestions.
- `ForecastList.js` et `ForecastCard.js` affichent les prévisions normalisées.
- `locationService.js` contient toute la logique GPS, permission et reverse geocoding.
- `weatherService.js` contient toute la logique Open-Meteo, géocodage et normalisation.
- `WeatherCard.js` affiche uniquement les données météo courantes normalisées.
- `WeatherDetails.js` affiche les détails avancés normalisés sans connaître les réponses brutes Open-Meteo.
- `theme.js` centralise les couleurs, espacements, rayons, typographies et ombres.

## Installation

```bash
npm install
```

Si `expo-location` n'est pas encore installé :

```bash
npx expo install expo-location
```

## Lancement

```bash
npm start
```

Puis ouvrir l'application avec Expo Go sur Android.

## Permissions Android

MeteoGG utilise `expo-location` pour demander la permission de localisation au lancement. Cette permission sert uniquement à récupérer une position ponctuelle afin d'afficher la météo locale.

L'application ne suit pas la position en temps réel, n'utilise pas `watchPosition` et appelle uniquement `Location.getCurrentPositionAsync()`.

Si la permission est refusée, si le GPS est indisponible ou si le reverse geocoding échoue, MeteoGG affiche automatiquement la météo de Bezons avec le message :

```text
Localisation désactivée - météo de Bezons affichée
```

Dans ce cas, l'autocomplétion fonctionne en recherche mondiale classique, sans priorité locale.

## Fonctionnement Open-Meteo

Recherche manuelle :

```text
Ville saisie
↓
Open-Meteo Geocoding API
↓
Latitude / Longitude
↓
Open-Meteo Forecast API + Air Quality API
↓
Normalisation dans weatherService.js
↓
WeatherCard + WeatherDetails + ForecastList
```

Démarrage avec GPS :

```text
Permission GPS
↓
Location.getCurrentPositionAsync()
↓
Reverse geocoding Expo Location
↓
Open-Meteo Forecast API par coordonnées + Air Quality API
↓
Normalisation dans weatherService.js
↓
WeatherCard + WeatherDetails + ForecastList
```

Objet météo normalisé :

```javascript
{
  city: '',
  country: '',
  latitude: null,
  longitude: null,
  temperature: 0,
  feelsLike: 0,
  humidity: 0,
  windSpeed: 0,
  windDirection: 0,
  windDirectionLabel: '',
  condition: '',
  weatherCode: null,
  updatedAt: '',
  source: 'Open-Meteo',
  sunrise: '',
  sunset: '',
  uvIndex: null,
  uvLevel: '',
  todayPrecipitationProbability: null,
  airQuality: {
    europeanAqi: null,
    level: '',
    pm10: null,
    pm25: null,
  },
  forecast: [
    {
      date: '',
      dayLabel: '',
      condition: '',
      weatherCode: null,
      temperatureMin: 0,
      temperatureMax: 0,
      precipitationProbability: null,
      windSpeedMax: null,
    },
  ],
}
```

## Autocomplétion des villes

MeteoGG utilise exclusivement l'API Geocoding Open-Meteo pour proposer jusqu'à 5 villes pendant la saisie.

La recherche est lancée à partir de 3 caractères, avec un debounce de 400 ms et annulation des requêtes obsolètes via `AbortController`.

Quand la localisation GPS a permis de détecter un pays, MeteoGG lance deux recherches :

1. Une recherche locale avec `countryCode` du pays détecté.
2. Une recherche mondiale sans filtre pays.

Les résultats sont fusionnés, dédupliqués, puis triés avec le pays détecté en premier. Les villes étrangères restent disponibles dans les suggestions.

Si la localisation est refusée ou indisponible, MeteoGG utilise une recherche mondiale classique.

Une suggestion est affichée au format :

```text
Paris, Île-de-France, France
```

Les champs absents sont ignorés afin de ne jamais afficher `undefined` ou `null`.

En cas d'absence de résultat, l'application affiche `Aucune ville trouvée`. En cas d'indisponibilité de l'API, elle affiche `Suggestions indisponibles` sans modifier la météo déjà affichée.

## Direction du vent

Open-Meteo fournit `wind_direction_10m` en degrés. MeteoGG conserve cette valeur brute dans `windDirection`, puis la convertit avec `degreesToCompass()` pour produire `windDirectionLabel`.

La conversion utilise 16 directions :

```text
N, NNE, NE, ENE, E, ESE, SE, SSE, S, SSO, SO, OSO, O, ONO, NO, NNO
```

Exemples :

```text
0°   -> N
45°  -> NE
90°  -> E
135° -> SE
180° -> S
225° -> SO
270° -> O
315° -> NO
```

L'affichage utilisateur prend la forme :

```text
Vent : 18 km/h SO
```

## Détails météo avancés

Le bloc "Détails météo" est affiché sous la météo actuelle et avant les prévisions 7 jours.

Les données viennent de l'API Open-Meteo Forecast via les variables `daily` suivantes :

- `sunrise`
- `sunset`
- `uv_index_max`
- `precipitation_probability_max`

Les heures de lever et coucher du soleil sont formatées en heure locale courte, par exemple `05:48` ou `21:58`.

### Indice UV

MeteoGG convertit `uv_index_max` avec `getUvLevel()` :

- 0 à 2 : Faible
- 3 à 5 : Modéré
- 6 à 7 : Élevé
- 8 à 10 : Très élevé
- 11+ : Extrême

Si la valeur est absente, l'application affiche `UV indisponible`.

### Qualité de l'air

La qualité de l'air est récupérée via l'API Open-Meteo Air Quality avec les variables `current` suivantes :

- `european_aqi`
- `pm10`
- `pm2_5`

MeteoGG convertit `european_aqi` avec `getAirQualityLevel()` :

- 0 à 20 : Bon
- 21 à 40 : Moyen
- 41 à 60 : Dégradé
- 61 à 80 : Mauvais
- 81 à 100 : Très mauvais
- 100+ : Extrêmement mauvais

L'appel Air Quality est optionnel et non bloquant. Si cette API échoue ou ne renvoie pas de données, la météo actuelle et les prévisions restent affichées, avec le message `Qualité de l'air indisponible`.

## Prévisions 7 jours

Les prévisions sont fournies par Open-Meteo via les données `daily` de l'API Forecast.

Variables utilisées :

- `weather_code`
- `temperature_2m_max`
- `temperature_2m_min`
- `precipitation_probability_max`
- `wind_speed_10m_max`

Si les données `daily` sont absentes ou incomplètes, l'application conserve la météo actuelle et affiche :

```text
Prévisions indisponibles
```

## Validation

```bash
npx expo install --check
npm run lint
npx prettier --check App.js app.json package.json babel.config.js .eslintrc.js .prettierrc README.md src/**/*.js
```

## Roadmap

### v1.0

- Météo réelle
- Recherche ville
- Géolocalisation GPS

### Fonctionnalités ajoutées

- Prévisions 7 jours
- Autocomplétion mondiale avec priorité pays détecté
- Détails météo avancés et qualité de l'air

### Prochaines évolutions

- Villes favorites
- Vigilance météo
- API Météo-France
- Publication Android
