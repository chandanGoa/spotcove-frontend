/**
 * Theme wrapper utilities for render runtime
 * 
 * ⚠️ FROZEN FILE - DO NOT MODIFY WITHOUT CONTRACT CHANGE ⚠️
 * See: RENDER_RUNTIME_CONTRACT.md
 * 
 * Pure functions for theme application
 * 
 * STRICT RULES:
 * - NO external dependencies beyond utilities
 * - NO API calls
 * - NO side effects except DOM style updates
 * - MUST preserve HSL color format
 * - MUST preserve CSS variable injection pattern
 * 
 * This file successfully applied theme colors in __render_test__/
 */

export interface ThemeOverride {
  colors?: Record<string, string>;
  fonts?: Record<string, string>;
}

/**
 * Utility to apply theme override as scoped CSS variables
 * Pure function - no dependencies on core
 */
export function getThemeOverrideStyles(themeOverride?: ThemeOverride): React.CSSProperties {
  const styles: React.CSSProperties = {};
  
  if (themeOverride?.colors) {
    Object.entries(themeOverride.colors).forEach(([key, value]) => {
      if (value) {
        (styles as any)[`--${key}`] = value;
      }
    });
  }
  
  if (themeOverride?.fonts) {
    Object.entries(themeOverride.fonts).forEach(([key, value]) => {
      if (value) {
        (styles as any)[`--font-${key}`] = value;
      }
    });
  }
  
  return styles;
}

/**
 * Apply theme settings to DOM root
 * Used by renderLayout API
 */
export function applyThemeToRoot(
  root: HTMLElement,
  themeSettings?: {
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
  }
): void {
  if (!themeSettings) return;

  // Apply colors
  if (themeSettings.colors) {
    Object.entries(themeSettings.colors).forEach(([key, value]) => {
      if (value && typeof value === "string") {
        // Convert hex to HSL if needed
        const hslValue = value.startsWith("#")
          ? hexToHSL(value)
          : value;
        root.style.setProperty(`--${key}`, hslValue);
      }
    });
  }

  // Apply spacing tokens
  const spacingTokens: Record<string, string> = {
    "--space-section": "3rem",
    "--space-container": "1.25rem",
    "--space-gap": "1.5rem",
  };

  Object.entries(spacingTokens).forEach(([token, fallback]) => {
    if (!root.style.getPropertyValue(token)) {
      root.style.setProperty(token, fallback);
    }
  });

  // Apply fonts
  if (themeSettings.fonts) {
    Object.entries(themeSettings.fonts).forEach(([key, value]) => {
      if (value && typeof value === "string") {
        root.style.setProperty(`--font-${key}`, value);
      }
    });
  }
}

/**
 * Helper function to convert hex to HSL
 */
function hexToHSL(hex: string): string {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  return `${h} ${s}% ${lPercent}%`;
}
