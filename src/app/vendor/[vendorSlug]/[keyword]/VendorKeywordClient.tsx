/**
 * Vendor Keyword Client Component
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  VendorLayoutRenderer,
  VendorThemeProvider,
} from "@spotcove/render-runtime";

interface VendorKeywordClientProps {
  vendorSlug: string;
  keyword?: string;
}

interface VendorPublicPayload {
  layoutJSON?: any;
  themeJSON?: any;
  products?: any[];
  collections?: any[];
  error?: string;
}

export default function VendorKeywordClient({
  vendorSlug,
  keyword = "home",
}: VendorKeywordClientProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vendorData, setVendorData] = useState<VendorPublicPayload | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    const loadVendorData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/storefront/vendor/${vendorSlug}`,
        );

        console.log("Vendor API status:", res.status);

        if (!res.ok) {
          console.error("Vendor API fetch failed with status:", res.status);
          throw new Error(`Failed to load vendor data (${res.status})`);
        }

        const data: VendorPublicPayload = await res.json();
        console.log("Vendor API Response:", data);

        if (data.error) {
          throw new Error(data.error);
        }

        const responseLayout = data.layoutJSON;
        const responseTheme = data.themeJSON;
        const responseProducts = data.products ?? [];

        console.log("Vendor payload checks:", {
          hasLayoutJSON: Boolean(responseLayout),
          hasThemeJSON: Boolean(responseTheme),
          productsCount: Array.isArray(responseProducts)
            ? responseProducts.length
            : 0,
        });

        if (mounted) {
          setVendorData(data);
        }
      } catch (err) {
        console.error(
          "Vendor API fetch error:",
          err instanceof Error ? err.message : "Failed to load vendor data",
        );

        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load vendor data",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadVendorData();

    return () => {
      mounted = false;
    };
  }, [vendorSlug]);

  const layoutJson = vendorData?.layoutJSON;
  const themeJson = vendorData?.themeJSON;
  const products = vendorData?.products ?? [];
  const collections = vendorData?.collections ?? [];

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading vendor data...</p>
      </div>
    );
  }

  if (error || !layoutJson || !themeJson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">
          {error ?? "Vendor data is incomplete."}
        </p>
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
        <VendorLayoutRenderer componentData={componentData} />
      </VendorThemeProvider>
    </div>
  );
}
