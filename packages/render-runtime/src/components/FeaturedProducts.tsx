/**
 * FeaturedProducts - Presentation Component (Tier 2 Refactored)
 * 
 * NO data fetching - accepts all data via props
 * NO useEffect, NO Supabase, NO API calls
 * Pure presentation logic only
 */
"use client";

import React from "react";
import { cn } from "../utils";
import { getThemeOverrideStyles } from "../theme-wrapper";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Star } from "lucide-react";

export interface FeaturedProductData {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  slug: string;
  rating?: number;
  badge?: string;
  image?: {
    src: string;
    alt: string;
  };
}

export interface FeaturedProductsSettings {
  title?: string;
  columns?: number;
  showRating?: boolean;
  showBadge?: boolean;
  showDescription?: boolean;
  maxWidth?: number | string;
  align?: "left" | "center" | "right";
  paddingY?: number | string;
  gap?: number | string;
  containerPadding?: number | string;
  className?: string;
}

export interface FeaturedProductsProps {
  settings?: FeaturedProductsSettings;
  themeOverride?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
  products: FeaturedProductData[];
  onProductClick?: (product: FeaturedProductData) => void;
}

const toCssValue = (value?: number | string) =>
  typeof value === "number" ? `${value}px` : value;

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  settings = {},
  themeOverride,
  className,
  style,
  products = [],
  onProductClick,
}) => {
  const {
    title = "Featured Products",
    columns = 4,
    showRating = true,
    showBadge = true,
    showDescription = true,
    maxWidth,
    align = "left",
    paddingY,
    gap,
    containerPadding,
  } = settings;

  const gridCols: Record<number, string> = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  };

  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);

  const handleProductClick = (product: FeaturedProductData) => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  return (
    <section
      className={cn(settings.className, className)}
      style={{
        ...themeOverrideStyles,
        ...style,
        paddingTop: toCssValue(paddingY ?? 48),
        paddingBottom: toCssValue(paddingY ?? 48),
        maxWidth: maxWidth ? toCssValue(maxWidth) : undefined,
        marginLeft: "auto",
        marginRight: "auto",
        paddingLeft: toCssValue(containerPadding ?? 16),
        paddingRight: toCssValue(containerPadding ?? 16),
      }}
    >
      <div
        className={cn({
          "text-left": align === "left",
          "text-center": align === "center",
          "text-right": align === "right",
        })}
      >
        <h2
          className="font-bold text-foreground"
          style={{
            fontSize: "var(--text-3xl, 1.875rem)",
            fontFamily: "var(--font-heading, inherit)",
            marginBottom: "var(--spacing-xl, 2rem)",
          }}
        >
          {title}
        </h2>
        <div
          className={`grid ${gridCols[columns] || gridCols[4]}`}
          style={{ gap: toCssValue(gap ?? "var(--spacing-lg, 1.5rem)") }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="cursor-pointer"
            >
              <Card className="group hover:shadow-lg transition-shadow duration-200">
                <div className="relative aspect-square overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image.src}
                      alt={product.image.alt || product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  {showBadge && product.badge && (
                    <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
                      {product.badge}
                    </Badge>
                  )}
                </div>
                <CardContent
                  style={{
                    padding: "var(--cards-padding, 1rem)",
                  }}
                >
                  <h3
                    className="font-semibold text-card-foreground line-clamp-1"
                    style={{
                      fontSize: "var(--text-lg, 1.125rem)",
                      fontFamily: "var(--font-heading, inherit)",
                      marginBottom: "var(--spacing-xs, 0.25rem)",
                    }}
                  >
                    {product.name}
                  </h3>
                  {showDescription && product.description && (
                    <p
                      className="text-muted-foreground line-clamp-2"
                      style={{
                        fontSize: "var(--text-sm, 0.875rem)",
                        fontFamily: "var(--font-body, inherit)",
                        marginBottom: "var(--spacing-sm, 0.5rem)",
                      }}
                    >
                      {product.description}
                    </p>
                  )}
                  {showRating && product.rating && (
                    <div
                      className="flex items-center gap-1"
                      style={{ marginBottom: "var(--spacing-sm, 0.5rem)" }}
                    >
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span
                        className="font-medium"
                        style={{ fontSize: "var(--text-sm, 0.875rem)" }}
                      >
                        {product.rating}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span
                      className="font-bold"
                      style={{
                        fontSize: "var(--text-lg, 1.125rem)",
                        color: "hsl(var(--primary))",
                      }}
                    >
                      ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
                    </span>
                  </div>
                </CardContent>
                <CardFooter
                  className="pt-0"
                  style={{
                    padding: "var(--cards-padding, 1rem)",
                  }}
                >
                  <Button className="w-full">View Details</Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

FeaturedProducts.displayName = "FeaturedProducts";

export default React.memo(FeaturedProducts);
