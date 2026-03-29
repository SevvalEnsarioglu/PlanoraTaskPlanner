import { StyleSheet } from 'react-native';
import { ThemeColors, spacing } from '../theme';

export const getRegisterStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  formContainer: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    padding: spacing.md,
    color: colors.text,
  },
  registerButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: 'bold',
  }
});
