import { StyleSheet } from 'react-native';
import { ThemeColors, spacing } from '../theme';

export const getProfileStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  }
});
