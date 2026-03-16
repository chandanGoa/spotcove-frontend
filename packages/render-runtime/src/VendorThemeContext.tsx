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

import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";

// useLayoutEffect fires synchronously before paint → no FOUC on client navigation.
// On the server useLayoutEffect doesn't exist; fall back to useEffect (no-op on server).
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
  undefined,
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
  // Use the prop directly so CSS vars always reflect the latest theme,
  // not just the initial value frozen by useState.
  const currentThemeSettings = themeSettings;
  const [currentLayout] = useState<LayoutStructure | null>(layout);

  // Apply theme CSS variables and load fonts whenever theme changes.
  // useIsomorphicLayoutEffect (→ useLayoutEffect in the browser) fires synchronously
  // after DOM commit but BEFORE the browser paints, so CSS custom properties are
  // always correct on the first painted frame — even on client-side navigations
  // where the inline SSR <script> does not re-run.
  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;

    // --- Batch all DOM READS before any DOM WRITES to avoid forced reflow ---

    // Read existing spacing tokens before writing anything
    const spacingTokens: Record<string, string> = {
      "--space-section": "3rem",
      "--space-container": "1.25rem",
      "--space-gap": "1.5rem",
    };
    const spacingToSet: [string, string][] = Object.entries(
      spacingTokens,
    ).filter(([token]) => !root.style.getPropertyValue(token));

    // Pre-check which font links already exist before any DOM mutations
    const isBare = (v: string) =>
      typeof v === "string" && !v.includes(",") && !v.includes("(");

    // Metric-override fallback font names (must match @font-face definitions in page SSR <style>)
    const METRIC_FALLBACK: Record<string, string> = {
      inter: "Inter Fallback",
      "playfair display": "Playfair Display Fallback",
      nunito: "Nunito Fallback",
      poppins: "Poppins Fallback",
    };

    /** Insert the metric-override variant as second item in a font-family stack. */
    const withFallback = (fontFamily: string): string => {
      const parts = fontFamily.split(",");
      if (!parts.length) return fontFamily;
      const primaryFont = parts[0].trim().replace(/['"]/g, "");
      const fb = METRIC_FALLBACK[primaryFont.toLowerCase()];
      if (!fb || fontFamily.includes(fb)) return fontFamily;
      return [parts[0], ` '${fb}'`, ...parts.slice(1)].join(",");
    };

    const toStack = (name: string) => {
      const clean = name.replace(/'/g, "").trim();
      const fb = METRIC_FALLBACK[clean.toLowerCase()];
      const fbPart = fb ? `, '${fb}'` : "";
      return `'${clean}'${fbPart}, system-ui, -apple-system, sans-serif`;
    };

    const toGoogleUrl = (name: string) =>
      `https://fonts.googleapis.com/css2?family=${name.trim().replace(/ /g, "+")}:wght@400;500;600;700;800&display=swap`;

    let allFontUrls: string[] = [];
    let resolvedHeading: string | undefined;
    let resolvedBody: string | undefined;
    let fontFaceEl: HTMLStyleElement | null = null;
    let fontFaces: string[] | undefined;

    if (currentThemeSettings?.fonts) {
      const fonts = currentThemeSettings.fonts as any;
      const { heading, body, fontUrls } = fonts;
      fontFaces = fonts.fontFaces;

      resolvedHeading =
        heading && isBare(heading) ? toStack(heading) : withFallback(heading);
      resolvedBody = body && isBare(body) ? toStack(body) : withFallback(body);

      allFontUrls = Array.isArray(fontUrls) ? [...fontUrls] : [];
      if (heading && isBare(heading)) {
        const u = toGoogleUrl(heading.replace(/['"]/g, "").trim());
        if (!allFontUrls.includes(u)) allFontUrls.push(u);
      }
      if (body && isBare(body) && body !== heading) {
        const u = toGoogleUrl(body.replace(/['"]/g, "").trim());
        if (!allFontUrls.includes(u)) allFontUrls.push(u);
      }
    }

    // Read font-face element and existing font links (all reads before writes)
    const fontFaceElId = `vendor-font-faces-${vendorSlug}`;
    fontFaceEl = document.getElementById(
      fontFaceElId,
    ) as HTMLStyleElement | null;
    const missingFontUrls = allFontUrls.filter((url) => {
      const id = `vendor-font-${btoa(url).replace(/[^a-zA-Z0-9]/g, "")}`;
      return !document.getElementById(id);
    });

    // --- DOM WRITES start here ---

    if (currentThemeSettings?.colors) {
      Object.entries(currentThemeSettings.colors).forEach(([key, value]) => {
        if (value && typeof value === "string") {
          const hslValue = value.startsWith("#")
            ? hexToHSL(value as string)
            : value;
          root.style.setProperty(`--${key}`, hslValue);
        }
      });
    }

    spacingToSet.forEach(([token, fallback]) => {
      root.style.setProperty(token, fallback);
    });

    if (resolvedHeading)
      root.style.setProperty("--font-heading", resolvedHeading);
    if (resolvedBody) root.style.setProperty("--font-body", resolvedBody);

    if (Array.isArray(fontFaces) && fontFaces.length > 0) {
      if (!fontFaceEl) {
        fontFaceEl = document.createElement("style");
        fontFaceEl.id = fontFaceElId;
        document.head.appendChild(fontFaceEl);
      }
      fontFaceEl.textContent = fontFaces.join("\n");
    }

    missingFontUrls.forEach((url: string) => {
      const id = `vendor-font-${btoa(url).replace(/[^a-zA-Z0-9]/g, "")}`;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);
    });
  }, [currentThemeSettings, vendorSlug]);
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
