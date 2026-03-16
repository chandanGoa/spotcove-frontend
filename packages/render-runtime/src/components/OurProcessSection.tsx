/**
 * OurProcessSection - Step-by-step process explanation (Render Runtime)
 *
 * NO database imports, NO next/image, NO next/link.
 * All data via props/settings.
 */
"use client";

import React, { memo } from "react";
import { cn } from "../utils";
import { getThemeOverrideStyles } from "../theme-wrapper";

interface ProcessStep {
  title: string;
  description: string;
  image?: string;
  link?: string;
}

export interface OurProcessSectionSettings {
  steps?: ProcessStep[];
  heading?: string;
  subheading?: string;
  maxWidth?: number | string;
  paddingY?: number | string;
  className?: string;
}

export interface OurProcessSectionProps {
  settings?: OurProcessSectionSettings;
  themeOverride?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
  onStepLinkClick?: (href: string) => void;
}

const toCssValue = (v?: number | string) =>
  typeof v === "number" ? `${v}px` : v;

export const OurProcessSection = memo(function OurProcessSection({
  settings = {},
  themeOverride,
  className,
  style,
  onStepLinkClick,
}: OurProcessSectionProps) {
  const {
    steps = [],
    heading = "How We Work with our Clients",
    subheading = "With Experience of over 30 YEARS",
    maxWidth,
    paddingY,
  } = settings;

  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);

  const handleStepClick = (e: React.MouseEvent, href: string) => {
    if (onStepLinkClick) {
      e.preventDefault();
      onStepLinkClick(href);
    }
  };

  return (
    <section
      className={cn("w-full", className)}
      style={{
        ...themeOverrideStyles,
        ...style,
        backgroundImage:
          "linear-gradient(to bottom, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)",
        paddingTop: toCssValue(paddingY ?? 48),
        paddingBottom: toCssValue(paddingY ?? 48),
      }}
    >
      <div
        className="mx-auto px-6 grid grid-cols-3 items-center justify-items-center max-lg:grid-cols-1 max-lg:gap-y-6"
        style={{ maxWidth: maxWidth ? toCssValue(maxWidth) : "96rem" }}
      >
        {/* Left heading column */}
        <div className="col-span-1 w-full max-w-xs max-lg:text-center max-lg:w-full">
          {subheading && (
            <h4
              className="text-primary text-sm uppercase font-semibold mb-2"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              {subheading}
            </h4>
          )}
          <h2
            className="text-foreground text-3xl font-bold"
            style={{ fontFamily: "var(--font-heading, inherit)" }}
          >
            {heading}
          </h2>
        </div>

        {/* Steps grid */}
        <div
          className={cn(
            "col-span-2 w-full grid gap-4 text-center",
            steps.length <= 3 ? `grid-cols-${steps.length}` : "grid-cols-4",
            "max-lg:grid-cols-2 max-md:grid-cols-1",
          )}
        >
          {steps.map((step, index) => {
            const stepContent = (
              <div
                className={cn(
                  "flex flex-col items-center p-4 h-full",
                  step.link ? "group cursor-pointer" : "",
                )}
              >
                {step.image && (
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-16 h-16 object-contain mb-4 max-lg:w-20 max-lg:h-20"
                  />
                )}
                <p
                  className="text-muted-foreground text-sm mb-1"
                  style={{ fontFamily: "var(--font-body, inherit)" }}
                >
                  Step {index + 1}
                </p>
                <h5
                  className="text-primary text-xl font-semibold mb-1"
                  style={{ fontFamily: "var(--font-heading, inherit)" }}
                >
                  {step.title}
                </h5>
                <p
                  className="text-foreground text-sm"
                  style={{ fontFamily: "var(--font-body, inherit)" }}
                >
                  {step.description}
                </p>
                {step.link && (
                  <span className="text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
                    More →
                  </span>
                )}
              </div>
            );

            return step.link ? (
              <a
                key={index}
                href={step.link}
                onClick={(e) => handleStepClick(e, step.link!)}
                className="block"
              >
                {stepContent}
              </a>
            ) : (
              <div key={index}>{stepContent}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

OurProcessSection.displayName = "OurProcessSection";
(OurProcessSection as any).__metadata = {
  tier: 2,
  description:
    "Step-by-step process section with heading, subheading, step images, and optional links",
  settingsType: "OurProcessSectionSettings",
};

export default OurProcessSection;
