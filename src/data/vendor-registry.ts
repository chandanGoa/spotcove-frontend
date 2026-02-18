/**
 * Vendor Layout Registry
 *
 * Maps vendor slug + keyword to layout/theme JSON.
 */

import minimalLayout from "@/data/demo-layouts/minimal.json";
import fashionLayout from "@/data/demo-layouts/fashion.json";
import marketplaceLayout from "@/data/demo-layouts/marketplace.json";
import minimalTheme from "@/data/demo-themes/minimal.json";
import fashionTheme from "@/data/demo-themes/fashion.json";
import marketplaceTheme from "@/data/demo-themes/marketplace.json";

export type PackageTier = "free" | "basic" | "premium" | "enterprise";

export interface VendorLayoutEntry {
  name: string;
  layoutJsonPath: string;
  themeJsonPath: string;
  layoutJson: unknown;
  themeJson: unknown;
  packageTier: PackageTier;
  description?: string;
}

export const VENDOR_REGISTRY: Record<
  string,
  Record<string, VendorLayoutEntry>
> = {
  acme: {
    landing: {
      name: "Acme Landing Layout",
      layoutJsonPath: "demo-layouts/minimal.json",
      themeJsonPath: "demo-themes/minimal.json",
      layoutJson: minimalLayout,
      themeJson: minimalTheme,
      packageTier: "basic",
      description: "Acme trial storefront landing page",
    },
  },

  beta: {
    landing: {
      name: "Beta Landing Layout",
      layoutJsonPath: "demo-layouts/fashion.json",
      themeJsonPath: "demo-themes/fashion.json",
      layoutJson: fashionLayout,
      themeJson: fashionTheme,
      packageTier: "basic",
      description: "Beta trial storefront landing page",
    },
  },

  procorp: {
    landing: {
      name: "Procorp Landing Layout",
      layoutJsonPath: "demo-layouts/marketplace.json",
      themeJsonPath: "demo-themes/marketplace.json",
      layoutJson: marketplaceLayout,
      themeJson: marketplaceTheme,
      packageTier: "premium",
      description: "Procorp paid storefront landing page",
    },
  },

  electronics: {
    minimal: {
      name: "Minimal Electronics Layout",
      layoutJsonPath: "demo-layouts/minimal.json",
      themeJsonPath: "demo-themes/minimal.json",
      layoutJson: minimalLayout,
      themeJson: minimalTheme,
      packageTier: "free",
      description: "Clean minimal layout for electronics store",
    },
    marketplace: {
      name: "Electronics Marketplace",
      layoutJsonPath: "demo-layouts/marketplace.json",
      themeJsonPath: "demo-themes/marketplace.json",
      layoutJson: marketplaceLayout,
      themeJson: marketplaceTheme,
      packageTier: "premium",
      description: "Full marketplace layout for electronics",
    },
  },

  fashion: {
    minimal: {
      name: "Minimal Fashion Layout",
      layoutJsonPath: "demo-layouts/minimal.json",
      themeJsonPath: "demo-themes/minimal.json",
      layoutJson: minimalLayout,
      themeJson: minimalTheme,
      packageTier: "free",
      description: "Clean minimal layout for fashion store",
    },
    fashion: {
      name: "Fashion Store Layout",
      layoutJsonPath: "demo-layouts/fashion.json",
      themeJsonPath: "demo-themes/fashion.json",
      layoutJson: fashionLayout,
      themeJson: fashionTheme,
      packageTier: "basic",
      description: "Fashion-focused layout with warm colors",
    },
  },
};

export function getVendorLayoutConfig(
  vendorSlug: string,
  keyword: string,
): VendorLayoutEntry | undefined {
  return VENDOR_REGISTRY[vendorSlug]?.[keyword];
}
