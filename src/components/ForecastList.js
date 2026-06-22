import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../styles/theme';
import ForecastCard from './ForecastCard';

export default function ForecastList({ forecast }) {
  const hasForecast = Array.isArray(forecast) && forecast.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prévisions 7 jours</Text>

      {hasForecast ? (
        forecast.map((item) => (
          <ForecastCard forecast={item} key={`${item.date}-${item.weatherCode}`} />
        ))
      ) : (
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyText}>Prévisions indisponibles</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginTop: theme.spacing.xl,
    maxWidth: 440,
    width: '100%',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
    marginBottom: theme.spacing.md,
  },
  emptyBlock: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.lg,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: 0,
  },
});
