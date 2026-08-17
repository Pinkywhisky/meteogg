import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../styles/theme';
import ForecastCard from './ForecastCard';

export default function ForecastList({ forecast, weatherTheme }) {
  const hasForecast = Array.isArray(forecast) && forecast.length > 0;
  const listTheme = weatherTheme || theme.weatherThemes.sunny;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prévisions 7 jours</Text>

      {hasForecast ? (
        <View
          style={[
            styles.listBlock,
            { backgroundColor: listTheme.hero, borderColor: listTheme.border },
          ]}
        >
          {forecast.map((item, index) => (
            <ForecastCard
              forecast={item}
              isLast={index === forecast.length - 1}
              key={item.date + '-' + item.weatherCode}
              weatherTheme={weatherTheme}
            />
          ))}
        </View>
      ) : (
        <View
          style={[
            styles.emptyBlock,
            { backgroundColor: listTheme.tile, borderColor: listTheme.border },
          ]}
        >
          <Text style={styles.emptyText}>Prévisions indisponibles</Text>
        </View>
      )}
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
  listBlock: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    ...theme.shadows.soft,
  },
  emptyBlock: {
    alignItems: 'center',
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
