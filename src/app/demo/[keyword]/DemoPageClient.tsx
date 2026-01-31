/**
 * Demo Page Client Component
 * 
 * Uses render-runtime VendorThemeProvider with correct props
 */
"use client";

import { useEffect } from "react";
import { VendorThemeProvider, VendorLayoutRenderer } from "@spotcove/render-runtime";
import { DemoRegistryEntry } from "@/data/demo-registry";
import demoProducts from "@/data/demo-products.json";
import demoCollections from "@/data/demo-collections.json";

interface DemoPageClientProps {
  keyword: string;
  demoConfig: DemoRegistryEntry;
  layoutJson: any;
  themeJson: any;
}

export default function DemoPageClient({
  keyword,
  demoConfig,
  layoutJson,
  themeJson,
}: DemoPageClientProps) {
  
  useEffect(() => {
    console.log(`[Demo: ${keyword}] Package Tier: ${demoConfig.packageTier}`);
  }, [keyword, demoConfig.packageTier]);
  
  // Prepare component data
  const componentData: Record<string, any> = {};
  
  if (layoutJson?.elements) {
    layoutJson.elements.forEach((element: any) => {
      if (element.components) {
        element.components.forEach((component: any) => {
          if (component.type === "product-grid" || component.type === "featured-products") {
            componentData[component.id] = {
              products: demoProducts.map((p) => ({
                id: p.id,
                name: p.name,
                description: p.description,
                price: p.price,
                slug: p.slug,
                rating: p.rating,
                badge: p.badge,
                image: {
                  src: `/placeholder.jpg`,
                  alt: p.medias?.alt || p.name,
                },
              })),
            };
          }
          
          if (component.type === "collections") {
            componentData[component.id] = {
              collections: demoCollections.map((c) => ({
                id: c.id,
                label: c.label,
                slug: c.slug,
                image: {
                  src: `/placeholder.jpg`,
                  alt: c.medias?.alt || c.label,
                },
              })),
            };
          }
        });
      }
    });
  }
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="bg-primary text-primary-foreground px-4 py-3 text-center text-sm font-medium">
        <div className="container mx-auto">
          Demo: {demoConfig.name}
          {demoConfig.description && (
            <span className="ml-2 opacity-80">— {demoConfig.description}</span>
          )}
          <span className="ml-4 px-2 py-1 bg-white/20 rounded text-xs">
            {demoConfig.packageTier.toUpperCase()}
          </span>
        </div>
      </div>
      
      <VendorThemeProvider
        themeSettings={themeJson}
        layout={layoutJson}
        vendorSlug={`demo-${keyword}`}
      >
        <VendorLayoutRenderer componentData={componentData} />
      </VendorThemeProvider>
    </div>
  );
}
