import { useMemo } from 'react';
import { useTheme } from './useTheme';
import { generateThemeColors, getPrimaryToneSequence, PRIMARY_COLOR } from '../lib/colorConfig';

/**
 * Hook that provides dynamic theme colors based on the current theme mode
 */
export function useDynamicTheme() {
  const { isDark, resolvedTheme } = useTheme();
  
  // Generate theme colors based on current mode
  const themeColors = useMemo(() => {
    return generateThemeColors(PRIMARY_COLOR, isDark);
  }, [isDark]);
  
  // Get primary tones for icons and progress bars
  const primaryTones = useMemo(() => {
    return getPrimaryToneSequence();
  }, []);
  
  // Get a specific primary tone by index (for consistent icon coloring)
  const getPrimaryToneByIndex = (index: number): string => {
    return primaryTones[index % primaryTones.length];
  };
  
  // Get a random primary tone
  const getRandomPrimaryTone = (): string => {
    return primaryTones[Math.floor(Math.random() * primaryTones.length)];
  };
  
  return {
    // Theme colors
    primary: themeColors.primary,
    primaryLight: themeColors.primaryLight,
    primaryLighter: themeColors.primaryLighter,
    primaryLightest: themeColors.primaryLightest,
    primaryDark: themeColors.primaryDark,
    primaryDarker: themeColors.primaryDarker,
    primaryDarkest: themeColors.primaryDarkest,
    
    // Background colors
    background: themeColors.background,
    surface: themeColors.surface,
    surfaceVariant: themeColors.surfaceVariant,
    
    // Text colors
    text: themeColors.text,
    textSecondary: themeColors.textSecondary,
    textMuted: themeColors.textMuted,
    
    // Border colors
    border: themeColors.border,
    borderLight: themeColors.borderLight,
    
    // Primary tones
    primaryTones,
    getPrimaryToneByIndex,
    getRandomPrimaryTone,
    
    // Legacy aliases for backward compatibility
    earthyColors: primaryTones,
    getEarthyColorByIndex: getPrimaryToneByIndex,
    getRandomEarthyColor: getRandomPrimaryTone,
    
    // Theme state
    isDark,
    resolvedTheme,
  };
}
