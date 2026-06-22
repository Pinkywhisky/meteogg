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

function OptionalMetric({ label, value, suffix }) {
  if (value === null || value === undefined) {
    return null;
  }

  return (
    <Text style={styles.secondaryText}>
      {label} {value}
      {suffix}
    </Text>
  );
}

export default function ForecastCard({ forecast }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.dateText}>
          {forecast.dayLabel === "Aujourd'hui"
            ? forecast.dayLabel
            : `${forecast.dayLabel} ${forecast.date}`}
        </Text>
        <Text style={styles.icon}>{getConditionIcon(forecast.condition)}</Text>
      </View>

      <Text style={styles.condition}>{forecast.condition}</Text>
      <Text style={styles.temperatureText}>
        {forecast.temperatureMin}°C / {forecast.temperatureMax}°C
      </Text>

      <View style={styles.metricsBlock}>
        <OptionalMetric label="Pluie" suffix=" %" value={forecast.precipitationProbability} />
        <OptionalMetric label="Vent" suffix=" km/h" value={forecast.windSpeedMax} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  dateText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
  },
  icon: {
    fontSize: 26,
    lineHeight: 30,
  },
  condition: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    letterSpacing: 0,
    marginBottom: theme.spacing.xs,
  },
  temperatureText: {
    color: theme.colors.primaryDark,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
    marginBottom: theme.spacing.sm,
  },
  metricsBlock: {
    gap: theme.spacing.xs,
  },
  secondaryText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: 0,
  },
});
