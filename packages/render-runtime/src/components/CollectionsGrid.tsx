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
      className={cn("py-24 bg-slate-50", settings.className, className)}
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
              <Card className="group overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 min-h-[260px]">
                <div className="relative aspect-[4/3]">
                  {collection.image ? (
                    <img
                      src={collection.image.src}
                      alt={collection.image.alt || collection.label}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <span className="text-slate-500 text-sm">
                        {collection.label}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-center">
                    <div className="h-14 w-14 rounded-full bg-blue-100" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0F172A] text-center">
                    {collection.label}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 text-center">
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
