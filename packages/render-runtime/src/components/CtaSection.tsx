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
  const resolvedPadding = toCssValue(paddingY ?? 96);
  const resolvedMaxWidth = toCssValue(maxWidth);
  const resolvedContainerPadding = toCssValue(containerPadding ?? 24);

  const variantClass = "bg-[#0B1F3A] text-white";
  return (
    <section
      className={cn("py-20 md:py-24", settings.className, className)}
      style={{
        ...themeOverrideStyles,
        ...style,
      }}
    >
      <div
        className={cn("max-w-6xl mx-auto px-6 rounded-2xl p-10", variantClass, {
          "text-left": align === "left",
          "text-center": align === "center",
          "text-right": align === "right",
        })}
      >
        <h2
          className="text-4xl font-bold tracking-tight text-white"
          style={{
            fontFamily: "var(--font-heading, inherit)",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="text-slate-300"
            style={{
              fontFamily: "var(--font-body, inherit)",
              marginTop: "var(--spacing-sm, 0.5rem)",
            }}
          >
            {subtitle}
          </p>
        )}
        {secondaryText && (
          <p
            className="mt-5 text-sm text-slate-300"
            style={{ fontFamily: "var(--font-body, inherit)" }}
          >
            {secondaryText}
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
          <Button
            asChild
            className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-lg"
          >
            <a href={buttonLink}>{buttonText}</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

CtaSection.displayName = "CtaSection";

export default React.memo(CtaSection);
