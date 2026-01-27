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
      className={cn("py-12", settings.className, className)}
      style={{ ...themeOverrideStyles, ...style }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-foreground">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {collections.map((collection) => (
            <div
              key={collection.id}
              onClick={() => handleCollectionClick(collection)}
              className="cursor-pointer"
            >
              <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-card border-border">
                <div className="relative aspect-square">
                  {collection.image ? (
                    <img
                      src={collection.image.src}
                      alt={collection.image.alt || collection.label}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">
                        {collection.label}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <span className="text-white font-semibold text-sm">
                      {collection.label}
                    </span>
                  </div>
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
