import { StyleSheet } from 'react-native';
import { ThemeColors, spacing } from '../theme';

export const getPomodoroStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  }
});
