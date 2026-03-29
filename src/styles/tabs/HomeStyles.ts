import { StyleSheet } from 'react-native';
import { ThemeColors, spacing } from '../theme';

export const getHomeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  taskCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  }
});
