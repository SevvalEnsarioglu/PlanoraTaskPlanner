import { StyleSheet } from 'react-native';
import { ThemeColors, spacing, fonts } from './theme';

export const getGlobalStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  text: {
    color: colors.text,
    fontSize: fonts.sizes.md,
  },
  title: {
    color: colors.text,
    fontSize: fonts.sizes.title,
    fontWeight: fonts.weights.bold,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF', // Button text on primary is generally white
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: fonts.sizes.md,
  }
});
