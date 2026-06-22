import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../styles/theme';

function getConditionIcon(condition) {
  const normalizedCondition = condition.toLowerCase();

  if (normalizedCondition.includes('orage')) {
    return '⛈️';
  }

  if (normalizedCondition.includes('pluie') || normalizedCondition.includes('bruine')) {
    return '🌧️';
  }

  if (normalizedCondition.includes('neige')) {
    return '❄️';
  }

  if (normalizedCondition.includes('brouillard')) {
    return '🌫️';
  }

  if (normalizedCondition.includes('nuage')) {
    return '☁️';
  }

  if (normalizedCondition.includes('inconnu')) {
    return '🌡️';
  }

  return '☀️';
}

function WeatherMetric({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export default function WeatherCard({ weather, isAutoLocated, isRefreshing }) {
  return (
    <View style={[styles.card, isRefreshing && styles.cardRefreshing]}>
      <View style={styles.locationBlock}>
        <Text style={styles.locationLabel}>
          {isAutoLocated ? 'Position détectée automatiquement' : 'Ville recherchée'}
        </Text>
        <Text style={styles.city}>📍 {weather.city}</Text>
        <Text style={styles.country}>{weather.country}</Text>
      </View>

      <View style={styles.currentBlock}>
        <Text style={styles.conditionIcon}>{getConditionIcon(weather.condition)}</Text>
        <View style={styles.conditionTextBlock}>
          <Text style={styles.condition}>{weather.condition}</Text>
          <Text style={styles.sourceLabel}>Source : {weather.source}</Text>
        </View>
      </View>

      <Text style={styles.temperature}>{weather.temperature}°C</Text>

      <View style={styles.metricsGrid}>
        <WeatherMetric label="Ressenti" value={`${weather.feelsLike}°C`} />
        <WeatherMetric label="Humidité" value={`${weather.humidity}%`} />
        <WeatherMetric
          label="Vent"
          value={`${weather.windSpeed} km/h ${weather.windDirectionLabel}`}
        />
      </View>

      <View style={styles.updatedBlock}>
        <Text style={styles.updatedLabel}>Mis à jour</Text>
        <Text style={styles.updatedValue}>{weather.updatedAt}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    maxWidth: 440,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
    width: '100%',
    ...theme.shadows.card,
  },
  cardRefreshing: {
    opacity: 0.72,
  },
  locationBlock: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  locationLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    letterSpacing: 0,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  city: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
    textAlign: 'center',
  },
  country: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: 0,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  currentBlock: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
  },
  conditionIcon: {
    fontSize: 48,
    lineHeight: 56,
    marginRight: theme.spacing.md,
  },
  conditionTextBlock: {
    flexShrink: 1,
  },
  condition: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    letterSpacing: 0,
  },
  sourceLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: 0,
    marginTop: theme.spacing.xs,
  },
  temperature: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.temperature,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  metricsGrid: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  metric: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  metricValue: {
    color: theme.colors.primaryDark,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
  },
  metricLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: 0,
    marginTop: theme.spacing.xs,
  },
  updatedBlock: {
    alignItems: 'center',
    borderTopColor: theme.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: theme.spacing.lg,
  },
  updatedLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.sm,
    letterSpacing: 0,
    marginBottom: theme.spacing.xs,
  },
  updatedValue: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    letterSpacing: 0,
  },
});
