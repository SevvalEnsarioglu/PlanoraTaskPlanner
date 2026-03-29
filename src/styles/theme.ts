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
  background: '#FCF5EE', // Çok açık krem/pembe arkaplan
  surface: '#FFFFFF', // Kartlar ve formlar için temiz beyaz yüzey
  primary: '#850E35', // Ana butonlar ve başlıklar için derin bordo
  secondary: '#EE6983', // İkincil vurgular için canlı pembe/gül kurusu
  text: '#2C101A', // Okunabilirliği yüksek çok koyu bordo-gri 
  textSecondary: '#EE6983', 
  border: '#FFC4C4', // Kenarlıklar için açık soft pembe
  error: '#EF4444', 
  success: '#10B981',
  warning: '#F59E0B',
  isDark: false,
};

export const darkColors: ThemeColors = {
  background: '#1D0D14', // Göz yormayan çok koyu bordo/siyah arkaplan
  surface: '#850E35', // Kartlar için paletindeki derin bordo
  primary: '#FFC4C4', // Koyu temada butonlar ve vurgular için parlayan açık pembe
  secondary: '#EE6983', // İkincil detaylar
  text: '#FCF5EE', // Beyaz/krem yazılar
  textSecondary: '#FFC4C4', 
  border: '#4A1D2D', // Koyu temaya uygun koyu kenarlıklar
  error: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
  isDark: true,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const fonts = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    title: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  }
};
