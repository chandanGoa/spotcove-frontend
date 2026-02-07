/**
 * Vendor Keyword Client Component
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  VendorLayoutRenderer,
  VendorThemeProvider,
} from "@spotcove/render-runtime";
import { VendorLayoutEntry } from "@/data/vendor-registry";
import demoProducts from "@/data/demo-products.json";
import demoCollections from "@/data/demo-collections.json";

interface VendorKeywordClientProps {
  vendorSlug: string;
  keyword: string;
  layoutConfig: VendorLayoutEntry;
  layoutJson: unknown;
  themeJson: unknown;
}

export default function VendorKeywordClient({
  vendorSlug,
  keyword,
  layoutConfig,
  layoutJson,
  themeJson,
}: VendorKeywordClientProps) {
  const [resolvedLayout, setResolvedLayout] = useState<unknown>(layoutJson);
  const [resolvedTheme, setResolvedTheme] = useState<unknown>(themeJson);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const cacheKey = `vendor-layout:${vendorSlug}:${keyword}`;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.layoutJson && parsed?.themeJson) {
          setResolvedLayout(parsed.layoutJson);
          setResolvedTheme(parsed.themeJson);
        }
      }
    } catch (error) {
      console.warn("Failed to read vendor layout cache:", error);
    }

    const controller = new AbortController();

    const fetchLayout = async () => {
      try {
        const url = new URL("/api/vendor-layout", window.location.origin);
        url.searchParams.set("vendorSlug", vendorSlug);
        url.searchParams.set("keyword", keyword);

        const response = await fetch(url.toString(), {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`API response ${response.status}`);
        }

        const data = (await response.json()) as {
          layoutJson?: unknown;
          themeJson?: unknown;
        };

        if (data.layoutJson && data.themeJson) {
          setResolvedLayout(data.layoutJson);
          setResolvedTheme(data.themeJson);
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              layoutJson: data.layoutJson,
              themeJson: data.themeJson,
              fetchedAt: Date.now(),
            }),
          );
        } else {
          throw new Error("API returned empty layout or theme");
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setLoadError(error instanceof Error ? error.message : "Unknown error");
      }
    };

    fetchLayout();

    return () => controller.abort();
  }, [vendorSlug, keyword]);

  const componentData = useMemo(() => {
    const data: Record<string, any> = {};
    const layout = resolvedLayout as { elements?: any[] } | null;

    if (layout?.elements) {
      layout.elements.forEach((element: any) => {
        if (element.components) {
          element.components.forEach((component: any) => {
            if (
              component.type === "product-grid" ||
              component.type === "featured-products"
            ) {
              data[component.id] = {
                products: demoProducts.map((p) => ({
                  id: p.id,
                  name: p.name,
                  description: p.description,
                  price: p.price,
                  slug: p.slug,
                  rating: p.rating,
                  badge: p.badge,
                  image: {
                    src: "/placeholder.jpg",
                    alt: p.medias?.alt || p.name,
                  },
                })),
              };
            }

            if (component.type === "collections") {
              data[component.id] = {
                collections: demoCollections.map((c) => ({
                  id: c.id,
                  label: c.label,
                  slug: c.slug,
                  image: {
                    src: "/placeholder.jpg",
                    alt: c.medias?.alt || c.label,
                  },
                })),
              };
            }
          });
        }
      });
    }

    return data;
  }, [resolvedLayout]);

  if (!resolvedLayout || !resolvedTheme) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-2xl font-semibold mb-3">
            Loading vendor layout...
          </h1>
          <p className="text-muted-foreground">
            {loadError
              ? `Still waiting on data: ${loadError}`
              : "Fetching latest layout data."}
          </p>
        </div>
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
          Vendor: {vendorSlug} - {layoutConfig.name}
          <span className="ml-4 px-2 py-1 bg-white/20 rounded text-xs">
            {layoutConfig.packageTier.toUpperCase()}
          </span>
        </div>
      </div>

      <VendorThemeProvider
        themeSettings={resolvedTheme as any}
        layout={resolvedLayout as any}
        vendorSlug={vendorSlug}
      >
        <VendorLayoutRenderer componentData={componentData} />
      </VendorThemeProvider>
    </div>
  );
}
