/**
 * Vendor Keyword Client Component
 */
"use client";

import { useMemo } from "react";
import {
  VendorLayoutRenderer,
  VendorThemeProvider,
} from "@spotcove/render-runtime";

interface VendorPublicPayload {
  layoutJSON?: any;
  themeJSON?: any;
  contentJSON?: Record<string, any>;
  products?: any[];
  collections?: any[];
  error?: string;
}

interface VendorKeywordClientProps {
  vendorSlug: string;
  keyword?: string;
  initialData?: VendorPublicPayload | null;
}

export default function VendorKeywordClient({
  vendorSlug,
  keyword = "home",
  initialData = null,
}: VendorKeywordClientProps) {
  const layoutJson = initialData?.layoutJSON;
  const themeJson = initialData?.themeJSON;
  const contentJSON = initialData?.contentJSON ?? {};
  const products = initialData?.products ?? [];
  const collections = initialData?.collections ?? [];

  const componentData = useMemo(() => {
    const data: Record<string, any> = {};

    if (!layoutJson?.elements) {
      return data;
    }

    layoutJson.elements.forEach((element: any) => {
      if (element.components) {
        element.components.forEach((component: any) => {
          if (
            component.type === "product-grid" ||
            component.type === "featured-products"
          ) {
            data[component.id] = {
              products,
            };
          }

          if (component.type === "collections") {
            data[component.id] = {
              collections,
            };
          }
        });
      }
    });

    return data;
  }, [collections, layoutJson, products]);

  if (!layoutJson || !themeJson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Vendor data is incomplete.</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      <div className="bg-primary text-primary-foreground px-4 py-3 text-center text-sm font-medium">
        <div className="container mx-auto">
          Vendor: {vendorSlug} / {keyword}
        </div>
      </div>

      <VendorThemeProvider
        themeSettings={themeJson}
        layout={layoutJson}
        vendorSlug={vendorSlug}
      >
        <VendorLayoutRenderer
          componentData={componentData}
          componentContent={contentJSON}
        />
      </VendorThemeProvider>
    </div>
  );
}
