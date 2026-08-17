import { StyleSheet, View } from 'react-native';

import { theme } from '../styles/theme';
import InfoTile from './InfoTile';
import WeatherHero from './WeatherHero';

function getAirParts(weather) {
  const airQuality = weather.airQuality || {};

  if (!Number.isFinite(airQuality.europeanAqi)) {
    return { detail: '', value: 'Indispo.' };
  }

  return { detail: airQuality.level, value: String(airQuality.europeanAqi) };
}

function getUvParts(weather) {
  if (!Number.isFinite(weather.uvIndex)) {
    return { detail: '', value: 'Indispo.' };
  }

  return { detail: weather.uvLevel, value: String(weather.uvIndex) };
}

export default function WeatherCard({ weather, isRefreshing, weatherTheme }) {
  const uvParts = getUvParts(weather);
  const airParts = getAirParts(weather);

  return (
    <View style={[styles.container, isRefreshing && styles.refreshing]}>
      <WeatherHero weather={weather} weatherTheme={weatherTheme} />

      <View style={styles.tilesGrid}>
        <View style={styles.tileRow}>
          <InfoTile
            detail="Taux actuel"
            icon="💧"
            label="Humidité"
            value={weather.humidity + ' %'}
            weatherTheme={weatherTheme}
          />
          <InfoTile
            detail={weather.windDirectionLabel}
            icon="🌬️"
            label="Vent"
            value={weather.windSpeed + ' km/h'}
            weatherTheme={weatherTheme}
          />
        </View>
        <View style={styles.tileRow}>
          <InfoTile
            detail={uvParts.detail}
            icon="☀️"
            label="UV"
            value={uvParts.value}
            weatherTheme={weatherTheme}
          />
          <InfoTile
            detail={airParts.detail}
            icon="🌫️"
            label="Air"
            value={airParts.value}
            weatherTheme={weatherTheme}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    maxWidth: 440,
    width: '100%',
  },
  refreshing: {
    opacity: 0.78,
  },
  tilesGrid: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  tileRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
});
