import { StyleSheet } from 'react-native';
import { ThemeColors } from '../theme';

export const getFABStyles = (colors: ThemeColors) => StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90, // Accounts for bottom tab bar height (roughly 60-80px depending on OS)
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.isDark ? '#000' : colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999, // Ensure it sits above tab content
  }
});
