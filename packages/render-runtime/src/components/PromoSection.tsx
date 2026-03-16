/**
 * PromoSection - Promotional banner (Render Runtime)
 *
 * NO database imports. All data via props/settings.
 * Supports dark (bg-foreground), primary (bg-primary), and light variants.
 */
"use client";

import React, { memo } from "react";
import { cn } from "../utils";
import { getThemeOverrideStyles } from "../theme-wrapper";
import { Button } from "./ui/button";

export interface PromoSectionSettings {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  align?: "left" | "center" | "right";
  maxWidth?: number | string;
  padding?: number | string;
  /** "primary" | "dark" | "light" — default "primary" */
  subtype?: "primary" | "dark" | "light";
  className?: string;
}

export interface PromoSectionProps {
  settings?: PromoSectionSettings;
  themeOverride?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
}

const toCssValue = (v?: number | string) =>
  typeof v === "number" ? `${v}px` : v;

const subtypeMap = {
  primary: "bg-primary text-primary-foreground",
  dark: "bg-foreground text-background",
  light: "bg-muted text-foreground",
} as const;

export const PromoSection = memo(function PromoSection({
  settings = {},
  themeOverride,
  className,
  style,
}: PromoSectionProps) {
  const {
    title = "Special Offer",
    description,
    buttonText,
    buttonLink,
    image,
    align = "center",
    maxWidth,
    padding,
    subtype = "primary",
  } = settings;

  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);
  const colorClass = subtypeMap[subtype] ?? subtypeMap.primary;
  const isDark = subtype === "primary" || subtype === "dark";

  return (
    <section
      className={cn("relative overflow-hidden", colorClass, className)}
      style={{
        ...themeOverrideStyles,
        ...style,
        paddingTop: toCssValue(padding ?? 80),
        paddingBottom: toCssValue(padding ?? 80),
      }}
    >
      {/* Optional decorative background image */}
      {image && (
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url(${image})` }}
          aria-hidden="true"
        />
      )}

      <div
        className="relative mx-auto px-6 flex flex-col items-center gap-6"
        style={{
          maxWidth: maxWidth ? toCssValue(maxWidth) : "64rem",
          textAlign: align,
        }}
      >
        <h2
          className="text-3xl md:text-4xl font-extrabold tracking-tight"
          style={{ fontFamily: "var(--font-heading, inherit)", lineHeight: "1.15" }}
        >
          {title}
        </h2>

        {description && (
          <p
            className={cn(
              "text-lg max-w-2xl",
              isDark ? "opacity-85" : "text-muted-foreground",
            )}
            style={{ fontFamily: "var(--font-body, inherit)" }}
          >
            {description}
          </p>
        )}

        {buttonText && (
          buttonLink ? (
            <a href={buttonLink}>
              <Button
                size="lg"
                variant={isDark ? "secondary" : "default"}
                className={cn(
                  isDark
                    ? "bg-background text-foreground hover:bg-background/90"
                    : "bg-foreground text-background hover:bg-foreground/90",
                )}
              >
                {buttonText}
              </Button>
            </a>
          ) : (
            <Button
              size="lg"
              variant={isDark ? "secondary" : "default"}
              className={cn(
                isDark
                  ? "bg-background text-foreground hover:bg-background/90"
                  : "bg-foreground text-background hover:bg-foreground/90",
              )}
            >
              {buttonText}
            </Button>
          )
        )}
      </div>
    </section>
  );
});

PromoSection.displayName = "PromoSection";
(PromoSection as any).__metadata = {
  tier: 2,
  description:
    "Promotional banner with CTA button, optional background image, and primary/dark/light subtype",
  settingsType: "PromoSectionSettings",
};

export default PromoSection;
