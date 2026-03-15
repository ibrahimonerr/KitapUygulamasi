import { useColorScheme } from 'react-native';
import { DARK_THEME, LIGHT_THEME } from '../constants/theme';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? DARK_THEME : LIGHT_THEME;
  const isDark = colorScheme === 'dark';

  return { colors, isDark, colorScheme };
};
