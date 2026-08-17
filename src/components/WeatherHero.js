import { StyleSheet, Text, View } from 'react-native';

import { getWeatherIcon, theme } from '../styles/theme';

function getTodayRange(weather) {
  const todayForecast = Array.isArray(weather.forecast) ? weather.forecast[0] : null;

  if (!todayForecast) {
    return null;
  }

  return {
    max: todayForecast.temperatureMax,
    min: todayForecast.temperatureMin,
  };
}

function TemperatureBadge({ color, label, value }) {
  return (
    <View style={styles.badge}>
      <Text style={[styles.badgeDot, { color }]}>●</Text>
      <Text style={styles.badgeLabel}>{label}</Text>
      <Text style={styles.badgeValue}>{value}°</Text>
    </View>
  );
}

export default function WeatherHero({ weather, weatherTheme }) {
  const heroTheme = weatherTheme || theme.weatherThemes.sunny;
  const range = getTodayRange(weather);

  return (
    <View style={[styles.hero, { backgroundColor: heroTheme.hero, borderColor: heroTheme.border }]}>
      <View style={[styles.iconHalo, { backgroundColor: heroTheme.soft }]}>
        <Text style={styles.icon}>{getWeatherIcon(weather)}</Text>
      </View>

      <Text style={[styles.temperature, { color: heroTheme.primary }]}>
        {weather.temperature}°C
      </Text>
      <Text style={styles.condition}>{weather.condition}</Text>
      <Text style={styles.feelsLike}>Ressenti {weather.feelsLike}°C</Text>

      {range ? (
        <View style={styles.badgesRow}>
          <TemperatureBadge color="#D94A4A" label="Max" value={range.max} />
          <TemperatureBadge color="#2E74C9" label="Min" value={range.min} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    ...theme.shadows.card,
  },
  iconHalo: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 60,
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    width: 60,
  },
  icon: {
    fontSize: 38,
    lineHeight: 46,
  },
  temperature: {
    fontSize: theme.typography.sizes.hero,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
    lineHeight: 88,
    textAlign: 'center',
  },
  condition: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
    marginTop: 0,
    textAlign: 'center',
  },
  feelsLike: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    letterSpacing: 0,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
  },
  badgeDot: {
    fontSize: 9,
    lineHeight: 11,
    marginRight: theme.spacing.xs,
  },
  badgeLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    letterSpacing: 0,
    marginRight: theme.spacing.xs,
  },
  badgeValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
  },
});
