// Render Runtime - Content
// Presentation Component (Tier 1)
import React, { memo } from "react";
import { cn } from "../utils";
import { getThemeOverrideStyles } from "../theme-wrapper";

export interface ContentSettings {
  title?: string;
  content?: string;
  alignment?: "left" | "center" | "right";
  subtype?: "content-longform" | "content-feature";
}

export interface ContentProps {
  settings?: ContentSettings;
  themeOverride?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const Content = memo(function Content(props: ContentProps) {
  const { className, style, children, settings, themeOverride, ...rest } =
    props;
  const {
    title = "Content Section",
    content = "This is a flexible content section that can display text, descriptions, or any other content you want to showcase.",
    alignment = "left",
    subtype,
  } = settings || {};

  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);

  // Determine layout based on subtype
  const isLongform = subtype === "content-longform";
  const isFeature = subtype === "content-feature";

  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  // Longform: Vertical paragraph layout with larger text blocks
  if (isLongform) {
    return (
      <section
        className={cn("py-16", className)}
        style={{ ...themeOverrideStyles, ...style, backgroundColor: 'hsl(var(--background))' }}
        {...rest}
      >
        <article className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {title && (
            <h1
              className="text-4xl font-bold text-foreground mb-8"
              style={{
                fontFamily: "var(--font-heading, inherit)",
                marginBottom: "var(--spacing-2xl, 2rem)",
              }}
            >
              {title}
            </h1>
          )}
          <div
            className={cn(
              "prose prose-lg max-w-none leading-relaxed",
              alignmentClasses[alignment],
            )}
            style={{
              fontFamily: "var(--font-body, inherit)",
              fontSize: "var(--text-lg, 1.125rem)",
              lineHeight: "var(--leading-relaxed, 1.75)",
              color: "var(--text-color, hsl(var(--foreground)))",
            }}
          >
            {/* Split content by paragraphs for better readability */}
            {content
              ?.split("\n\n")
              .filter((para) => para.trim().length > 0)
              .map((para, idx) => (
                <p
                  key={idx}
                  style={{
                    marginBottom: "var(--spacing-lg, 1.5rem)",
                    textAlign:
                      alignment === "center"
                        ? "center"
                        : alignment === "right"
                          ? "right"
                          : "left",
                  }}
                >
                  {para}
                </p>
              ))}
          </div>
        </article>
        {children}
      </section>
    );
  }

  // Feature: Icon/heading/text repeating cards (3-column grid)
  if (isFeature) {
    // Parse content as JSON array of features or as pipe-separated items
    let features: { title: string; description: string; icon?: string }[] = [];

    try {
      // Try parsing as JSON
      if (content && content.trim().startsWith("[")) {
        features = JSON.parse(content);
      } else if (content) {
        // Parse as pipe-separated: "Title 1|Description 1|icon1;Title 2|Description 2|icon2"
        features = content
          .split(";")
          .map((item) => {
            const [title, description, icon] = item.split("|");
            return {
              title: title?.trim() || "",
              description: description?.trim() || "",
              icon: icon?.trim(),
            };
          })
          .filter((f) => f.title || f.description);
      }
    } catch {
      // Fallback: treat entire content as single feature
      features = [{ title, description: content }];
    }

    return (
      <section
        className={cn("py-16", className)}
        style={{ ...themeOverrideStyles, ...style, backgroundColor: 'hsl(var(--background))' }}
        {...rest}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {title && (
            <h2
              className="text-3xl font-bold text-foreground mb-12 text-center"
              style={{
                fontFamily: "var(--font-heading, inherit)",
                marginBottom: "var(--spacing-3xl, 3rem)",
              }}
            >
              {title}
            </h2>
          )}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            style={{ gap: "var(--spacing-2xl, 2rem)" }}
          >
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center p-6 rounded-lg"
                style={{
                  background: "var(--card-background, hsl(var(--card)))",
                  borderRadius: "var(--radius-lg, 0.5rem)",
                  border: "1px solid hsl(var(--border))",
                  padding: "var(--spacing-lg, 1.5rem)",
                  transition: "all 0.3s ease",
                }}
              >
                {feature.icon && (
                  <div
                    className="mb-4 text-4xl"
                    style={{ marginBottom: "var(--spacing-md, 1rem)" }}
                  >
                    {feature.icon}
                  </div>
                )}
                <h3
                  className="text-xl font-semibold text-foreground mb-2"
                  style={{
                    fontFamily: "var(--font-heading, inherit)",
                    fontSize: "var(--text-xl, 1.25rem)",
                    fontWeight: "600",
                    marginBottom: "var(--spacing-sm, 0.5rem)",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-muted-foreground leading-relaxed"
                  style={{
                    fontFamily: "var(--font-body, inherit)",
                    fontSize: "var(--text-sm, 0.875rem)",
                    color:
                      "var(--text-secondary, hsl(var(--muted-foreground)))",
                    lineHeight: "var(--leading-relaxed, 1.625)",
                  }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        {children}
      </section>
    );
  }

  // Default: Generic content section
  return (
    <section
      className={cn("py-16", className)}
      style={{ ...themeOverrideStyles, ...style, backgroundColor: 'hsl(var(--background))' }}
      {...rest}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "prose prose-lg max-w-none",
            alignmentClasses[alignment],
          )}
        >
          {title && (
            <h2 className="text-3xl font-bold text-foreground mb-6">{title}</h2>
          )}
          <div className="text-muted-foreground leading-relaxed">{content}</div>
        </div>
      </div>
      {children}
    </section>
  );
});

Content.displayName = "Content";
(Content as any).__metadata = {
  tier: 3,
  name: "Content",
  description:
    "Flexible content section with subtype-aware layouts: longform (vertical paragraphs) or feature (icon+heading+text cards in 3-column grid)",
  supportsThemeOverride: true,
  supportsClassName: true,
  supportsStyle: true,
  isMemoized: true,
  subtypes: [
    {
      id: "content-longform",
      description: "Vertical paragraph layout with large readable text blocks",
      useCases: ["Blog posts", "Articles", "About pages", "Documentation"],
    },
    {
      id: "content-feature",
      description: "Icon + heading + text repeating cards in 3-column grid",
      useCases: ["Features list", "Services", "Benefits", "USPs"],
    },
  ],
  example: `<Content settings={{ 
    title: "Our Services",
    content: "Service 1|Description 1|🎯;Service 2|Description 2|⚡",
    subtype: "content-feature"
  }} />`,
};

export default Content;
