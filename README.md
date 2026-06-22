# MeteoGG

MeteoGG est une application mobile météo française construite avec React Native, Expo SDK 54 et JavaScript.

La version actuelle conserve la météo réelle via Open-Meteo, la recherche manuelle par ville, la géolocalisation GPS au démarrage et ajoute une section de prévisions météo sur 7 jours.

## Fonctionnalités

- Météo réelle via Open-Meteo.
- Géolocalisation GPS au démarrage.
- Reverse geocoding avec Expo Location pour afficher la ville détectée.
- Recherche manuelle par ville française via l'icône loupe.
- Recherche secondaire masquée par défaut pour privilégier la météo GPS.
- Prévisions météo sur 7 jours.
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
│   │   └── WeatherCard.js
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
- `SearchBar.js` contient le champ de recherche et son bouton.
- `ForecastList.js` et `ForecastCard.js` affichent les prévisions normalisées.
- `locationService.js` contient toute la logique GPS, permission et reverse geocoding.
- `weatherService.js` contient toute la logique Open-Meteo et retourne un objet météo normalisé.
- `WeatherCard.js` affiche uniquement les données météo courantes normalisées.
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

## Fonctionnement Open-Meteo

Recherche manuelle :

```text
Ville saisie
↓
Open-Meteo Geocoding API
↓
Latitude / Longitude
↓
Open-Meteo Forecast API
↓
Normalisation dans weatherService.js
↓
WeatherCard + ForecastList
```

Démarrage avec GPS :

```text
Permission GPS
↓
Location.getCurrentPositionAsync()
↓
Reverse geocoding Expo Location
↓
Open-Meteo Forecast API par coordonnées
↓
Normalisation dans weatherService.js
↓
WeatherCard + ForecastList
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
  condition: '',
  weatherCode: null,
  updatedAt: '',
  source: 'Open-Meteo',
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

## Autocomplétion des villes\n\nMeteoGG utilise exclusivement l'API Geocoding Open-Meteo pour proposer jusqu'à 5 villes pendant la saisie.\n\nLa recherche est lancée à partir de 2 caractères, avec un debounce de 400 ms et annulation des requêtes obsolètes via AbortController.\n\nUne suggestion est affichée au format :\n\n`	ext\nParis, Île-de-France, France\n`\n\nLes champs absents sont ignorés afin de ne jamais afficher undefined ou

ull.\n\nEn cas d'absence de résultat, l'application affiche Aucune ville trouvée. En cas d'indisponibilité de l'API, elle affiche Suggestions indisponibles.\n\n## Prévisions 7 jours

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

### Fonctionnalité ajoutée

- Prévisions 7 jours

### Prochaines évolutions

- Villes favorites
- Vigilance météo
- API Météo-France
- Publication Android
