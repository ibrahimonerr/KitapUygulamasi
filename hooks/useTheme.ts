import { useContext } from 'react';
import { ThemeContext } from '../store/ThemeContext';

// We'll export the existing useTheme from ThemeContext but keep this file as a proxy 
// to avoid breaking existing imports that use `import { useTheme } from '../hooks/useTheme'`.

export { useTheme } from '../store/ThemeContext';
