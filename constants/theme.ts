export const DARK_THEME = {
  background: '#0a0a0c',
  surfaceLight: 'rgba(255, 255, 255, 0.05)',
  surfaceMedium: 'rgba(255, 255, 255, 0.1)',
  surfaceGlass: 'rgba(255, 255, 255, 0.15)',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  primary: '#5E9CFF',
  highlight: 'rgba(94, 156, 255, 0.2)',
  border: 'rgba(255, 255, 255, 0.1)',
};

export const LIGHT_THEME = {
  background: '#F8F9FA',
  surfaceLight: 'rgba(0, 0, 0, 0.03)',
  surfaceMedium: 'rgba(0, 0, 0, 0.06)',
  surfaceGlass: 'rgba(0, 0, 0, 0.08)',
  text: '#1A1A1A',
  textMuted: 'rgba(0, 0, 0, 0.5)',
  primary: '#0066FF',
  highlight: 'rgba(0, 102, 255, 0.1)',
  border: 'rgba(0, 0, 0, 0.1)',
};

// Geriye dönük uyumluluk için varsayılan export (Daha sonra useTheme hook'u ile dinamikleşecek)
export const COLORS = DARK_THEME;

export const FONTS = {
  primary: {
    regular: 'Inter_400Regular',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  serif: {
    regular: 'Lora_400Regular',
    semiBold: 'Lora_600SemiBold',
    bold: 'Lora_700Bold',
  },
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};
