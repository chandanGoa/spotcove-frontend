/**
 * CollectionsGrid - Presentation Component (Tier 2 Refactored)
 * 
 * NO data fetching - accepts all data via props
 * NO useEffect, NO Supabase, NO API calls
 * Pure presentation logic only
 */
"use client";

import React from "react";
import { cn } from "../utils";
import { getThemeOverrideStyles } from "../theme-wrapper";
import { Card } from "./ui/card";

export interface CollectionData {
  id: string;
  label: string;
  slug: string;
  image?: {
    src: string;
    alt: string;
  };
}

export interface CollectionsGridSettings {
  title?: string;
  layout?: "grid" | "carousel";
  className?: string;
}

export interface CollectionsGridProps {
  settings?: CollectionsGridSettings;
  themeOverride?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
  collections: CollectionData[];
  onCollectionClick?: (collection: CollectionData) => void;
}

export const CollectionsGrid: React.FC<CollectionsGridProps> = ({
  settings = {},
  themeOverride,
  className,
  style,
  collections = [],
  onCollectionClick,
}) => {
  const { title = "Shop by Category", layout = "grid" } = settings;

  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);

  const handleCollectionClick = (collection: CollectionData) => {
    if (onCollectionClick) {
      onCollectionClick(collection);
    }
  };

  return (
    <section
      className={cn("py-24 bg-[#F8FAFC]", settings.className, className)}
      style={{ ...themeOverrideStyles, ...style }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold tracking-tight mb-10 text-[#0F172A]">
          {title}
        </h2>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <div
              key={collection.id}
              onClick={() => handleCollectionClick(collection)}
              className="cursor-pointer"
            >
              <Card className="group overflow-hidden rounded-2xl bg-white shadow-md border-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[4/3] before:absolute before:left-5 before:top-5 before:h-12 before:w-12 before:rounded-full before:bg-[#2563EB]/15 before:ring-1 before:ring-[#2563EB]/30 before:content-['']">
                  {collection.image ? (
                    <img
                      src={collection.image.src}
                      alt={collection.image.alt || collection.label}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-white flex items-center justify-center">
                      <span className="text-[#475569] text-sm">
                        {collection.label}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[#0F172A]">
                    {collection.label}
                  </h3>
                  <p className="text-sm text-[#475569] mt-1">
                    Explore category
                  </p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

CollectionsGrid.displayName = "CollectionsGrid";

export default React.memo(CollectionsGrid);
