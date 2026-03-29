import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { lightColors, darkColors, ThemeColors } from '../styles/theme';

/**
 * A custom hook to inject the current theme (Dark/Light) into any style-generating function.
 * @param styleFactory A function that takes `ThemeColors` and returns a StyleSheet
 */
export function useThemeStyles<T>(styleFactory: (colors: ThemeColors) => T) {
  // Expo's built in color scheme detector (reads from OS or App settings)
  const systemColorScheme = useColorScheme();
  const isDarkMode = systemColorScheme === 'dark';
  const theme = isDarkMode ? darkColors : lightColors;

  // useMemo ensures that styles are only recalculated when the dark/light mode toggles.
  const styles = useMemo(() => styleFactory(theme), [theme, styleFactory]);

  return { styles, theme };
}
