import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../styles/theme';

function getDisplayValue(value, fallback = 'Indisponible') {
  if (value === null || value === undefined || value === '' || Number.isNaN(value)) {
    return fallback;
  }

  return value;
}

function DetailRow({ icon, text }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}

function getUvText(weather) {
  if (!Number.isFinite(weather.uvIndex)) {
    return 'UV indisponible';
  }

  return 'UV : ' + weather.uvIndex + ' - ' + weather.uvLevel;
}

function getPrecipitationText(weather) {
  if (!Number.isFinite(weather.todayPrecipitationProbability)) {
    return "Pluie aujourd'hui : indisponible";
  }

  return "Pluie aujourd'hui : " + weather.todayPrecipitationProbability + ' %';
}

function getAirQualityText(airQuality) {
  if (!Number.isFinite(airQuality?.europeanAqi)) {
    return "Qualité de l'air indisponible";
  }

  return 'Air : ' + airQuality.europeanAqi + ' - ' + airQuality.level;
}

function getParticleText(airQuality) {
  if (!Number.isFinite(airQuality?.pm10) && !Number.isFinite(airQuality?.pm25)) {
    return '';
  }

  const particles = [];

  if (Number.isFinite(airQuality.pm10)) {
    particles.push('PM10 ' + airQuality.pm10 + ' µg/m³');
  }

  if (Number.isFinite(airQuality.pm25)) {
    particles.push('PM2.5 ' + airQuality.pm25 + ' µg/m³');
  }

  return particles.join(' · ');
}

export default function WeatherDetails({ weather }) {
  const airQuality = weather.airQuality || {};
  const particleText = getParticleText(airQuality);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détails météo</Text>

      <View style={styles.detailsBlock}>
        <DetailRow icon="🌅" text={'Lever : ' + getDisplayValue(weather.sunrise)} />
        <DetailRow icon="🌇" text={'Coucher : ' + getDisplayValue(weather.sunset)} />
        <DetailRow icon="☀️" text={getUvText(weather)} />
        <DetailRow icon="💧" text={getPrecipitationText(weather)} />
        <DetailRow icon="🌫️" text={getAirQualityText(airQuality)} />
        {particleText ? <Text style={styles.particleText}>{particleText}</Text> : null}
      </View>
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
  detailsBlock: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  detailIcon: {
    fontSize: 20,
    lineHeight: 24,
    marginRight: theme.spacing.md,
    width: 28,
  },
  detailText: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: 0,
  },
  particleText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: 0,
    paddingLeft: 40,
  },
});
