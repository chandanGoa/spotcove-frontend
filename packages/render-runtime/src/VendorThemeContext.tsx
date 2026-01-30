/**
 * VendorThemeContext - Render Runtime Version
 * 
 * ⚠️ FROZEN FILE - DO NOT MODIFY WITHOUT CONTRACT CHANGE ⚠️
 * See: RENDER_RUNTIME_CONTRACT.md
 * 
 * STRICT RULES:
 * - NO API calls
 * - NO data fetching
 * - NO database access
 * - ONLY accepts theme and layout data as props
 * 
 * This file successfully applied theme in __render_test__/
 * Any changes MUST preserve this capability
 */
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeSettings = {
  colors?: {
    primary?: string;
    background?: string;
    foreground?: string;
    accent?: string;
    secondary?: string;
    muted?: string;
    card?: string;
    border?: string;
    [key: string]: any;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  [key: string]: any;
};

export type LayoutStructure = {
  zones?: any[];
  elements?: any[];
};

type VendorThemeContextType = {
  currentThemeSettings: ThemeSettings;
  currentLayout: LayoutStructure | null;
  vendorSlug: string;
};

const VendorThemeContext = createContext<VendorThemeContextType | undefined>(
  undefined
);

export function useVendorTheme() {
  const ctx = useContext(VendorThemeContext);
  if (!ctx)
    throw new Error("useVendorTheme must be used within VendorThemeProvider");
  return ctx;
}

interface VendorThemeProviderProps {
  children: React.ReactNode;
  themeSettings: ThemeSettings;
  layout?: LayoutStructure | null;
  vendorSlug?: string;
}

export default function VendorThemeProvider({
  children,
  themeSettings,
  layout = null,
  vendorSlug = "runtime",
}: VendorThemeProviderProps) {
  const [currentThemeSettings] = useState<ThemeSettings>(themeSettings);
  const [currentLayout] = useState<LayoutStructure | null>(layout);

  // Apply theme to CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;

    if (currentThemeSettings?.colors) {
      Object.entries(currentThemeSettings.colors).forEach(([key, value]) => {
        if (value && typeof value === "string") {
          // Convert hex to HSL if needed
          const hslValue = value.startsWith("#")
            ? hexToHSL(value as string)
            : value;
          root.style.setProperty(`--${key}`, hslValue);
        }
      });
    }

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

    if (currentThemeSettings?.fonts) {
      Object.entries(currentThemeSettings.fonts).forEach(([key, value]) => {
        if (value && typeof value === "string") {
          root.style.setProperty(`--font-${key}`, value);
        }
      });
    }
  }, [currentThemeSettings, vendorSlug]);

  // Helper function to convert hex to HSL
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

  const value: VendorThemeContextType = {
    currentThemeSettings,
    currentLayout,
    vendorSlug,
  };

  return (
    <VendorThemeContext.Provider value={value}>
      {children}
    </VendorThemeContext.Provider>
  );
}
