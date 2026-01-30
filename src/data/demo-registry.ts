/**
 * Demo Registry
 * 
 * Maps demo keywords to layout/theme JSON paths for public demo pages.
 */

export type PackageTier = "free" | "basic" | "premium" | "enterprise";

export interface DemoRegistryEntry {
  name: string;
  layoutJsonPath: string;
  themeJsonPath: string;
  packageTier: PackageTier;
  description?: string;
}

export const DEMO_REGISTRY: Record<string, DemoRegistryEntry> = {
  minimal: {
    name: "Minimal Store",
    layoutJsonPath: "demo-layouts/minimal.json",
    themeJsonPath: "demo-themes/minimal.json",
    packageTier: "free",
    description: "Simple, clean minimal layout with monochrome theme"
  },
  
  fashion: {
    name: "Fashion Store",
    layoutJsonPath: "demo-layouts/fashion.json",
    themeJsonPath: "demo-themes/fashion.json",
    packageTier: "basic",
    description: "Fashion-focused layout with warm autumn colors"
  },
  
  marketplace: {
    name: "Marketplace",
    layoutJsonPath: "demo-layouts/marketplace.json",
    themeJsonPath: "demo-themes/marketplace.json",
    packageTier: "premium",
    description: "Multi-vendor marketplace layout with blue theme"
  }
};

export function getDemoConfig(keyword: string): DemoRegistryEntry | undefined {
  return DEMO_REGISTRY[keyword];
}

export function getAllDemoKeywords(): string[] {
  return Object.keys(DEMO_REGISTRY);
}
