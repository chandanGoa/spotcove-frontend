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

export interface HeroSectionContent {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface HeroSectionProps
  extends Omit<React.ComponentProps<"div">, "content"> {
  settings?: HeroSectionSettings;
  themeOverride?: Record<string, string>;
  content?: HeroSectionContent;
}

const toCssValue = (value?: string | number) =>
  typeof value === "number" ? `${value}px` : value;

const alignMap = {
  left: "text-left items-start",
  center: "text-center items-center",
} as const;

const paddingMap = {
  small: "py-12",
  medium: "py-20",
  large: "py-28",
} as const;

const gapMap = {
  small: "gap-4",
  medium: "gap-6",
  large: "gap-10",
} as const;

const subtypeMap = {
  dark: "bg-foreground text-background",
  light: "bg-background text-foreground",
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
  const {
    className,
    style,
    children,
    settings,
    themeOverride,
    content,
    ...rest
  } = props;
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
  const resolvedTitle = content?.title ?? title;
  const resolvedSubtitle = content?.subtitle ?? subtitle;
  const resolvedPrimaryCtaText = content?.ctaText ?? buttonText;
  const resolvedPrimaryCtaLink = content?.ctaLink;
  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);
  const resolvedAlign = align === "left" ? "left" : "center";
  const resolvedGapClass = resolveGapClass(contentGap);
  const resolvedSubtype = subtype === "dark" ? "dark" : "light";
  const paddingClass = resolvePaddingClass(paddingY);

  // Layout variant flags
  const isMediaLeft = subtype === "hero-media-left";
  const isMediaRight = subtype === "hero-media-right";
  const isSplit = subtype === "hero-split";
  const isCentered = subtype === "hero-centered";
  const hasMedia = isMediaLeft || isMediaRight || isSplit;

  // For media variants use the light subtype coloring by default (or dark if explicitly dark)
  const colorSubtype =
    subtype === "dark"
      ? "dark"
      : subtype === "light"
        ? "light"
        : isMediaLeft || isMediaRight || isCentered
          ? "light"
          : isSplit
            ? "dark"
            : "light";

  const sectionStyle: React.CSSProperties = {
    ...themeOverrideStyles,
    ...style,
  };

  const textBlock = (
    <div
      className={cn(
        "flex flex-col gap-6",
        isCentered ? "items-center text-center max-w-4xl" : "max-w-3xl",
      )}
    >
      <h1
        className={cn(
          "font-extrabold tracking-tight",
          isCentered ? "text-7xl" : "text-5xl md:text-6xl",
          colorSubtype === "dark" ? "text-background" : "text-foreground",
        )}
        style={{
          fontFamily: "var(--font-heading, inherit)",
          lineHeight: "1.1",
        }}
      >
        {resolvedTitle}
      </h1>
      <p
        className={cn(
          "text-lg",
          isCentered ? "text-xl" : "",
          colorSubtype === "dark"
            ? "text-background/80"
            : "text-muted-foreground",
        )}
        style={{ fontFamily: "var(--font-body, inherit)", lineHeight: "1.6" }}
      >
        {resolvedSubtitle}
      </p>
      <div
        className={cn("flex flex-col gap-3 sm:flex-row", {
          "justify-start": resolvedAlign === "left" && !isCentered,
          "justify-center": resolvedAlign === "center" || isCentered,
        })}
      >
        {resolvedPrimaryCtaLink ? (
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
          >
            <a href={resolvedPrimaryCtaLink}>{resolvedPrimaryCtaText}</a>
          </Button>
        ) : (
          <Button
            size="lg"
            className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
          >
            {resolvedPrimaryCtaText}
          </Button>
        )}
        {secondaryButtonText ? (
          <Button
            size="lg"
            variant="outline"
            className={cn(
              colorSubtype === "dark"
                ? "border-background/60 text-background hover:bg-background/10"
                : "border-border text-foreground hover:bg-muted",
            )}
          >
            {secondaryButtonText}
          </Button>
        ) : null}
      </div>
    </div>
  );

  const imageBlock = image ? (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl shadow-lg",
        isSplit ? "w-full" : "w-full max-w-3xl",
      )}
    >
      <img src={image} alt="Hero" className="h-auto w-full object-cover" />
    </div>
  ) : null;

  // --- hero-split: two equal columns ---
  if (isSplit) {
    return (
      <section
        className={cn(
          "relative overflow-hidden",
          subtypeMap["dark"],
          className,
        )}
        style={sectionStyle}
        {...rest}
      >
        <div
          className="grid min-h-[60vh] grid-cols-1 md:grid-cols-2"
          style={{ maxWidth: maxWidth ? toCssValue(maxWidth) : undefined }}
        >
          <div
            className={cn(
              "flex flex-col justify-center p-10 md:p-16",
              "gap-6 items-start text-left",
            )}
          >
            {textBlock}
          </div>
          {imageBlock && (
            <div className="relative overflow-hidden">
              <img
                src={image}
                alt="Hero"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
        {children}
      </section>
    );
  }

  // --- hero-media-left / hero-media-right ---
  if (isMediaLeft || isMediaRight) {
    return (
      <section
        className={cn(
          "relative overflow-hidden py-16 md:py-24",
          subtypeMap.light,
          className,
        )}
        style={sectionStyle}
        {...rest}
      >
        <div
          className={cn(
            "mx-auto flex flex-col items-center gap-10 px-6 md:flex-row",
            isMediaRight && "md:flex-row-reverse",
          )}
          style={{ maxWidth: maxWidth ? toCssValue(maxWidth) : "80rem" }}
        >
          {imageBlock}
          <div className="flex-1">{textBlock}</div>
        </div>
        {children}
      </section>
    );
  }

  // --- hero-centered: full-width centered with large typography ---
  if (isCentered) {
    return (
      <section
        className={cn(
          paddingClass,
          "relative overflow-hidden",
          subtypeMap.light,
          className,
        )}
        style={sectionStyle}
        {...rest}
      >
        <div
          className="mx-auto flex flex-col items-center px-6 gap-8"
          style={{ maxWidth: maxWidth ? toCssValue(maxWidth) : "72rem" }}
        >
          {textBlock}
          {imageBlock}
        </div>
        {children}
      </section>
    );
  }

  // --- dark / light (default): standard aligned layout ---
  return (
    <section
      className={cn(
        paddingClass,
        "relative overflow-hidden",
        subtypeMap[resolvedSubtype],
        className,
      )}
      style={sectionStyle}
      {...rest}
    >
      <div
        className={cn(
          "max-w-6xl mx-auto px-6 flex flex-col",
          alignMap[resolvedAlign],
          resolvedGapClass,
        )}
      >
        {textBlock}
        {imageBlock}
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
