/**
 * Vendor Layout Registry
 * 
 * Maps vendor slug + keyword to layout/theme JSON paths
 */

export type PackageTier = "free" | "basic" | "premium" | "enterprise";

export interface VendorLayoutEntry {
  name: string;
  layoutJsonPath: string;
  themeJsonPath: string;
  packageTier: PackageTier;
  description?: string;
}

export const VENDOR_REGISTRY: Record<string, Record<string, VendorLayoutEntry>> = {
  electronics: {
    minimal: {
      name: "Minimal Electronics Layout",
      layoutJsonPath: "demo-layouts/minimal.json",
      themeJsonPath: "demo-themes/minimal.json",
      packageTier: "free",
      description: "Clean minimal layout for electronics store"
    },
    marketplace: {
      name: "Electronics Marketplace",
      layoutJsonPath: "demo-layouts/marketplace.json",
      themeJsonPath: "demo-themes/marketplace.json",
      packageTier: "premium",
      description: "Full marketplace layout for electronics"
    }
  },
  
  fashion: {
    minimal: {
      name: "Minimal Fashion Layout",
      layoutJsonPath: "demo-layouts/minimal.json",
      themeJsonPath: "demo-themes/minimal.json",
      packageTier: "free",
      description: "Clean minimal layout for fashion store"
    },
    fashion: {
      name: "Fashion Store Layout",
      layoutJsonPath: "demo-layouts/fashion.json",
      themeJsonPath: "demo-themes/fashion.json",
      packageTier: "basic",
      description: "Fashion-focused layout with warm colors"
    }
  }
};

export function getVendorLayoutConfig(
  vendorSlug: string,
  keyword: string
): VendorLayoutEntry | undefined {
  return VENDOR_REGISTRY[vendorSlug]?.[keyword];
}
