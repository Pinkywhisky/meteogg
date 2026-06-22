import axios from 'axios';

export const WEATHER_PROVIDERS = {
  OPEN_METEO: 'open-meteo',
  METEO_FRANCE: 'meteo-france',
};

export const DEFAULT_CITY = 'Bezons';
export const DEFAULT_COUNTRY = 'France';

const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast';
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
].join(',');

const DAY_LABELS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
const MAX_CITY_SUGGESTIONS = 5;

const weatherApiClient = axios.create({
  timeout: 10000,
});

class WeatherServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WeatherServiceError';
  }
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
        dayLabel: formattedDate.dayLabel,
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

function normalizeWeatherPayload(location, forecastPayload) {
  const current = forecastPayload?.current;

  if (!hasCompleteCurrentWeather(current)) {
    throw new WeatherServiceError('Données météo incomplètes');
  }

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
    condition: getConditionFromWeatherCode(current.weather_code),
    weatherCode: current.weather_code,
    updatedAt: formatOpenMeteoTime(current.time),
    source: WEATHER_SOURCE,
    forecast: normalizeDailyForecast(forecastPayload?.daily),
  };
}

function formatLocationLabel(location) {
  return [location.name, location.admin1, location.country].filter(Boolean).join(', ');
}

function normalizeGeocodingResult(location) {
  if (!Number.isFinite(location?.latitude) || !Number.isFinite(location?.longitude)) {
    return null;
  }

  const label = formatLocationLabel(location);

  return {
    id: location.id || `${location.name}-${location.latitude}-${location.longitude}`,
    city: location.name,
    country: location.country || DEFAULT_COUNTRY,
    latitude: location.latitude,
    longitude: location.longitude,
    region: location.admin1 || '',
    label: label || location.name || DEFAULT_CITY,
  };
}

async function fetchGeocodingResults(search, { count = 1, signal } = {}) {
  const response = await weatherApiClient.get(GEOCODING_API_URL, {
    params: {
      name: search,
      count,
      language: 'fr',
      format: 'json',
      countryCode: 'FR',
    },
    signal,
  });

  return Array.isArray(response.data?.results) ? response.data.results : [];
}

async function getCoordinatesForCity(city) {
  const search = city.trim();

  if (search.length < 2) {
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

async function getCitySuggestions(query, { signal } = {}) {
  const search = query.trim();

  if (search.length < 2) {
    return [];
  }

  const results = await fetchGeocodingResults(search, {
    count: MAX_CITY_SUGGESTIONS,
    signal,
  });

  return results.map(normalizeGeocodingResult).filter(Boolean).slice(0, MAX_CITY_SUGGESTIONS);
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

async function getForecastForLocation(location) {
  const response = await weatherApiClient.get(FORECAST_API_URL, {
    params: {
      latitude: location.latitude,
      longitude: location.longitude,
      current: WEATHER_VARIABLES,
      daily: DAILY_WEATHER_VARIABLES,
      forecast_days: 7,
      timezone: 'auto',
    },
  });

  return normalizeWeatherPayload(location, response.data);
}

function normalizeError(error) {
  if (error instanceof WeatherServiceError) {
    return error;
  }

  if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
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

export { getConditionFromWeatherCode };
export default weatherService;
