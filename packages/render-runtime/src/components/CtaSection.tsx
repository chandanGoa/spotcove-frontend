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
  bullets?: string[];
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
    bullets,
  } = settings;

  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);
  const resolvedPadding = toCssValue(paddingY ?? 96);
  const resolvedMaxWidth = toCssValue(maxWidth);
  const resolvedContainerPadding = toCssValue(containerPadding ?? 24);

  const variantClass = "bg-[#0B1F3A] text-white";
  const bulletClass = "bg-blue-600";

  const resolvedBullets =
    bullets && bullets.length > 0
      ? bullets
      : variant === "vendor"
        ? [
            "Launch a storefront in days, not months",
            "No-code layout control with JSON-driven sections",
            "Built-in merchandising and service promotion",
          ]
        : variant === "promoter"
          ? [
              "Showcase trusted campaigns and curated services",
              "Highlight performance with real-time layout updates",
              "Align promotions with your brand tone",
            ]
          : [];

  return (
    <section
      className={cn("!py-24", settings.className, className)}
      style={{
        ...themeOverrideStyles,
        ...style,
        paddingTop: resolvedPadding,
        paddingBottom: resolvedPadding,
      }}
    >
      <div
        className={cn(
          "mx-auto w-full !max-w-7xl px-6 rounded-2xl p-10 text-center",
          variantClass,
          {
            "text-left": align === "left",
            "text-center": align === "center",
            "text-right": align === "right",
          },
        )}
        style={{
          maxWidth: resolvedMaxWidth ?? "72rem",
          paddingLeft: resolvedContainerPadding,
          paddingRight: resolvedContainerPadding,
        }}
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
        {resolvedBullets.length > 0 && (
          <ul className="mt-5 space-y-2 text-sm text-slate-300">
            {resolvedBullets.map((bullet, index) => (
              <li key={`${bullet}-${index}`} className="flex items-start gap-2">
                <span className={cn("mt-1 h-2 w-2 rounded-full", bulletClass)} />
                <span style={{ fontFamily: "var(--font-body, inherit)" }}>
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div
          className={cn("flex flex-wrap gap-3", {
            "justify-start": align === "left",
            "justify-center": align === "center",
            "justify-end": align === "right",
          })}
          style={{ marginTop: "var(--spacing-lg, 1.5rem)" }}
        >
          <Button asChild className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-lg">
            <a href={buttonLink}>{buttonText}</a>
          </Button>
          {secondaryText && (
            <span
              className="text-sm text-slate-300"
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
