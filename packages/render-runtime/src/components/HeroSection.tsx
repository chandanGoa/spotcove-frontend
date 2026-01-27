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
      className={cn({
        "lg:text-left": align === "left",
        "lg:text-center": align === "center",
        "lg:text-right": align === "right",
      })}
    >
      <h1
        className="text-foreground"
        style={{
          fontSize: "var(--font-size-h1, 3.75rem)",
          fontFamily: "var(--font-heading, inherit)",
          fontWeight: "var(--font-weight-bold, 700)",
          lineHeight: "var(--leading-tight, 1.25)",
          marginBottom: "var(--spacing-lg, 1.5rem)",
        }}
      >
        {title}
      </h1>
      <p
        className="text-muted-foreground"
        style={{
          fontSize: "var(--font-size-xl, 1.25rem)",
          fontFamily: "var(--font-body, inherit)",
          lineHeight: "var(--leading-normal, 1.5)",
          marginBottom: "var(--spacing-xl, 2rem)",
        }}
      >
        {subtitle}
      </p>
      <Button
        size="lg"
        className="text-primary-foreground"
        style={{
          background: "hsl(var(--button-primary, var(--primary)))",
          borderRadius:
            "var(--btn-primary-border-radius, var(--radius-md, 0.375rem))",
          padding: "var(--btn-primary-padding, 0.5rem 1rem)",
          fontSize: "var(--btn-primary-font-size, var(--font-size-base, 1rem))",
          fontWeight:
            "var(--btn-primary-font-weight, var(--font-weight-medium, 500))",
          boxShadow: "var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1))",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        {buttonText}
      </Button>
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
        "bg-gradient-to-r from-primary/10 to-secondary/10",
        className,
      )}
      style={sectionStyle}
      {...rest}
    >
      <div
        className={cn("w-full", {
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
