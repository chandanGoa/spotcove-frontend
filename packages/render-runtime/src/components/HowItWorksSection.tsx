/**
 * HowItWorksSection - Presentation Component
 *
 * NO data fetching - accepts all data via props/settings
 */
"use client";

import React from "react";
import { cn } from "../utils";
import { getThemeOverrideStyles } from "../theme-wrapper";

type HowItWorksStep = {
  title: string;
  description?: string;
  icon?: string;
};

export interface HowItWorksSettings {
  title?: string;
  subtitle?: string;
  steps?: HowItWorksStep[];
  columns?: number;
  align?: "left" | "center" | "right";
  paddingY?: number | string;
  gap?: number | string;
  maxWidth?: number | string;
  containerPadding?: number | string;
  className?: string;
}

export interface HowItWorksProps {
  settings?: HowItWorksSettings;
  themeOverride?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
}

const toCssValue = (value?: number | string) =>
  typeof value === "number" ? `${value}px` : value;

export const HowItWorksSection: React.FC<HowItWorksProps> = ({
  settings = {},
  themeOverride,
  className,
  style,
}) => {
  const {
    title = "How It Works",
    subtitle = "A simple workflow to launch and grow.",
    steps = [],
    columns = 3,
    align = "center",
    paddingY,
    gap,
    maxWidth,
    containerPadding,
  } = settings;

  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);
  const resolvedPadding = toCssValue(paddingY ?? 64);
  const resolvedGap = toCssValue(gap ?? 24);
  const resolvedMaxWidth = toCssValue(maxWidth);
  const resolvedContainerPadding = toCssValue(containerPadding ?? 24);

  const gridCols: Record<number, string> = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section
      className={cn("w-full", settings.className, className)}
      style={{
        ...themeOverrideStyles,
        ...style,
        paddingTop: resolvedPadding,
        paddingBottom: resolvedPadding,
      }}
    >
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: resolvedMaxWidth ?? "72rem",
          paddingLeft: resolvedContainerPadding,
          paddingRight: resolvedContainerPadding,
        }}
      >
        <div
          className={cn({
            "text-left": align === "left",
            "text-center": align === "center",
            "text-right": align === "right",
          })}
          style={{ marginBottom: "var(--spacing-xl, 2rem)" }}
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
        </div>

        <div
          className={cn("grid", gridCols[columns] || gridCols[3])}
          style={{ gap: resolvedGap }}
        >
          {steps.map((step, index) => (
            <div
              key={`${step.title}-${index}`}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-xs uppercase tracking-wide text-muted-foreground"
                  style={{ fontFamily: "var(--font-body, inherit)" }}
                >
                  Step {index + 1}
                </span>
                {step.icon && (
                  <span
                    className="text-primary text-sm"
                    style={{ fontFamily: "var(--font-body, inherit)" }}
                  >
                    {step.icon}
                  </span>
                )}
              </div>
              <h3
                className="font-semibold text-foreground"
                style={{
                  fontSize: "var(--text-lg, 1.125rem)",
                  fontFamily: "var(--font-heading, inherit)",
                  marginBottom: "var(--spacing-xs, 0.25rem)",
                }}
              >
                {step.title}
              </h3>
              {step.description && (
                <p
                  className="text-muted-foreground"
                  style={{
                    fontSize: "var(--text-sm, 0.875rem)",
                    fontFamily: "var(--font-body, inherit)",
                  }}
                >
                  {step.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

HowItWorksSection.displayName = "HowItWorksSection";

export default React.memo(HowItWorksSection);
