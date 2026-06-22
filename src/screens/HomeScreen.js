import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ForecastList from '../components/ForecastList';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import WeatherCard from '../components/WeatherCard';
import locationService from '../services/locationService';
import weatherService, { DEFAULT_CITY } from '../services/weatherService';
import { theme } from '../styles/theme';

const FALLBACK_LOCATION_MESSAGE = 'Localisation désactivée - météo de Bezons affichée';
const MANUAL_SEARCH_MESSAGE = 'Ville recherchée manuellement';
const AUTO_LOCATION_MESSAGE = 'Position détectée automatiquement';
const INITIAL_LOCATION_MESSAGE = 'Détection de votre position...';
const DEFAULT_WEATHER_ERROR = 'Impossible de récupérer la météo';
const SEARCH_DEBOUNCE_MS = 400;

function isCanceledRequest(error) {
  return error.code === 'ERR_CANCELED' || error.name === 'CanceledError';
}

export default function HomeScreen() {
  const [cityQuery, setCityQuery] = useState(DEFAULT_CITY);
  const [weather, setWeather] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [locationMessage, setLocationMessage] = useState(INITIAL_LOCATION_MESSAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoLocated, setIsAutoLocated] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionMessage, setSuggestionMessage] = useState('');
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setSuggestionMessage('');
    setIsSuggestionLoading(false);
  }, []);

  const loadWeatherByCity = useCallback(
    async (city) => {
      const search = city.trim();

      if (!search) {
        setErrorMessage('Ville introuvable');
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const currentWeather = await weatherService.getCurrentWeather(search);
        setWeather(currentWeather);
        setCityQuery(currentWeather.city);
        setIsAutoLocated(false);
        setIsSearchVisible(false);
        clearSuggestions();
        setLocationMessage(MANUAL_SEARCH_MESSAGE);
      } catch (error) {
        console.warn('[HomeScreen] Recherche ville impossible:', error.message);
        setErrorMessage(error.message || DEFAULT_WEATHER_ERROR);
      } finally {
        setIsLoading(false);
      }
    },
    [clearSuggestions],
  );

  const loadWeatherBySuggestion = useCallback(
    async (suggestion) => {
      Keyboard.dismiss();
      setIsLoading(true);
      setErrorMessage('');

      try {
        const currentWeather = await weatherService.getCurrentWeatherByCoordinates(suggestion);
        setWeather(currentWeather);
        setCityQuery(suggestion.city);
        setIsAutoLocated(false);
        setIsSearchVisible(false);
        clearSuggestions();
        setLocationMessage(MANUAL_SEARCH_MESSAGE);
      } catch (error) {
        console.warn('[HomeScreen] Suggestion ville impossible:', error.message);
        setErrorMessage(error.message || DEFAULT_WEATHER_ERROR);
      } finally {
        setIsLoading(false);
      }
    },
    [clearSuggestions],
  );

  const loadWeatherFromCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    setLocationMessage(INITIAL_LOCATION_MESSAGE);

    try {
      const currentCity = await locationService.getCurrentCity();
      const currentWeather = await weatherService.getCurrentWeatherByCoordinates(currentCity);
      setWeather(currentWeather);
      setCityQuery(currentWeather.city);
      setIsAutoLocated(true);
      setLocationMessage(AUTO_LOCATION_MESSAGE);
    } catch (locationError) {
      console.warn('[HomeScreen] Localisation indisponible:', locationError.message);
      setIsAutoLocated(false);
      setLocationMessage(FALLBACK_LOCATION_MESSAGE);

      try {
        const fallbackWeather = await weatherService.getCurrentWeather(DEFAULT_CITY);
        setWeather(fallbackWeather);
        setCityQuery(fallbackWeather.city);
      } catch (fallbackError) {
        console.warn('[HomeScreen] Fallback Bezons impossible:', fallbackError.message);
        setErrorMessage(DEFAULT_WEATHER_ERROR);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeatherFromCurrentLocation();
  }, [loadWeatherFromCurrentLocation]);

  useEffect(() => {
    if (!isSearchVisible) {
      clearSuggestions();
      return undefined;
    }

    const search = cityQuery.trim();

    if (search.length < 2) {
      clearSuggestions();
      return undefined;
    }

    const controller = new AbortController();
    const debounceId = setTimeout(async () => {
      setIsSuggestionLoading(true);
      setSuggestionMessage('');

      try {
        const nextSuggestions = await weatherService.getCitySuggestions(search, {
          signal: controller.signal,
        });

        setSuggestions(nextSuggestions);
        setSuggestionMessage(nextSuggestions.length === 0 ? 'Aucune ville trouvée' : '');
      } catch (error) {
        if (isCanceledRequest(error)) {
          return;
        }

        console.warn('[HomeScreen] Suggestions indisponibles:', error.message);
        setSuggestions([]);
        setSuggestionMessage('Suggestions indisponibles');
      } finally {
        setIsSuggestionLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(debounceId);
      controller.abort();
    };
  }, [cityQuery, clearSuggestions, isSearchVisible]);

  function handleSearch() {
    Keyboard.dismiss();
    clearSuggestions();
    loadWeatherByCity(cityQuery);
  }

  function handleToggleSearch() {
    setIsSearchVisible((currentValue) => {
      const nextValue = !currentValue;

      if (!nextValue) {
        Keyboard.dismiss();
        clearSuggestions();
      }

      return nextValue;
    });
    setErrorMessage('');
  }

  const searchMessage = isSuggestionLoading ? 'Recherche de villes...' : suggestionMessage;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Header
          isSearchVisible={isSearchVisible}
          onToggleSearch={handleToggleSearch}
          title="MeteoGG"
          subtitle="Météo locale par Open-Meteo"
        />

        {isSearchVisible ? (
          <SearchBar
            disabled={isLoading}
            message={searchMessage}
            onChangeText={setCityQuery}
            onSelectSuggestion={loadWeatherBySuggestion}
            onSubmit={handleSearch}
            suggestions={suggestions}
            value={cityQuery}
          />
        ) : null}

        {locationMessage ? <Text style={styles.locationText}>{locationMessage}</Text> : null}
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.weatherSection}>
          {isLoading && !weather ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.loadingText}>Chargement de la météo...</Text>
            </View>
          ) : null}

          {weather ? (
            <>
              <WeatherCard
                weather={weather}
                isAutoLocated={isAutoLocated}
                isRefreshing={isLoading}
              />
              <ForecastList forecast={weather.forecast} />
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxxl,
  },
  locationText: {
    alignSelf: 'center',
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: 0,
    marginTop: theme.spacing.md,
    maxWidth: 440,
    textAlign: 'center',
    width: '100%',
  },
  errorText: {
    alignSelf: 'center',
    color: theme.colors.danger,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    letterSpacing: 0,
    marginTop: theme.spacing.sm,
    maxWidth: 440,
    textAlign: 'center',
    width: '100%',
  },
  weatherSection: {
    marginTop: theme.spacing.lg,
  },
  loadingBlock: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.md,
    letterSpacing: 0,
    marginTop: theme.spacing.md,
  },
});
