/**
 * TestimonialsSection - Social-proof reviews (Render Runtime)
 *
 * NO database imports. All data via props/settings.
 */
"use client";

import React, { memo } from "react";
import { cn } from "../utils";
import { getThemeOverrideStyles } from "../theme-wrapper";

interface Testimonial {
  author: string;
  quote: string;
  avatar?: string;
  rating?: number; // 1-5
  role?: string;
}

export interface TestimonialsSectionSettings {
  testimonials?: Testimonial[];
  title?: string;
  columns?: number;
  maxWidth?: number | string;
  align?: "left" | "center" | "right";
  paddingY?: number | string;
  gap?: number | string;
  className?: string;
}

export interface TestimonialsSectionProps {
  settings?: TestimonialsSectionSettings;
  themeOverride?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
}

const toCssValue = (v?: number | string) =>
  typeof v === "number" ? `${v}px` : v;

function StarRating({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex gap-0.5 mb-3" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={cn(
            "w-4 h-4",
            i < rating ? "text-primary" : "text-muted-foreground/30",
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const gridColsMap: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export const TestimonialsSection = memo(function TestimonialsSection({
  settings = {},
  themeOverride,
  className,
  style,
}: TestimonialsSectionProps) {
  const {
    testimonials = [],
    title = "What our customers say",
    columns = 2,
    maxWidth,
    align = "center",
    paddingY,
    gap,
  } = settings;

  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);
  const gridCols = gridColsMap[columns] ?? gridColsMap[2];

  return (
    <section
      className={cn("bg-muted/40", className)}
      style={{
        ...themeOverrideStyles,
        ...style,
        paddingTop: toCssValue(paddingY ?? 80),
        paddingBottom: toCssValue(paddingY ?? 80),
      }}
    >
      <div
        className="mx-auto px-6"
        style={{ maxWidth: maxWidth ? toCssValue(maxWidth) : "80rem" }}
      >
        {title && (
          <h2
            className="text-3xl font-bold mb-10 text-foreground"
            style={{
              textAlign: align,
              fontFamily: "var(--font-heading, inherit)",
            }}
          >
            {title}
          </h2>
        )}
        <div
          className={cn("grid", gridCols)}
          style={{ gap: toCssValue(gap ?? 24) }}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex flex-col bg-card border border-border rounded-xl p-6 shadow-sm"
            >
              <StarRating rating={t.rating} />
              <p
                className="text-foreground/90 text-base italic leading-relaxed flex-1"
                style={{ fontFamily: "var(--font-body, inherit)" }}
              >
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
                {t.avatar ? (
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="w-10 h-10 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm uppercase">
                    {t.author.charAt(0)}
                  </div>
                )}
                <div>
                  <p
                    className="font-semibold text-foreground text-sm"
                    style={{ fontFamily: "var(--font-body, inherit)" }}
                  >
                    {t.author}
                  </p>
                  {t.role && (
                    <p
                      className="text-muted-foreground text-xs"
                      style={{ fontFamily: "var(--font-body, inherit)" }}
                    >
                      {t.role}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

TestimonialsSection.displayName = "TestimonialsSection";
(TestimonialsSection as any).__metadata = {
  tier: 2,
  description:
    "Social-proof testimonials grid with star ratings, avatars, and role labels",
  settingsType: "TestimonialsSectionSettings",
};

export default TestimonialsSection;
