/**
 * Color Configuration for NTG Ticket System
 * 
 * This file allows you to set a single primary color, and the system will
 * automatically generate all necessary color variations for the theme.
 * 
 * Instructions:
 * 1. Set your desired primary color in the PRIMARY_COLOR constant below
 * 2. The system will automatically generate light/dark variations
 * 3. Earthy tones are used for summary cards and progress bars (separate from theme)
 */

// ============================================================================
// PRIMARY COLOR CONFIGURATION
// ============================================================================
// Change this color to customize your entire theme
export const PRIMARY_COLOR = '#8B5CF6'; // Default red color

// ============================================================================
// PRIMARY COLOR TONES FOR SUMMARY CARDS AND PROGRESS BARS
// ============================================================================
// These colors are derived from the primary color with different tones and saturations
export const PRIMARY_TONES = {
  // Light tones (lighter variations of primary)
  light: lightenColor(PRIMARY_COLOR, 30),      // Light purple
  lighter: lightenColor(PRIMARY_COLOR, 50),    // Very light purple
  lightest: lightenColor(PRIMARY_COLOR, 70),   // Lightest purple
  
  // Dark tones (darker variations of primary)
  dark: darkenColor(PRIMARY_COLOR, 20),        // Dark purple
  darker: darkenColor(PRIMARY_COLOR, 40),      // Darker purple
  darkest: darkenColor(PRIMARY_COLOR, 60),     // Darkest purple
  
  // Saturated variations
  saturated: adjustSaturation(PRIMARY_COLOR, 20),     // More saturated purple
  desaturated: adjustSaturation(PRIMARY_COLOR, -30),  // Less saturated purple
  
  // Warm/cool variations
  warm: adjustHue(PRIMARY_COLOR, 10),         // Slightly warmer purple
  cool: adjustHue(PRIMARY_COLOR, -10),        // Slightly cooler purple
  
  // Neutral variations
  neutral: adjustSaturation(PRIMARY_COLOR, -50),     // Very desaturated purple
  muted: adjustSaturation(PRIMARY_COLOR, -40),       // Muted purple
} as const;

// ============================================================================
// COLOR UTILITY FUNCTIONS
// ============================================================================

/**
 * Converts hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Converts RGB values to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Lightens a color by a given percentage
 */
function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const { r, g, b } = rgb;
  const factor = percent / 100;
  
  return rgbToHex(
    Math.min(255, Math.round(r + (255 - r) * factor)),
    Math.min(255, Math.round(g + (255 - g) * factor)),
    Math.min(255, Math.round(b + (255 - b) * factor))
  );
}

/**
 * Darkens a color by a given percentage
 */
function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const { r, g, b } = rgb;
  const factor = percent / 100;
  
  return rgbToHex(
    Math.max(0, Math.round(r * (1 - factor))),
    Math.max(0, Math.round(g * (1 - factor))),
    Math.max(0, Math.round(b * (1 - factor)))
  );
}

/**
 * Adjusts color saturation
 */
function adjustSaturation(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const { r, g, b } = rgb;
  const factor = percent / 100;
  
  // Convert to HSL, adjust saturation, convert back
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const sum = max + min;
  const l = sum / 2;
  
  let s = 0;
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - sum) : diff / sum;
  }
  
  // Adjust saturation
  s = Math.max(0, Math.min(1, s * (1 + factor)));
  
  // Convert back to RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let newR = r, newG = g, newB = b;
  if (s !== 0) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const h = 0; // We'll keep the same hue
    newR = hue2rgb(p, q, h + 1/3);
    newG = hue2rgb(p, q, h);
    newB = hue2rgb(p, q, h - 1/3);
  }
  
  return rgbToHex(
    Math.round(newR * 255),
    Math.round(newG * 255),
    Math.round(newB * 255)
  );
}

/**
 * Adjusts color hue by a given number of degrees
 */
function adjustHue(hex: string, degrees: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const { r, g, b } = rgb;
  
  // Convert RGB to HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const diff = max - min;
  const sum = max + min;
  const l = sum / 2;
  
  let h = 0;
  if (diff !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / diff) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / diff + 2;
    } else {
      h = (rNorm - gNorm) / diff + 4;
    }
  }
  h = h * 60;
  if (h < 0) h += 360;
  
  // Adjust hue
  h = (h + degrees) % 360;
  if (h < 0) h += 360;
  
  // Convert back to RGB
  const c = (1 - Math.abs(2 * l - 1)) * (max - min) / max;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let newR = 0, newG = 0, newB = 0;
  if (0 <= h && h < 60) {
    newR = c; newG = x; newB = 0;
  } else if (60 <= h && h < 120) {
    newR = x; newG = c; newB = 0;
  } else if (120 <= h && h < 180) {
    newR = 0; newG = c; newB = x;
  } else if (180 <= h && h < 240) {
    newR = 0; newG = x; newB = c;
  } else if (240 <= h && h < 300) {
    newR = x; newG = 0; newB = c;
  } else if (300 <= h && h < 360) {
    newR = c; newG = 0; newB = x;
  }
  
  return rgbToHex(
    Math.round((newR + m) * 255),
    Math.round((newG + m) * 255),
    Math.round((newB + m) * 255)
  );
}

/**
 * Generates a complete color palette from a single primary color
 */
export function generateColorPalette(primaryColor: string): string[] {
  return [
    lightenColor(primaryColor, 90),  // 0 - Lightest
    lightenColor(primaryColor, 80),  // 1 - Very light
    lightenColor(primaryColor, 60),  // 2 - Light
    lightenColor(primaryColor, 40),  // 3 - Lighter
    lightenColor(primaryColor, 20),  // 4 - Light-medium
    primaryColor,                    // 5 - Primary color
    darkenColor(primaryColor, 10),   // 6 - Medium
    darkenColor(primaryColor, 25),   // 7 - Medium-dark
    darkenColor(primaryColor, 40),   // 8 - Dark
    darkenColor(primaryColor, 60),   // 9 - Darkest
  ];
}

/**
 * Generates theme-adapted colors for light and dark modes
 */
export function generateThemeColors(primaryColor: string, isDark: boolean) {
  const basePalette = generateColorPalette(primaryColor);
  
  if (isDark) {
    // For dark mode, we need to adjust the palette to work better
    return {
      primary: basePalette[5],
      primaryLight: basePalette[4],
      primaryLighter: basePalette[3],
      primaryLightest: basePalette[2],
      primaryDark: basePalette[6],
      primaryDarker: basePalette[7],
      primaryDarkest: basePalette[8],
      
      // Background colors (darker for dark mode)
      background: '#1a1a1a',
      surface: '#2d2d2d',
      surfaceVariant: '#3a3a3a',
      
      // Text colors (lighter for dark mode)
      text: '#ffffff',
      textSecondary: '#b3b3b3',
      textMuted: '#808080',
      
      // Border colors
      border: '#404040',
      borderLight: '#4a4a4a',
    };
  } else {
    // For light mode, use the standard palette
    return {
      primary: basePalette[5],
      primaryLight: basePalette[4],
      primaryLighter: basePalette[3],
      primaryLightest: basePalette[2],
      primaryDark: basePalette[6],
      primaryDarker: basePalette[7],
      primaryDarkest: basePalette[8],
      
      // Background colors (lighter for light mode)
      background: '#ffffff',
      surface: '#f8f9fa',
      surfaceVariant: '#f1f3f4',
      
      // Text colors (darker for light mode)
      text: '#212529',
      textSecondary: '#6c757d',
      textMuted: '#adb5bd',
      
      // Border colors
      border: '#dee2e6',
      borderLight: '#e9ecef',
    };
  }
}

/**
 * Gets primary tone colors for summary cards and progress bars
 */
export function getPrimaryTones() {
  return Object.values(PRIMARY_TONES);
}

/**
 * Gets a specific primary tone by name
 */
export function getPrimaryTone(name: keyof typeof PRIMARY_TONES): string {
  return PRIMARY_TONES[name];
}

/**
 * Gets a random primary tone (useful for dynamic icon coloring)
 */
export function getRandomPrimaryTone(): string {
  const tones = Object.values(PRIMARY_TONES);
  return tones[Math.floor(Math.random() * tones.length)];
}

/**
 * Gets primary tones in a specific order for consistent icon coloring
 */
export function getPrimaryToneSequence(): string[] {
  return [
    PRIMARY_TONES.light,
    PRIMARY_TONES.dark,
    PRIMARY_TONES.saturated,
    PRIMARY_TONES.desaturated,
    PRIMARY_TONES.warm,
    PRIMARY_TONES.cool,
    PRIMARY_TONES.muted,
    PRIMARY_TONES.neutral,
  ];
}

// Legacy function names for backward compatibility
export const getEarthyColors = getPrimaryTones;
export const getEarthyColor = getPrimaryTone;
export const getRandomEarthyColor = getRandomPrimaryTone;
export const getEarthyColorSequence = getPrimaryToneSequence;
