import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../styles/theme';

export default function Header({ isSearchVisible, onToggleSearch, subtitle, title, weatherTheme }) {
  const headerTheme = weatherTheme || theme.weatherThemes.sunny;

  return (
    <View style={styles.container}>
      <View style={styles.locationBlock}>
        <Text style={styles.locationIcon}>📍</Text>
        <View style={styles.titleBlock}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <TouchableOpacity
        accessibilityLabel={isSearchVisible ? 'Fermer la recherche' : 'Ouvrir la recherche'}
        activeOpacity={0.76}
        hitSlop={8}
        onPress={onToggleSearch}
        style={[
          styles.searchButton,
          { backgroundColor: headerTheme.hero, borderColor: headerTheme.border },
        ]}
      >
        <Text style={[styles.searchIcon, { color: headerTheme.primary }]}>
          {isSearchVisible ? '✕' : '🔍'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxWidth: 440,
    paddingBottom: theme.spacing.md,
    width: '100%',
  },
  locationBlock: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
  },
  locationIcon: {
    fontSize: 19,
    lineHeight: 28,
    marginRight: theme.spacing.sm,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: 0,
    marginTop: theme.spacing.xs,
  },
  searchButton: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
    width: 42,
  },
  searchIcon: {
    fontSize: 19,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
    lineHeight: 23,
  },
});
