"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "../utils";
import { getThemeOverrideStyles } from "../theme-wrapper";

export interface NewsletterSettings {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  placeholder?: string;
  maxWidth?: number | string;
  align?: "left" | "center" | "right";
  paddingY?: number | string;
  containerPadding?: number | string;
  className?: string;
}

export interface NewsletterSectionProps {
  settings?: NewsletterSettings;
  themeOverride?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
}

const NewsletterSectionComponent = ({
  settings = {},
  themeOverride,
  className,
  style,
  ...props
}: NewsletterSectionProps) => {
  const {
    title = "Stay Updated",
    subtitle = "Subscribe to our newsletter for exclusive offers and updates",
    buttonText = "Subscribe",
    placeholder = "Enter your email",
    maxWidth,
    align = "center",
    paddingY,
    containerPadding,
  } = settings;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const toCssValue = (value?: number | string) =>
    typeof value === "number" ? `${value}px` : value;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Note: In render runtime, toast is not available
    // Parent application should handle submission
    console.log("Newsletter subscription:", email);
    setEmail("");
    setLoading(false);
  };

  // Get theme override styles
  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);

  return (
    <section
      className={cn("bg-muted", settings.className, className)}
      style={{
        ...themeOverrideStyles,
        ...style,
        paddingTop: toCssValue(paddingY ?? 64),
        paddingBottom: toCssValue(paddingY ?? 64),
        maxWidth: maxWidth ? toCssValue(maxWidth) : undefined,
        marginLeft: "auto",
        marginRight: "auto",
        paddingLeft: toCssValue(containerPadding ?? 16),
        paddingRight: toCssValue(containerPadding ?? 16),
      }}
      {...props}
    >
      <div
        className={cn({
          "text-left": align === "left",
          "text-center": align === "center",
          "text-right": align === "right",
        })}
      >
        <h2 className="text-3xl font-bold mb-4 text-foreground">{title}</h2>
        <p className="text-muted-foreground mb-8">{subtitle}</p>
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 max-w-md"
          style={{
            marginLeft: align === "left" ? undefined : "auto",
            marginRight: align === "right" ? undefined : "auto",
          }}
        >
          <Input
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 bg-background border-input"
          />
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "..." : buttonText}
          </Button>
        </form>
      </div>
    </section>
  );
};

NewsletterSectionComponent.displayName = "NewsletterSection";

// Memoize for performance
export const NewsletterSection = React.memo(NewsletterSectionComponent);

// Add metadata for AI
(NewsletterSection as any).__metadata = {
  tier: 3,
  name: "NewsletterSection",
  description: "Newsletter subscription form with email input and validation",
  supportsThemeOverride: true,
  supportsClassName: true,
  supportsStyle: true,
  isMemoized: true,
  example: `<NewsletterSection settings={{ title: "Stay Updated", buttonText: "Subscribe" }} />`,
};

export default NewsletterSection;
