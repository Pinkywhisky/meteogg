import { StyleSheet, Text, View } from 'react-native';

import { getWeatherIcon, theme } from '../styles/theme';

function getDayText(forecast) {
  if (forecast.dayLabel === "Aujourd'hui") {
    return 'Auj.';
  }

  return forecast.dayLabel.replace('.', '');
}

function RainBadge({ value }) {
  if (!Number.isFinite(value)) {
    return null;
  }

  return (
    <View style={styles.rainBadge}>
      <Text style={styles.rainText}>💧{value}%</Text>
    </View>
  );
}

export default function ForecastCard({ forecast, isLast, weatherTheme }) {
  const compactWeather = {
    condition: forecast.condition,
    weatherCode: forecast.weatherCode,
  };
  const rowTheme = weatherTheme || theme.weatherThemes.sunny;

  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <Text style={styles.dayText}>{getDayText(forecast)}</Text>
      <Text style={styles.icon}>{getWeatherIcon(compactWeather)}</Text>
      <Text style={[styles.temperatureText, { color: rowTheme.primary }]}>
        {forecast.temperatureMin}° / {forecast.temperatureMax}°
      </Text>
      <RainBadge value={forecast.precipitationProbability} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 46,
    paddingVertical: theme.spacing.sm,
  },
  rowBorder: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dayText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
    width: 44,
  },
  icon: {
    fontSize: 22,
    lineHeight: 28,
    marginRight: theme.spacing.md,
    textAlign: 'center',
    width: 32,
  },
  temperatureText: {
    flex: 1,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
  },
  rainBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minWidth: 58,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  rainText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
  },
});
