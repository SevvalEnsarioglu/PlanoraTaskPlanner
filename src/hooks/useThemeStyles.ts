import { useMemo } from 'react';
import { lightColors, darkColors, ThemeColors } from '../styles/theme';
import { useTheme } from '../context/ThemeContext';

/**
 * A custom hook to inject the current theme (Dark/Light) into any style-generating function.
 * @param styleFactory A function that takes `ThemeColors` and returns a StyleSheet
 */
export function useThemeStyles<T>(styleFactory: (colors: ThemeColors) => T) {
  const { isDarkMode } = useTheme();
  const themeColors = isDarkMode ? darkColors : lightColors;

  const styles = useMemo(() => styleFactory(themeColors), [themeColors, styleFactory]);

  return { styles, theme: themeColors };
}
