/**
 * @spotcove/render-runtime
 * 
 * ⚠️ FROZEN PUBLIC API - DO NOT MODIFY WITHOUT CONTRACT CHANGE ⚠️
 * See: RENDER_RUNTIME_CONTRACT.md
 * 
 * Public API for rendering SpotCove layouts and themes
 * WITHOUT access to core application
 * 
 * This is a standalone package that can render layout.json + theme.json
 * in any React environment
 * 
 * VERIFIED WORKING: Successfully rendered in __render_test__/ with:
 * - Hero section with theme colors
 * - Products grid (3 items)
 * - Newsletter form
 * - Complete CSS variable theme application
 * 
 * Any changes to renderLayout() signature MUST maintain backward compatibility
 */

import React from "react";
import ReactDOM from "react-dom/client";
import VendorLayoutRenderer from "./VendorLayoutRenderer";
import VendorThemeProvider, { ThemeSettings, LayoutStructure } from "./VendorThemeContext";
import { applyThemeToRoot } from "./theme-wrapper";

export interface RenderLayoutOptions {
  /**
   * Target DOM element to render into
   */
  target: HTMLElement;

  /**
   * Layout JSON structure
   */
  layout: LayoutStructure;

  /**
   * Theme settings (colors, fonts, etc.)
   */
  theme: ThemeSettings;

  /**
   * Component data to inject
   * Maps component IDs to their data
   * 
   * Example:
   * {
   *   "products-section-1": {
   *     products: [...productData]
   *   },
   *   "collections-grid-1": {
   *     collections: [...collectionData]
   *   }
   * }
   */
  componentData?: Record<string, any>;

  /**
   * Optional vendor slug for debugging
   */
  vendorSlug?: string;

  /**
   * Optional children to render inside default layout
   */
  children?: React.ReactNode;
}

/**
 * Main public API: Render a layout with theme
 * 
 * Usage:
 * ```typescript
 * import { renderLayout } from '@spotcove/render-runtime';
 * 
 * renderLayout({
 *   target: document.getElementById('app'),
 *   layout: layoutJSON,
 *   theme: themeSettings,
 *   componentData: {
 *     'products-1': { products: [...] }
 *   }
 * });
 * ```
 */
export function renderLayout(options: RenderLayoutOptions): ReactDOM.Root {
  const {
    target,
    layout,
    theme,
    componentData = {},
    vendorSlug = "runtime",
    children,
  } = options;

  // Apply theme to document root
  applyThemeToRoot(document.documentElement, theme);

  // Create React root and render
  const root = ReactDOM.createRoot(target);
  
  root.render(
    <VendorThemeProvider
      themeSettings={theme}
      layout={layout}
      vendorSlug={vendorSlug}
    >
      <VendorLayoutRenderer componentData={componentData}>
        {children}
      </VendorLayoutRenderer>
    </VendorThemeProvider>
  );

  return root;
}

// Re-export core types and components for advanced usage
export { VendorLayoutRenderer, VendorThemeProvider };
export type { ThemeSettings, LayoutStructure };

// Re-export components for custom usage
export { HeroSection } from "./components/HeroSection";
export { NewsletterSection } from "./components/NewsletterSection";
export { Content } from "./components/Content";
export { default as ProductsSection } from "./components/ProductsSection";
export { default as CollectionsGrid } from "./components/CollectionsGrid";
export { default as FeaturedProducts } from "./components/FeaturedProducts";
export { default as SimpleNavbar } from "./components/SimpleNavbar";
export { default as MainFooter } from "./components/MainFooter";

// Re-export types
export type { ProductData } from "./components/ProductsSection";
export type { CollectionData } from "./components/CollectionsGrid";
export type { FeaturedProductData } from "./components/FeaturedProducts";

// Re-export utilities
export { cn } from "./utils";
export { getThemeOverrideStyles, applyThemeToRoot } from "./theme-wrapper";
