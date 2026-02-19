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
  const resolvedPadding = toCssValue(paddingY ?? 96);
  const resolvedGap = toCssValue(gap ?? 32);
  const resolvedMaxWidth = toCssValue(maxWidth);
  const resolvedContainerPadding = toCssValue(containerPadding ?? 24);

  const gridCols: Record<number, string> = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section
      className={cn(
        "w-full bg-white text-[#0F172A] !py-24",
        settings.className,
        className,
      )}
      style={{
        ...themeOverrideStyles,
        ...style,
        paddingTop: resolvedPadding,
        paddingBottom: resolvedPadding,
      }}
    >
      <div
        className="mx-auto w-full !max-w-7xl px-6"
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
            className="text-3xl font-bold text-[#0F172A]"
            style={{
              fontFamily: "var(--font-heading, inherit)",
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="text-lg text-slate-600"
              style={{
                fontFamily: "var(--font-body, inherit)",
                marginTop: "var(--spacing-sm, 0.5rem)",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={cn("grid gap-8", gridCols[columns] || gridCols[3])}
          style={{ gap: resolvedGap }}
        >
          {steps.map((step, index) => (
            <div
              key={`${step.title}-${index}`}
              className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                  {step.icon || index + 1}
                </div>
                <span
                  className="text-xs uppercase tracking-wide text-slate-500"
                  style={{ fontFamily: "var(--font-body, inherit)" }}
                >
                  Step {index + 1}
                </span>
              </div>
              <h3
                className="font-semibold text-[#0F172A]"
                style={{
                  fontSize: "var(--text-lg, 1.125rem)",
                  fontFamily: "var(--font-heading, inherit)",
                  marginBottom: "var(--spacing-sm, 0.5rem)",
                }}
              >
                {step.title}
              </h3>
              {step.description && (
                <p
                  className="text-slate-600"
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
