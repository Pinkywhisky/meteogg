import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../styles/theme';

export default function InfoTile({ detail, icon, label, value, weatherTheme }) {
  const tileTheme = weatherTheme || theme.weatherThemes.sunny;

  return (
    <View style={[styles.tile, { backgroundColor: tileTheme.tile, borderColor: tileTheme.border }]}>
      <View style={styles.headerRow}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[styles.value, { color: tileTheme.primary }]}
      >
        {value}
      </Text>
      {detail ? (
        <Text numberOfLines={1} style={styles.detail}>
          {detail}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flex: 1,
    minHeight: 104,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  icon: {
    fontSize: 18,
    lineHeight: 22,
    marginRight: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textMuted,
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    letterSpacing: 0,
  },
  value: {
    fontSize: 26,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
    lineHeight: 31,
  },
  detail: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: 0,
    marginTop: theme.spacing.xs,
  },
});
