import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../styles/theme';

export default function Header({ isSearchVisible, onToggleSearch, subtitle, title }) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.sideSpace} />
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          accessibilityLabel={isSearchVisible ? 'Fermer la recherche' : 'Ouvrir la recherche'}
          activeOpacity={0.76}
          onPress={onToggleSearch}
          style={styles.searchButton}
        >
          <Text style={styles.searchIcon}>{isSearchVisible ? '✕' : '🔍'}</Text>
        </TouchableOpacity>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxWidth: 440,
    width: '100%',
  },
  sideSpace: {
    height: 44,
    width: 44,
  },
  title: {
    color: theme.colors.textPrimary,
    flexShrink: 1,
    fontSize: theme.typography.sizes.display,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
    textAlign: 'center',
  },
  searchButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  searchIcon: {
    color: theme.colors.primaryDark,
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
    lineHeight: 28,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: 0,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});
