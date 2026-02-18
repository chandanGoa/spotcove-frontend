/**
 * CtaSection - Presentation Component
 *
 * NO data fetching - accepts all data via props/settings
 */
"use client";

import React from "react";
import { cn } from "../utils";
import { getThemeOverrideStyles } from "../theme-wrapper";
import { Button } from "./ui/button";

export interface CtaSectionSettings {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryText?: string;
  align?: "left" | "center" | "right";
  paddingY?: number | string;
  maxWidth?: number | string;
  containerPadding?: number | string;
  variant?: "vendor" | "promoter" | "default";
  className?: string;
}

export interface CtaSectionProps {
  settings?: CtaSectionSettings;
  themeOverride?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
}

const toCssValue = (value?: number | string) =>
  typeof value === "number" ? `${value}px` : value;

export const CtaSection: React.FC<CtaSectionProps> = ({
  settings = {},
  themeOverride,
  className,
  style,
}) => {
  const {
    title = "Ready to get started?",
    subtitle,
    buttonText = "Get Started",
    buttonLink = "#",
    secondaryText,
    align = "center",
    paddingY,
    maxWidth,
    containerPadding,
    variant = "default",
  } = settings;

  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);
  const resolvedPadding = toCssValue(paddingY ?? 64);
  const resolvedMaxWidth = toCssValue(maxWidth);
  const resolvedContainerPadding = toCssValue(containerPadding ?? 24);

  const variantClass =
    variant === "vendor"
      ? "bg-primary/10 border-primary/20"
      : variant === "promoter"
        ? "bg-secondary/10 border-secondary/20"
        : "bg-muted/50 border-border";

  return (
    <section
      className={cn(settings.className, className)}
      style={{
        ...themeOverrideStyles,
        ...style,
        paddingTop: resolvedPadding,
        paddingBottom: resolvedPadding,
      }}
    >
      <div
        className={cn("mx-auto rounded-2xl border p-8", variantClass, {
          "text-left": align === "left",
          "text-center": align === "center",
          "text-right": align === "right",
        })}
        style={{
          maxWidth: resolvedMaxWidth ?? "72rem",
          paddingLeft: resolvedContainerPadding,
          paddingRight: resolvedContainerPadding,
        }}
      >
        <h2
          className="font-bold text-foreground"
          style={{
            fontSize: "var(--text-3xl, 1.875rem)",
            fontFamily: "var(--font-heading, inherit)",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="text-muted-foreground"
            style={{
              fontSize: "var(--text-base, 1rem)",
              fontFamily: "var(--font-body, inherit)",
              marginTop: "var(--spacing-sm, 0.5rem)",
            }}
          >
            {subtitle}
          </p>
        )}
        <div
          className={cn("flex flex-wrap gap-3", {
            "justify-start": align === "left",
            "justify-center": align === "center",
            "justify-end": align === "right",
          })}
          style={{ marginTop: "var(--spacing-lg, 1.5rem)" }}
        >
          <Button asChild>
            <a href={buttonLink}>{buttonText}</a>
          </Button>
          {secondaryText && (
            <span
              className="text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-body, inherit)" }}
            >
              {secondaryText}
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

CtaSection.displayName = "CtaSection";

export default React.memo(CtaSection);
