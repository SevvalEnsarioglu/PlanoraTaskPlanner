import { StyleSheet } from 'react-native';
import { ThemeColors, spacing } from '../theme';

export const getLoginStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    color: colors.text,
    marginBottom: spacing.xs,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    padding: spacing.md,
    color: colors.text,
  },
  loginButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  registerLink: {
    color: colors.primary,
    fontWeight: 'bold',
  }
});
