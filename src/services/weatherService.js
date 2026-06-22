import axios from 'axios';

export const WEATHER_PROVIDERS = {
  OPEN_METEO: 'open-meteo',
  METEO_FRANCE: 'meteo-france',
};

export const DEFAULT_CITY = 'Bezons';
export const DEFAULT_COUNTRY = 'France';

const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const WEATHER_SOURCE = 'Open-Meteo';
const WEATHER_VARIABLES = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
].join(',');
const DAILY_WEATHER_VARIABLES = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
  'wind_speed_10m_max',
  'sunrise',
  'sunset',
  'uv_index_max',
].join(',');
const AIR_QUALITY_VARIABLES = ['european_aqi', 'pm10', 'pm2_5'].join(',');

const DAY_LABELS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
const COMPASS_DIRECTIONS = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSO',
  'SO',
  'OSO',
  'O',
  'ONO',
  'NO',
  'NNO',
];
const CITY_SUGGESTION_MIN_LENGTH = 3;
const MAX_CITY_SUGGESTIONS = 5;
const GLOBAL_SUGGESTION_FETCH_COUNT = 10;

const weatherApiClient = axios.create({
  timeout: 10000,
});

class WeatherServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

function degreesToCompass(degrees) {
  if (!Number.isFinite(degrees)) {
    return '';
  }

  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  const directionIndex = Math.round(normalizedDegrees / 22.5) % COMPASS_DIRECTIONS.length;

  return COMPASS_DIRECTIONS[directionIndex];
}

function getUvLevel(uvIndex) {
  if (!Number.isFinite(uvIndex)) {
    return 'UV indisponible';
  }

  if (uvIndex <= 2) {
    return 'Faible';
  }

  if (uvIndex <= 5) {
    return 'Modéré';
  }

  if (uvIndex <= 7) {
    return 'Élevé';
  }

  if (uvIndex <= 10) {
    return 'Très élevé';
  }

  return 'Extrême';
}

function getAirQualityLevel(europeanAqi) {
  if (!Number.isFinite(europeanAqi)) {
    return "Qualité de l'air indisponible";
  }

  if (europeanAqi <= 20) {
    return 'Bon';
  }

  if (europeanAqi <= 40) {
    return 'Moyen';
  }

  if (europeanAqi <= 60) {
    return 'Dégradé';
  }

  if (europeanAqi <= 80) {
    return 'Mauvais';
  }

  if (europeanAqi <= 100) {
    return 'Très mauvais';
  }

  return 'Extrêmement mauvais';
}

function getConditionFromWeatherCode(code) {
  if (code === 0) {
    return 'Ensoleillé';
  }

  if (code === 1) {
    return 'Principalement dégagé';
  }

  if ([2, 3].includes(code)) {
    return 'Nuageux';
  }

  if ([45, 48].includes(code)) {
    return 'Brouillard';
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return 'Bruine';
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return 'Pluie';
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return 'Neige';
  }

  if ([95, 96, 99].includes(code)) {
    return 'Orage';
  }

  return 'Inconnu';
}

function normalizeComparableText(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function formatOpenMeteoTime(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  const [datePart, timePart = ''] = value.split('T');
  const [year, month, day] = datePart.split('-');
  const [hour = '00', minute = '00'] = timePart.split(':');

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year} ${hour}:${minute}`;
}

function formatShortTime(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  const [, timePart = ''] = value.split('T');
  const [hour, minute] = timePart.split(':');

  if (!hour || !minute) {
    return '';
  }

  return hour + ':' + minute;
}

function formatForecastDate(value) {
  if (!value || typeof value !== 'string') {
    return { date: '', dayLabel: '' };
  }

  const [year, month, day] = value.split('-');
  const parsedDate = new Date(`${value}T12:00:00`);

  if (!year || !month || !day || Number.isNaN(parsedDate.getTime())) {
    return { date: value, dayLabel: '' };
  }

  return {
    date: `${day}/${month}`,
    dayLabel: DAY_LABELS[parsedDate.getDay()],
  };
}

function hasCompleteCurrentWeather(current) {
  return (
    current &&
    Number.isFinite(current.temperature_2m) &&
    Number.isFinite(current.apparent_temperature) &&
    Number.isFinite(current.relative_humidity_2m) &&
    Number.isFinite(current.wind_speed_10m) &&
    Number.isFinite(current.wind_direction_10m) &&
    Number.isFinite(current.weather_code) &&
    Boolean(current.time)
  );
}

function getNullableRoundedValue(value) {
  return Number.isFinite(value) ? Math.round(value) : null;
}

function getNullableUvValue(value) {
  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.round(value * 10) / 10;
}

function getUnavailableAirQuality() {
  return {
    europeanAqi: null,
    level: "Qualité de l'air indisponible",
    pm10: null,
    pm25: null,
  };
}

function normalizeAirQualityPayload(airQualityPayload) {
  const current = airQualityPayload?.current;
  const europeanAqi = getNullableRoundedValue(current?.european_aqi);

  if (europeanAqi === null) {
    return getUnavailableAirQuality();
  }

  return {
    europeanAqi,
    level: getAirQualityLevel(europeanAqi),
    pm10: getNullableRoundedValue(current?.pm10),
    pm25: getNullableRoundedValue(current?.pm2_5),
  };
}

function normalizeTodayDetails(daily) {
  const uvIndex = getNullableUvValue(daily?.uv_index_max?.[0]);

  return {
    sunrise: formatShortTime(daily?.sunrise?.[0]),
    sunset: formatShortTime(daily?.sunset?.[0]),
    uvIndex,
    uvLevel: getUvLevel(uvIndex),
    todayPrecipitationProbability: getNullableRoundedValue(
      daily?.precipitation_probability_max?.[0],
    ),
  };
}

function normalizeDailyForecast(daily) {
  if (!daily || !Array.isArray(daily.time)) {
    return [];
  }

  return daily.time
    .slice(0, 7)
    .map((dateValue, index) => {
      const weatherCode = Number.isFinite(daily.weather_code?.[index])
        ? daily.weather_code[index]
        : null;
      const temperatureMin = getNullableRoundedValue(daily.temperature_2m_min?.[index]);
      const temperatureMax = getNullableRoundedValue(daily.temperature_2m_max?.[index]);

      if (
        !dateValue ||
        weatherCode === null ||
        temperatureMin === null ||
        temperatureMax === null
      ) {
        return null;
      }

      const formattedDate = formatForecastDate(dateValue);

      return {
        date: formattedDate.date,
        dayLabel: index === 0 ? "Aujourd'hui" : formattedDate.dayLabel,
        condition: getConditionFromWeatherCode(weatherCode),
        weatherCode,
        temperatureMin,
        temperatureMax,
        precipitationProbability: getNullableRoundedValue(
          daily.precipitation_probability_max?.[index],
        ),
        windSpeedMax: getNullableRoundedValue(daily.wind_speed_10m_max?.[index]),
      };
    })
    .filter(Boolean);
}

function normalizeWeatherPayload(
  location,
  forecastPayload,
  airQuality = getUnavailableAirQuality(),
) {
  const current = forecastPayload?.current;

  if (!hasCompleteCurrentWeather(current)) {
    throw new WeatherServiceError('Données météo incomplètes');
  }

  const todayDetails = normalizeTodayDetails(forecastPayload?.daily);

  return {
    city: location.name || DEFAULT_CITY,
    country: location.country || DEFAULT_COUNTRY,
    latitude: location.latitude ?? null,
    longitude: location.longitude ?? null,
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: Math.round(current.relative_humidity_2m),
    windSpeed: Math.round(current.wind_speed_10m),
    windDirection: Math.round(current.wind_direction_10m),
    windDirectionLabel: degreesToCompass(current.wind_direction_10m),
    condition: getConditionFromWeatherCode(current.weather_code),
    weatherCode: current.weather_code,
    updatedAt: formatOpenMeteoTime(current.time),
    source: WEATHER_SOURCE,
    ...todayDetails,
    airQuality,
    forecast: normalizeDailyForecast(forecastPayload?.daily),
  };
}

function formatLocationLabel(location) {
  return [location.name, location.admin1, location.country].filter(Boolean).join(', ');
}

function isLocalResult(location, localCountryCode, localCountry) {
  if (localCountryCode && location.country_code === localCountryCode) {
    return true;
  }

  if (!localCountryCode && localCountry) {
    return normalizeComparableText(location.country) === normalizeComparableText(localCountry);
  }

  return false;
}

function normalizeGeocodingResult(location, priority = {}) {
  if (!Number.isFinite(location?.latitude) || !Number.isFinite(location?.longitude)) {
    return null;
  }

  const label = formatLocationLabel(location);

  return {
    id:
      location.id ||
      `${location.name}-${location.country}-${location.latitude}-${location.longitude}`,
    city: location.name,
    country: location.country || DEFAULT_COUNTRY,
    countryCode: location.country_code || null,
    latitude: location.latitude,
    longitude: location.longitude,
    region: location.admin1 || '',
    label: label || location.name || DEFAULT_CITY,
    isLocal: isLocalResult(location, priority.countryCode, priority.country),
  };
}

async function fetchGeocodingResults(search, { count = 1, countryCode, signal } = {}) {
  const params = {
    name: search,
    count,
    language: 'fr',
    format: 'json',
  };

  if (countryCode) {
    params.countryCode = countryCode;
  }

  const response = await weatherApiClient.get(GEOCODING_API_URL, {
    params,
    signal,
  });

  return Array.isArray(response.data?.results) ? response.data.results : [];
}

function isCanceledError(error) {
  return axios.isCancel(error) || error.code === 'ERR_CANCELED' || error.name === 'CanceledError';
}

function getSuggestionDedupeKey(suggestion) {
  return [
    normalizeComparableText(suggestion.city),
    normalizeComparableText(suggestion.country),
    suggestion.latitude.toFixed(4),
    suggestion.longitude.toFixed(4),
  ].join('|');
}

function mergePrioritizedSuggestions(localResults, globalResults, priority) {
  const suggestionsByKey = new Map();
  const normalizedLocalResults = localResults.map((result) =>
    normalizeGeocodingResult(result, priority),
  );
  const normalizedGlobalResults = globalResults.map((result) =>
    normalizeGeocodingResult(result, priority),
  );
  const localSuggestions = normalizedLocalResults.filter(Boolean).map((suggestion) => ({
    ...suggestion,
    isLocal: true,
  }));
  const globalSuggestions = normalizedGlobalResults.filter(Boolean);
  const sortedSuggestions = [
    ...localSuggestions,
    ...globalSuggestions.filter((suggestion) => suggestion.isLocal),
    ...globalSuggestions.filter((suggestion) => !suggestion.isLocal),
  ];

  sortedSuggestions.forEach((suggestion) => {
    const key = getSuggestionDedupeKey(suggestion);

    if (!suggestionsByKey.has(key)) {
      suggestionsByKey.set(key, suggestion);
    }
  });

  return Array.from(suggestionsByKey.values()).slice(0, MAX_CITY_SUGGESTIONS);
}

async function getCoordinatesForCity(city) {
  const search = city.trim();

  if (search.length < CITY_SUGGESTION_MIN_LENGTH) {
    throw new WeatherServiceError('Ville introuvable');
  }

  const results = await fetchGeocodingResults(search, { count: 1 });
  const location = normalizeGeocodingResult(results[0]);

  if (!location) {
    throw new WeatherServiceError('Ville introuvable');
  }

  return {
    latitude: location.latitude,
    longitude: location.longitude,
    name: location.city,
    country: location.country,
  };
}

async function getCitySuggestions(query, { country, countryCode, signal } = {}) {
  const search = query.trim();

  if (search.length < CITY_SUGGESTION_MIN_LENGTH) {
    return [];
  }

  const normalizedCountryCode = countryCode ? countryCode.toUpperCase() : null;
  const priority = {
    country,
    countryCode: normalizedCountryCode,
  };
  const requests = [];

  if (normalizedCountryCode) {
    requests.push(
      fetchGeocodingResults(search, {
        count: MAX_CITY_SUGGESTIONS,
        countryCode: normalizedCountryCode,
        signal,
      }),
    );
  } else {
    requests.push(Promise.resolve([]));
  }

  requests.push(
    fetchGeocodingResults(search, {
      count: GLOBAL_SUGGESTION_FETCH_COUNT,
      signal,
    }),
  );

  const [localResponse, globalResponse] = await Promise.allSettled(requests);
  const localFailed = localResponse.status === 'rejected';
  const globalFailed = globalResponse.status === 'rejected';

  if (localFailed && globalFailed) {
    const localReason = localResponse.reason;
    const globalReason = globalResponse.reason;

    if (isCanceledError(localReason) || isCanceledError(globalReason)) {
      throw localReason || globalReason;
    }

    throw new WeatherServiceError('Suggestions indisponibles');
  }

  const localResults = localResponse.status === 'fulfilled' ? localResponse.value : [];
  const globalResults = globalResponse.status === 'fulfilled' ? globalResponse.value : [];

  return mergePrioritizedSuggestions(localResults, globalResults, priority);
}

function normalizeCoordinateLocation(location) {
  if (!Number.isFinite(location?.latitude) || !Number.isFinite(location?.longitude)) {
    throw new WeatherServiceError('Impossible de récupérer la météo');
  }

  return {
    latitude: location.latitude,
    longitude: location.longitude,
    name: location.city || DEFAULT_CITY,
    country: location.country || DEFAULT_COUNTRY,
  };
}

async function getAirQualityForLocation(location) {
  try {
    const response = await weatherApiClient.get(AIR_QUALITY_API_URL, {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
        current: AIR_QUALITY_VARIABLES,
        timezone: 'auto',
      },
    });

    return normalizeAirQualityPayload(response.data);
  } catch (error) {
    console.warn("[weatherService] Qualité de l'air indisponible:", error.message);
    return getUnavailableAirQuality();
  }
}

async function getForecastForLocation(location) {
  const [forecastResponse, airQualityResponse] = await Promise.allSettled([
    weatherApiClient.get(FORECAST_API_URL, {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
        current: WEATHER_VARIABLES,
        daily: DAILY_WEATHER_VARIABLES,
        forecast_days: 7,
        timezone: 'auto',
      },
    }),
    getAirQualityForLocation(location),
  ]);

  if (forecastResponse.status === 'rejected') {
    throw forecastResponse.reason;
  }

  const airQuality =
    airQualityResponse.status === 'fulfilled'
      ? airQualityResponse.value
      : getUnavailableAirQuality();

  return normalizeWeatherPayload(location, forecastResponse.value.data, airQuality);
}

function normalizeError(error) {
  if (error instanceof WeatherServiceError) {
    return error;
  }

  if (isCanceledError(error)) {
    return error;
  }

  if (error.code === 'ECONNABORTED') {
    return new WeatherServiceError('Impossible de récupérer la météo');
  }

  return new WeatherServiceError('Impossible de récupérer la météo');
}

async function getCurrentWeather(city = DEFAULT_CITY) {
  try {
    const location = await getCoordinatesForCity(city);
    return await getForecastForLocation(location);
  } catch (error) {
    throw normalizeError(error);
  }
}

async function getCurrentWeatherByCoordinates(location) {
  try {
    const normalizedLocation = normalizeCoordinateLocation(location);
    return await getForecastForLocation(normalizedLocation);
  } catch (error) {
    throw normalizeError(error);
  }
}

const weatherService = {
  client: weatherApiClient,
  provider: WEATHER_PROVIDERS.OPEN_METEO,
  getCitySuggestions,
  getCurrentWeather,
  getCurrentWeatherByCoordinates,
};

export { degreesToCompass, getAirQualityLevel, getConditionFromWeatherCode, getUvLevel };
export default weatherService;
