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
  align?: "left" | "center" | "right";
  paddingY?: number | string;
  contentGap?: number | string;
  containerPadding?: number | string;
  subtype?:
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
    align = "left",
    paddingY,
    contentGap,
    containerPadding,
    subtype,
  } = settings || {};
  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);
  const resolvedMaxWidth = toCssValue(maxWidth);
  const resolvedPadding = toCssValue(paddingY);
  const resolvedGap = toCssValue(contentGap ?? "3rem");
  const resolvedContainerPadding = toCssValue(containerPadding ?? "1.5rem");
  const sectionStyle: React.CSSProperties = {
    ...themeOverrideStyles,
    ...style,
  };

  if (resolvedPadding) {
    sectionStyle.paddingTop = resolvedPadding;
    sectionStyle.paddingBottom = resolvedPadding;
  }

  // Determine layout based on subtype
  const isMediaLeft = subtype === "hero-media-left";
  const isMediaRight = subtype === "hero-media-right";
  const isSplit = subtype === "hero-split";
  const isCentered =
    subtype === "hero-centered" || (!isMediaLeft && !isMediaRight && !isSplit);

  // For centered layout, don't render image
  const shouldRenderImage = image && !isCentered;

  // For split layout, treat image and text equally
  const gridClasses = isCentered
    ? "grid grid-cols-1 items-center"
    : isSplit
      ? "grid grid-cols-1 lg:grid-cols-2 items-center"
      : "grid grid-cols-1 lg:grid-cols-2 items-center";

  // Reorder based on subtype (media-left keeps natural order, media-right reverses)
  const textElement = (
    <div
      className={cn("mx-auto flex flex-col gap-6", {
        "lg:text-left": align === "left",
        "lg:text-center": align === "center",
        "lg:text-right": align === "right",
      })}
      style={{ maxWidth: "42rem" }}
    >
      <h1
        className="text-white text-5xl font-bold tracking-tight md:text-7xl"
        style={{
          fontFamily: "var(--font-heading, inherit)",
          lineHeight: "1.1",
        }}
      >
        {title}
      </h1>
      <p
        className="text-slate-200 text-lg md:text-xl"
        style={{
          fontFamily: "var(--font-body, inherit)",
          lineHeight: "1.6",
        }}
      >
        {subtitle}
      </p>
      <div
        className={cn("flex flex-col gap-3 sm:flex-row", {
          "justify-start": align === "left",
          "justify-center": align === "center",
          "justify-end": align === "right",
        })}
      >
        <Button
          size="lg"
          className="bg-[#2563EB] text-white shadow-lg hover:bg-[#1E4FD1]"
        >
          {buttonText}
        </Button>
        {secondaryButtonText ? (
          <Button
            size="lg"
            variant="outline"
            className="border-white/60 text-white hover:bg-white/10"
          >
            {secondaryButtonText}
          </Button>
        ) : null}
      </div>
    </div>
  );

  const imageElement = shouldRenderImage && (
    <div
      className="relative"
      style={{
        borderRadius: "var(--radius-lg, 0.5rem)",
      }}
    >
      <img
        src={image}
        alt="Hero"
        className="w-full h-auto shadow-lg"
        style={{
          borderRadius: "var(--radius-lg, 0.5rem)",
        }}
      />
    </div>
  );

  // Render content based on subtype
  const renderContent = () => {
    if (isCentered) {
      return textElement;
    }

    if (isMediaRight) {
      return (
        <>
          {textElement}
          {imageElement}
        </>
      );
    }

    // Default: media-left (or no subtype)
    return (
      <>
        {imageElement}
        {textElement}
      </>
    );
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-[#0B1F3A] text-white",
        className,
      )}
      style={sectionStyle}
      {...rest}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#2563EB]/25 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      </div>
      <div
        className={cn("relative z-10 w-full", {
          "text-left": align === "left",
          "text-center": align === "center",
          "text-right": align === "right",
        })}
        style={{
          maxWidth: resolvedMaxWidth,
          marginLeft: align === "left" ? undefined : "auto",
          marginRight: align === "right" ? undefined : "auto",
          paddingLeft: resolvedContainerPadding,
          paddingRight: resolvedContainerPadding,
        }}
      >
        <div className={gridClasses} style={{ gap: resolvedGap }}>
          {renderContent()}
        </div>
      </div>
      {children}
    </section>
  );
});

HeroSection.displayName = "HeroSection";
(HeroSection as any).__metadata = {
  tier: 3,
  description:
    "Hero banner with title, subtitle, CTA button, and optional image - supports subtype-based layout (hero-media-left, hero-media-right, hero-centered, hero-split)",
  settingsType: "HeroSectionSettings",
};
