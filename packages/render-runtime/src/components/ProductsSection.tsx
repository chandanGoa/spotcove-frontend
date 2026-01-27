/**
 * ProductsSection - Presentation Component (Tier 2 Refactored)
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

export interface ProductData {
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

export interface ProductsSectionSettings {
  columns?: number;
  title?: string;
  showRating?: boolean;
  showBadge?: boolean;
  showDescription?: boolean;
  maxWidth?: number | string;
  paddingY?: number | string;
  gap?: number | string;
  containerPadding?: number | string;
  align?: "left" | "center" | "right";
  subtype?: "products-featured" | "products-grid" | "products-carousel";
  className?: string;
}

export interface ProductsSectionProps {
  settings?: ProductsSectionSettings;
  themeOverride?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
  products: ProductData[];
  onProductClick?: (product: ProductData) => void;
}

const toCssValue = (value?: number | string) =>
  typeof value === "number" ? `${value}px` : value;

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  settings = {},
  themeOverride,
  className,
  style,
  products = [],
  onProductClick,
}) => {
  const {
    subtype,
    columns = 4,
    title = "Products",
    maxWidth,
    paddingY,
    gap,
    containerPadding,
    align = "center",
    showRating = true,
    showBadge = true,
    showDescription = true,
  } = settings;

  const isFeatured = subtype === "products-featured";
  const isCarousel = subtype === "products-carousel";
  const isGrid = subtype === "products-grid" || !subtype;

  const displayColumns = isFeatured ? Math.min(columns, 2) : columns;
  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);

  const getGridClasses = () => {
    if (isCarousel) {
      return "flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4";
    }
    if (isFeatured) {
      return "grid-cols-1 sm:grid-cols-2";
    }
    const colMap: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
      6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
    };
    return colMap[Math.min(Math.max(displayColumns, 1), 6)] || colMap[4];
  };

  const gridClasses = getGridClasses();
  const gridCols = isCarousel ? "" : gridClasses;

  const handleProductClick = (product: ProductData) => {
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
        maxWidth: maxWidth ? toCssValue(maxWidth) : undefined,
        marginLeft: "auto",
        marginRight: "auto",
        paddingTop: toCssValue(paddingY ?? 32),
        paddingBottom: toCssValue(paddingY ?? 32),
        paddingLeft: toCssValue(containerPadding ?? 0),
        paddingRight: toCssValue(containerPadding ?? 0),
      }}
    >
      <h2
        className={cn("font-bold", {
          "text-left": align === "left",
          "text-center": align === "center",
          "text-right": align === "right",
        })}
        style={{
          fontSize: "var(--text-2xl, 1.5rem)",
          fontFamily: "var(--font-heading, inherit)",
          marginBottom: "var(--spacing-md, 1rem)",
        }}
      >
        {title}
      </h2>

      {isFeatured && (
        <div
          className={`grid ${gridCols}`}
          style={{ gap: toCssValue(gap ?? "var(--spacing-lg, 1.5rem)") }}
        >
          {products.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleProductClick(product)}
              style={{
                background: "var(--cards-background, hsl(var(--card)))",
                borderRadius:
                  "var(--cards-border-radius, var(--radius-lg, 0.5rem))",
                border: "var(--cards-border, 1px solid hsl(var(--border)))",
                boxShadow:
                  "var(--cards-box-shadow, 0 1px 3px rgba(0, 0, 0, 0.1))",
              }}
            >
              <CardContent className="p-0">
                {product.image && (
                  <div className="aspect-video relative">
                    <img
                      src={product.image.src}
                      alt={product.image.alt || product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div style={{ padding: "var(--cards-padding, 1.5rem)" }}>
                  <h3
                    className="font-semibold"
                    style={{
                      fontSize: "var(--text-xl, 1.25rem)",
                      fontFamily: "var(--font-heading, inherit)",
                      marginBottom: "var(--spacing-sm, 0.5rem)",
                    }}
                  >
                    {product.name}
                  </h3>
                  {showDescription && product.description && (
                    <p
                      className="text-muted-foreground"
                      style={{
                        fontSize: "var(--text-base, 1rem)",
                        fontFamily: "var(--font-body, inherit)",
                        marginBottom: "var(--spacing-md, 1rem)",
                      }}
                    >
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="font-bold"
                      style={{ fontSize: "var(--text-xl, 1.25rem)" }}
                    >
                      ${product.price}
                    </span>
                    {showRating && product.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span style={{ fontSize: "var(--text-sm, 0.875rem)" }}>
                          {product.rating}
                        </span>
                      </div>
                    )}
                  </div>
                  {showBadge && product.badge && (
                    <Badge variant="secondary" className="mb-4">
                      {product.badge}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter
                className="pt-0"
                style={{ padding: "var(--cards-padding, 1.5rem)" }}
              >
                <Button className="w-full">View Details</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {isCarousel && (
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-64 snap-center cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              <Card className="overflow-hidden h-full">
                <CardContent className="p-0">
                  {product.image && (
                    <div className="aspect-square relative">
                      <img
                        src={product.image.src}
                        alt={product.image.alt || product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div style={{ padding: "var(--cards-padding, 1rem)" }}>
                    <h3
                      className="font-semibold line-clamp-2"
                      style={{
                        fontSize: "var(--text-lg, 1.125rem)",
                        fontFamily: "var(--font-heading, inherit)",
                        marginBottom: "var(--spacing-xs, 0.25rem)",
                      }}
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span
                        className="font-bold"
                        style={{ fontSize: "var(--text-lg, 1.125rem)" }}
                      >
                        ${product.price}
                      </span>
                      {showRating && product.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span style={{ fontSize: "var(--text-xs, 0.75rem)" }}>
                            {product.rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter
                  className="pt-0"
                  style={{ padding: "var(--cards-padding, 1rem)" }}
                >
                  <Button className="w-full text-sm">View</Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      )}

      {isGrid && (
        <div
          className={`grid ${gridCols}`}
          style={{ gap: toCssValue(gap ?? "var(--spacing-lg, 1.5rem)") }}
        >
          {products.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleProductClick(product)}
            >
              <CardContent className="p-0">
                {product.image && (
                  <div className="aspect-square relative">
                    <img
                      src={product.image.src}
                      alt={product.image.alt || product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div style={{ padding: "var(--cards-padding, 1rem)" }}>
                  <h3
                    className="font-semibold"
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
                  <div className="flex items-center justify-between">
                    <span
                      className="font-bold"
                      style={{ fontSize: "var(--text-lg, 1.125rem)" }}
                    >
                      ${product.price}
                    </span>
                    {showRating && product.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span style={{ fontSize: "var(--text-sm, 0.875rem)" }}>
                          {product.rating}
                        </span>
                      </div>
                    )}
                  </div>
                  {showBadge && product.badge && (
                    <Badge
                      variant="secondary"
                      style={{ marginTop: "var(--spacing-sm, 0.5rem)" }}
                    >
                      {product.badge}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter
                className="pt-0"
                style={{ padding: "var(--cards-padding, 1rem)" }}
              >
                <Button className="w-full">View Product</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

ProductsSection.displayName = "ProductsSection";

export default React.memo(ProductsSection);
