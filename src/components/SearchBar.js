import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { theme } from '../styles/theme';

export default function SearchBar({
  disabled,
  message,
  onChangeText,
  onSelectSuggestion,
  onSubmit,
  suggestions,
  value,
}) {
  const hasSuggestions = suggestions.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          editable={!disabled}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder="Rechercher une ville"
          placeholderTextColor={theme.colors.textMuted}
          returnKeyType="search"
          style={styles.input}
          value={value}
        />
        {value ? (
          <TouchableOpacity
            accessibilityLabel="Effacer la ville saisie"
            activeOpacity={0.72}
            disabled={disabled}
            hitSlop={8}
            onPress={() => onChangeText('')}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>?</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {hasSuggestions || message ? (
        <View style={styles.suggestionsContainer}>
          {hasSuggestions
            ? suggestions.map((suggestion) => (
                <TouchableOpacity
                  activeOpacity={0.76}
                  key={suggestion.id}
                  onPress={() => onSelectSuggestion(suggestion)}
                  style={styles.suggestionButton}
                >
                  <Text style={styles.suggestionText}>{suggestion.label}</Text>
                  {suggestion.isLocal ? <Text style={styles.localBadge}>Pays actuel</Text> : null}
                </TouchableOpacity>
              ))
            : null}

          {!hasSuggestions && message ? <Text style={styles.messageText}>{message}</Text> : null}
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.82}
        disabled={disabled}
        onPress={onSubmit}
        style={[styles.button, disabled && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>{disabled ? 'Chargement...' : 'Rechercher'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    maxWidth: 440,
    width: '100%',
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.sm,
  },
  input: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: theme.typography.sizes.md,
    letterSpacing: 0,
    paddingVertical: theme.spacing.md,
  },
  clearButton: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 32,
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
    width: 32,
  },
  clearButtonText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
    lineHeight: 20,
  },
  suggestionsContainer: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  suggestionButton: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  suggestionText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: 0,
  },
  localBadge: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    letterSpacing: 0,
    marginTop: theme.spacing.xs,
  },
  messageText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.primaryMuted,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0,
  },
});
