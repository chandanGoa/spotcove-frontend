// Render Runtime - HeroSection
// Presentation Component (Tier 1)
import React, { memo } from "react";
import { cn } from "../utils";
import { Button } from "./ui/button";
import { getThemeOverrideStyles } from "../theme-wrapper";

export interface HeroSectionSettings {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  secondaryButtonText?: string;
  image?: string;
  maxWidth?: number | string;
  align?: "left" | "center";
  paddingY?: "small" | "medium" | "large" | number;
  contentGap?: "small" | "medium" | "large" | number;
  containerPadding?: string;
  subtype?:
    | "dark"
    | "light"
    | "hero-media-left"
    | "hero-media-right"
    | "hero-centered"
    | "hero-split";
}
export interface HeroSectionProps extends React.ComponentProps<"div"> {
  settings?: HeroSectionSettings;
  themeOverride?: Record<string, string>;
}

const toCssValue = (value?: string | number) =>
  typeof value === "number" ? `${value}px` : value;

const alignMap = {
  left: "text-left items-start",
  center: "text-center items-center",
} as const;

const paddingMap = {
  small: "py-20",
  medium: "py-24",
  large: "py-32",
} as const;

const gapMap = {
  small: "gap-4",
  medium: "gap-6",
  large: "gap-10",
} as const;

const subtypeMap = {
  dark: "bg-[#0B1F3A] text-white",
  light: "bg-[#0B1F3A] text-white",
} as const;

function resolvePaddingClass(
  paddingY: HeroSectionSettings["paddingY"],
): (typeof paddingMap)[keyof typeof paddingMap] {
  if (paddingY && typeof paddingY === "string" && paddingY in paddingMap) {
    return paddingMap[paddingY as keyof typeof paddingMap];
  }

  if (typeof paddingY === "number") {
    if (paddingY >= 96) return paddingMap.large;
    if (paddingY >= 72) return paddingMap.medium;
    return paddingMap.small;
  }

  return paddingMap.medium;
}

function resolveGapClass(
  contentGap: HeroSectionSettings["contentGap"],
): (typeof gapMap)[keyof typeof gapMap] {
  if (contentGap && typeof contentGap === "string" && contentGap in gapMap) {
    return gapMap[contentGap as keyof typeof gapMap];
  }

  if (typeof contentGap === "number") {
    if (contentGap >= 40) return gapMap.large;
    if (contentGap >= 24) return gapMap.medium;
    return gapMap.small;
  }

  return gapMap.medium;
}

export const HeroSection = memo(function HeroSection(props: HeroSectionProps) {
  const { className, style, children, settings, themeOverride, ...rest } =
    props;
  const {
    title = "Welcome to Our Store",
    subtitle = "Discover amazing products and great deals",
    buttonText = "Shop Now",
    secondaryButtonText = "Learn More",
    image,
    maxWidth,
    align = "center",
    paddingY,
    contentGap,
    containerPadding,
    subtype,
  } = settings || {};
  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);
  const resolvedMaxWidth = toCssValue(maxWidth);
  const resolvedAlign = align === "left" ? "left" : "center";
  const resolvedPaddingClass = resolvePaddingClass(paddingY);
  const resolvedGapClass = resolveGapClass(contentGap);
  const resolvedSubtype = subtype === "dark" ? "dark" : "light";
  const resolvedContainerPadding =
    typeof containerPadding === "string" && containerPadding.trim().length > 0
      ? containerPadding
      : "px-6";
  const resolvedContainerPaddingStyle =
    typeof containerPadding === "number"
      ? {
          paddingLeft: `${containerPadding}px`,
          paddingRight: `${containerPadding}px`,
        }
      : undefined;
  const sectionStyle: React.CSSProperties = {
    ...themeOverrideStyles,
    ...style,
  };

  const textElement = (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1
        className="text-6xl font-extrabold tracking-tight text-white"
        style={{
          fontFamily: "var(--font-heading, inherit)",
          lineHeight: "1.1",
        }}
      >
        {title}
      </h1>
      <p
        className="text-lg text-slate-300"
        style={{
          fontFamily: "var(--font-body, inherit)",
          lineHeight: "1.6",
        }}
      >
        {subtitle}
      </p>
      <div
        className={cn("flex flex-col gap-3 sm:flex-row", {
          "justify-start": resolvedAlign === "left",
          "justify-center": resolvedAlign === "center",
        })}
      >
        <Button
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
        >
          {buttonText}
        </Button>
        {secondaryButtonText ? (
          <Button
            size="lg"
            variant="outline"
            className="border border-white text-white"
          >
            {secondaryButtonText}
          </Button>
        ) : null}
      </div>
    </div>
  );

  const imageElement = image && (
    <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl shadow-lg">
      <img src={image} alt="Hero" className="h-auto w-full" />
    </div>
  );

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        resolvedPaddingClass,
        "py-32",
        subtypeMap[resolvedSubtype],
        className,
      )}
      style={sectionStyle}
      {...rest}
    >
      <div
        className={cn(
          "max-w-7xl mx-auto flex flex-col",
          alignMap[resolvedAlign],
          resolvedGapClass,
          resolvedContainerPadding,
        )}
        style={{
          maxWidth: resolvedMaxWidth,
          ...resolvedContainerPaddingStyle,
        }}
      >
        {textElement}
        {imageElement}
      </div>
      {children}
    </section>
  );
});

HeroSection.displayName = "HeroSection";
(HeroSection as any).__metadata = {
  tier: 3,
  description:
    "Hero banner with title, subtitle, CTA button, and optional image - supports align, spacing, container, and light/dark subtype settings",
  settingsType: "HeroSectionSettings",
};
