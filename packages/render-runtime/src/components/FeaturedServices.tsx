/**
 * FeaturedServices - Presentation Component
 *
 * NO data fetching - accepts all data via props
 */
"use client";

import React from "react";
import { cn } from "../utils";
import { getThemeOverrideStyles } from "../theme-wrapper";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Star } from "lucide-react";

export interface FeaturedServiceData {
  id: string;
  name: string;
  vendorName?: string;
  description?: string;
  price?: number | string;
  slug?: string;
  rating?: number;
  badge?: string;
  image?: {
    src: string;
    alt?: string;
  };
}

export interface FeaturedServicesSettings {
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
  services?: FeaturedServiceData[];
}

export interface FeaturedServicesProps {
  settings?: FeaturedServicesSettings;
  themeOverride?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
  services?: FeaturedServiceData[];
  onServiceClick?: (service: FeaturedServiceData) => void;
}

const toCssValue = (value?: number | string) =>
  typeof value === "number" ? `${value}px` : value;

export const FeaturedServices: React.FC<FeaturedServicesProps> = ({
  settings = {},
  themeOverride,
  className,
  style,
  services,
  onServiceClick,
}) => {
  const {
    title = "Featured Services",
    columns = 3,
    showRating = true,
    showBadge = true,
    showDescription = true,
    maxWidth,
    align = "center",
    paddingY,
    gap,
    containerPadding,
  } = settings;

  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);
  const resolvedPadding = toCssValue(paddingY ?? 96);
  const resolvedGap = toCssValue(gap ?? 24);
  const resolvedMaxWidth = toCssValue(maxWidth);
  const resolvedContainerPadding = toCssValue(containerPadding ?? 24);

  const gridCols: Record<number, string> = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const serviceList =
    services && services.length > 0 ? services : settings.services || [];

  const handleServiceClick = (service: FeaturedServiceData) => {
    if (onServiceClick) {
      onServiceClick(service);
    }
  };

  return (
    <section
      className={cn("!py-24 bg-[#F8FAFC]", settings.className, className)}
      style={{
        ...themeOverrideStyles,
        ...style,
        paddingTop: resolvedPadding,
        paddingBottom: resolvedPadding,
      }}
    >
      <div
        className={cn("mx-auto w-full !max-w-7xl px-6", {
          "text-left": align === "left",
          "text-center": align === "center",
          "text-right": align === "right",
        })}
        style={{
          maxWidth: resolvedMaxWidth ?? "72rem",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: resolvedContainerPadding,
          paddingRight: resolvedContainerPadding,
        }}
      >
        <h2
          className="text-3xl font-bold tracking-tight text-[#0F172A]"
          style={{
            fontSize: "var(--text-3xl, 1.875rem)",
            fontFamily: "var(--font-heading, inherit)",
            marginBottom: "var(--spacing-xl, 2rem)",
          }}
        >
          {title}
        </h2>
        <div
          className={cn("grid gap-8", gridCols[columns] || gridCols[3])}
          style={{ gap: resolvedGap }}
        >
          {serviceList.map((service) => (
            <div
              key={service.id}
              onClick={() => handleServiceClick(service)}
              className="cursor-pointer"
            >
              <Card className="group overflow-hidden rounded-2xl bg-white shadow-md border-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                {service.image && (
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={service.image.src}
                      alt={service.image.alt || service.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <CardContent style={{ padding: "var(--cards-padding, 1.25rem)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-left">
                      <p className="text-xs uppercase tracking-wide text-[#475569]">
                        {service.vendorName || "SpotCove Partner"}
                      </p>
                      <h3
                        className="font-semibold text-[#0F172A]"
                        style={{
                          fontSize: "var(--text-lg, 1.125rem)",
                          fontFamily: "var(--font-heading, inherit)",
                        }}
                      >
                        {service.name}
                      </h3>
                    </div>
                    {showBadge && service.badge && (
                      <Badge variant="secondary">{service.badge}</Badge>
                    )}
                  </div>
                  {showDescription && service.description && (
                    <p
                      className="text-[#475569]"
                      style={{
                        fontSize: "var(--text-sm, 0.875rem)",
                        fontFamily: "var(--font-body, inherit)",
                        marginTop: "var(--spacing-sm, 0.5rem)",
                      }}
                    >
                      {service.description}
                    </p>
                  )}
                  {showRating && service.rating && (
                    <div
                      className="flex items-center gap-1"
                      style={{ marginTop: "var(--spacing-sm, 0.5rem)" }}
                    >
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span
                        className="text-sm text-[#475569]"
                        style={{ fontFamily: "var(--font-body, inherit)" }}
                      >
                        {service.rating}
                      </span>
                    </div>
                  )}
                  {service.price !== undefined && (
                    <div
                      className="font-bold text-[#2563EB]"
                      style={{
                        fontSize: "var(--text-lg, 1.125rem)",
                        marginTop: "var(--spacing-sm, 0.5rem)",
                      }}
                    >
                      $
                      {typeof service.price === "number"
                        ? service.price.toFixed(2)
                        : service.price}
                    </div>
                  )}
                </CardContent>
                <CardFooter
                  className="pt-0"
                  style={{ padding: "var(--cards-padding, 1.25rem)" }}
                >
                  <Button className="w-full bg-[#2563EB] text-white hover:bg-[#1E4FD1]">
                    Book Service
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

FeaturedServices.displayName = "FeaturedServices";

export default React.memo(FeaturedServices);
