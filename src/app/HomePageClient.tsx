"use client";

import {
  VendorLayoutRenderer,
  VendorThemeProvider,
} from "@spotcove/render-runtime";
import demoProducts from "@/data/demo-products.json";
import demoCollections from "@/data/demo-collections.json";

interface HomePageClientProps {
  layoutJson: any;
  themeJson: any;
}

export default function HomePageClient({
  layoutJson,
  themeJson,
}: HomePageClientProps) {
  const componentData: Record<string, any> = {};

  if (layoutJson?.elements) {
    layoutJson.elements.forEach((element: any) => {
      if (!element.components) {
        return;
      }

      element.components.forEach((component: any) => {
        if (component.type === "featured-services") {
          componentData[component.id] = {
            services: demoProducts.map((product) => ({
              id: product.id,
              name: product.name,
              description: product.description,
              price: product.price,
              slug: product.slug,
              rating: product.rating,
              badge: product.badge,
              image: {
                src: "/placeholder.jpg",
                alt: product.medias?.alt || product.name,
              },
            })),
          };
        }

        if (component.type === "categories-grid") {
          componentData[component.id] = {
            collections: demoCollections.map((collection) => ({
              id: collection.id,
              label: collection.label,
              slug: collection.slug,
              image: {
                src: "/placeholder.jpg",
                alt: collection.medias?.alt || collection.label,
              },
            })),
          };
        }
      });
    });
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      <VendorThemeProvider
        themeSettings={themeJson}
        layout={layoutJson}
        vendorSlug="public-homepage"
      >
        <VendorLayoutRenderer componentData={componentData} />
      </VendorThemeProvider>
    </div>
  );
}
