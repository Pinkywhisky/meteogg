import * as Location from 'expo-location';

import { DEFAULT_CITY, DEFAULT_COUNTRY } from './weatherService';

const LOCATION_PERMISSION_TIMEOUT_MS = 15000;
const LOCATION_SERVICES_TIMEOUT_MS = 5000;
const LOCATION_TIMEOUT_MS = 12000;
const REVERSE_GEOCODING_TIMEOUT_MS = 10000;

class LocationServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LocationServiceError';
  }
}

function withTimeout(promise, timeoutMs, message) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new LocationServiceError(message));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

async function requestLocationPermission() {
  const { status } = await withTimeout(
    Location.requestForegroundPermissionsAsync(),
    LOCATION_PERMISSION_TIMEOUT_MS,
    'Permission de localisation indisponible',
  );

  if (status !== 'granted') {
    console.warn('[LocationService] Permission GPS refusée');
    throw new LocationServiceError('Permission de localisation refusée');
  }

  return true;
}

async function getCurrentLocation() {
  const servicesEnabled = await withTimeout(
    Location.hasServicesEnabledAsync(),
    LOCATION_SERVICES_TIMEOUT_MS,
    'Services GPS indisponibles',
  );

  if (!servicesEnabled) {
    console.warn('[LocationService] Services GPS désactivés');
    throw new LocationServiceError('GPS désactivé');
  }

  const position = await withTimeout(
    Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    }),
    LOCATION_TIMEOUT_MS,
    'Position GPS indisponible',
  );

  const { latitude, longitude } = position.coords;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    console.warn('[LocationService] Coordonnées GPS invalides');
    throw new LocationServiceError('Position indisponible');
  }

  return { latitude, longitude };
}

function pickCityFromAddress(address) {
  return address.city || address.subregion || address.district || address.region || DEFAULT_CITY;
}

async function getCurrentCity() {
  await requestLocationPermission();

  const coordinates = await getCurrentLocation();
  const addresses = await withTimeout(
    Location.reverseGeocodeAsync(coordinates),
    REVERSE_GEOCODING_TIMEOUT_MS,
    'Géocodage impossible',
  );
  const address = addresses?.[0];

  if (!address) {
    console.warn('[LocationService] Aucun résultat de reverse geocoding');
    throw new LocationServiceError('Géocodage impossible');
  }

  return {
    city: pickCityFromAddress(address),
    country: address.country || DEFAULT_COUNTRY,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  };
}

const locationService = {
  requestLocationPermission,
  getCurrentLocation,
  getCurrentCity,
};

export { getCurrentCity, getCurrentLocation, requestLocationPermission };
export default locationService;
