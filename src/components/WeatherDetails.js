import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../styles/theme';

function getDisplayValue(value, fallback = 'Indispo.') {
  if (value === null || value === undefined || value === '' || Number.isNaN(value)) {
    return fallback;
  }

  return value;
}

function MiniTile({ icon, label, value, weatherTheme }) {
  const tileTheme = weatherTheme || theme.weatherThemes.sunny;

  return (
    <View style={[styles.tile, { backgroundColor: tileTheme.tile, borderColor: tileTheme.border }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[styles.value, { color: tileTheme.primary }]}
      >
        {value}
      </Text>
      <Text numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

function getRainValue(weather) {
  if (!Number.isFinite(weather.todayPrecipitationProbability)) {
    return 'Indispo.';
  }

  return weather.todayPrecipitationProbability + '%';
}

export default function WeatherDetails({ weather, weatherTheme }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détails météo</Text>

      <View style={styles.tilesRow}>
        <MiniTile
          icon="🌅"
          label="Lever"
          value={getDisplayValue(weather.sunrise)}
          weatherTheme={weatherTheme}
        />
        <MiniTile
          icon="🌇"
          label="Coucher"
          value={getDisplayValue(weather.sunset)}
          weatherTheme={weatherTheme}
        />
        <MiniTile
          icon="💧"
          label="Pluie"
          value={getRainValue(weather)}
          weatherTheme={weatherTheme}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginTop: theme.spacing.lg,
    maxWidth: 440,
    width: '100%',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
    marginBottom: theme.spacing.sm,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  tile: {
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flex: 1,
    minHeight: 84,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    ...theme.shadows.soft,
  },
  icon: {
    fontSize: 21,
    lineHeight: 25,
    marginBottom: theme.spacing.xs,
  },
  value: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
    lineHeight: 24,
    textAlign: 'center',
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    letterSpacing: 0,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});
