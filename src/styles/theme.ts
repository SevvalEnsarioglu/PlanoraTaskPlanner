export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  isDark: boolean;
}

export const lightColors: ThemeColors = {
  background: '#FAF7F5',        // Sıcak krem arka plan
  surface: '#FFFFFF',           // Kartlar için temiz beyaz
  primary: '#850E35',           // Derin bordo
  secondary: '#EE6983',         // Aksan pembe
  text: '#1C1917',              // Sıcak siyah
  textSecondary: '#78716C',     // Nötr warm-gray
  border: '#E7E5E4',            // Hafif gri
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  isDark: false,
};

export const darkColors: ThemeColors = {
  background: '#1C1512',
  surface: '#292320',
  primary: '#F4A5B9',
  secondary: '#EE6983',
  text: '#FAF7F5',
  textSecondary: '#A8A29E',
  border: '#3C3330',
  error: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
  isDark: true,
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40,
};

export const fonts = {
  sizes: {
    xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24, title: 28,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  }
};
