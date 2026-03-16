/**
 * FAQSection - Accordion FAQ (Render Runtime)
 *
 * NO database imports. All data via props/settings.
 * Accordion toggle is internal (UI-only) state.
 */
"use client";

import React, { memo, useState } from "react";
import { cn } from "../utils";
import { getThemeOverrideStyles } from "../theme-wrapper";

interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSectionSettings {
  faqs?: FAQItem[];
  title?: string;
  maxWidth?: number | string;
  align?: "left" | "center" | "right";
  paddingY?: number | string;
  gap?: number | string;
  className?: string;
}

export interface FAQSectionProps {
  settings?: FAQSectionSettings;
  themeOverride?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
}

const toCssValue = (v?: number | string) =>
  typeof v === "number" ? `${v}px` : v;

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={cn(
      "w-5 h-5 text-muted-foreground transition-transform duration-200",
      open && "rotate-180",
    )}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

function FAQAccordionItem({ faq, index }: { faq: FAQItem; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="w-full flex justify-between items-center px-5 py-4 text-left bg-card hover:bg-muted/50 transition-colors gap-4"
      >
        <span
          className="font-medium text-foreground text-sm md:text-base"
          style={{ fontFamily: "var(--font-body, inherit)" }}
        >
          {faq.question}
        </span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div
          className="px-5 py-4 text-sm md:text-base text-muted-foreground border-t border-border bg-card"
          style={{ fontFamily: "var(--font-body, inherit)", lineHeight: "1.7" }}
        >
          {faq.answer}
        </div>
      )}
    </div>
  );
}

export const FAQSection = memo(function FAQSection({
  settings = {},
  themeOverride,
  className,
  style,
}: FAQSectionProps) {
  const {
    faqs = [],
    title = "Frequently Asked Questions",
    maxWidth,
    align = "center",
    paddingY,
    gap,
  } = settings;

  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);

  return (
    <section
      className={cn("bg-background", className)}
      style={{
        ...themeOverrideStyles,
        ...style,
        paddingTop: toCssValue(paddingY ?? 80),
        paddingBottom: toCssValue(paddingY ?? 80),
      }}
    >
      <div
        className="mx-auto px-6"
        style={{ maxWidth: maxWidth ? toCssValue(maxWidth) : "56rem" }}
      >
        {title && (
          <h2
            className="text-3xl font-bold mb-10 text-foreground"
            style={{
              textAlign: align,
              fontFamily: "var(--font-heading, inherit)",
            }}
          >
            {title}
          </h2>
        )}
        <div className="flex flex-col" style={{ gap: toCssValue(gap ?? 12) }}>
          {faqs.map((faq, i) => (
            <FAQAccordionItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
});

FAQSection.displayName = "FAQSection";
(FAQSection as any).__metadata = {
  tier: 2,
  description:
    "Accordion FAQ with animated toggle, themed borders, and CSS variables",
  settingsType: "FAQSectionSettings",
};

export default FAQSection;
