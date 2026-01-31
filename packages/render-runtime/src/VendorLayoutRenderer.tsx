/**
 * VendorLayoutRenderer - Render Runtime Version
 * 
 * ⚠️ FROZEN FILE - DO NOT MODIFY WITHOUT CONTRACT CHANGE ⚠️
 * See: RENDER_RUNTIME_CONTRACT.md
 * 
 * Core layout rendering engine for @spotcove/render-runtime
 * This is a minimal copy of the core renderer with ALL dependencies removed
 * 
 * STRICT RULES:
 * - NO database imports (Supabase, Drizzle)
 * - NO API route imports
 * - NO auth imports
 * - NO server components
 * - NO cart/feature logic
 * - ONLY accepts layout JSON and component data via props
 * 
 * This file successfully rendered real data in __render_test__/
 * Any changes MUST preserve this rendering capability
 */
"use client";

import React, { useMemo } from "react";
import { useVendorTheme } from "./VendorThemeContext";
import { HeroSection } from "./components/HeroSection";
import { NewsletterSection } from "./components/NewsletterSection";
import { Content } from "./components/Content";
import ProductsSection from "./components/ProductsSection";
import CollectionsGrid from "./components/CollectionsGrid";
import FeaturedProducts from "./components/FeaturedProducts";
import SimpleNavbar from "./components/SimpleNavbar";
import MainFooter from "./components/MainFooter";
import { getThemeOverrideStyles } from "./theme-wrapper";
import { cn } from "./utils";
import {
  validateComponentType,
  validateComponentSettings,
  validateThemeOverride,
  validateLayoutSettings,
  normalizeSettings,
} from "./renderer-validation";

// Component registry for rendering
const componentMappers: Record<string, React.ComponentType<any>> = {
  header: HeaderComponent,
  navigation: NavigationComponent,
  hero: HeroSection,
  "product-grid": ProductsSection,
  sidebar: SidebarComponent,
  footer: FooterComponent,
  newsletter: NewsletterSection,
  "featured-products": FeaturedProducts,
  collections: CollectionsGrid,
  heading: HeadingComponent,
  text: TextComponent,
  button: ButtonComponent,
  image: ImageComponent,
  divider: DividerComponent,
  spacer: SpacerComponent,
  Content: Content,
  "rich-text": Content,
};

interface BasicModuleComponentProps {
  settings?: any;
  themeOverride?: any;
  className?: string;
  style?: React.CSSProperties;
  type?: string;
}

function NavigationComponent({
  settings,
  themeOverride,
  className,
  style,
}: BasicModuleComponentProps) {
  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);
  return (
    <div
      className={cn(settings?.className, className)}
      style={{ ...themeOverrideStyles, ...style }}
    >
      <SimpleNavbar settings={settings} themeOverride={themeOverride} />
    </div>
  );
}

function FooterComponent({
  settings,
  themeOverride,
  className,
  style,
}: BasicModuleComponentProps) {
  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);
  return (
    <div
      className={cn(settings?.className, className)}
      style={{ ...themeOverrideStyles, ...style }}
    >
      <MainFooter settings={settings} themeOverride={themeOverride} />
    </div>
  );
}

interface VendorLayoutRendererProps {
  children?: React.ReactNode;
  componentData?: Record<string, any>;
}

export default function VendorLayoutRenderer({
  children,
  componentData = {},
}: VendorLayoutRendererProps) {
  const { currentLayout, currentThemeSettings, vendorSlug } =
    useVendorTheme();

  console.log(`🎨 VendorLayoutRenderer for ${vendorSlug}:`, {
    hasCurrentLayout: !!currentLayout,
    layoutStructure: currentLayout ? Object.keys(currentLayout) : [],
  });

  // Memoized component rendering
  const renderedLayout = useMemo(() => {
    if (!currentLayout) {
      return <DefaultLayout>{children}</DefaultLayout>;
    }

    // Handle layout structure
    if (currentLayout.zones) {
      // Old format: zones with components
      return (
        <div className="min-h-screen">
          {currentLayout.zones.map((zone: any) => {
            const zoneComponents = Array.isArray(zone.components)
              ? zone.components
              : [];

            return (
              <div key={zone.id} data-zone={zone.id}>
                {zoneComponents.map((component: any) => {
                  const componentId = component?.id || "unknown";

                  validateComponentType(component?.type, componentId).forEach(
                    (warning) => console.warn(warning)
                  );
                  validateComponentSettings(
                    component?.type,
                    component?.settings,
                    componentId
                  ).forEach((warning) => console.debug(warning));
                  validateThemeOverride(
                    component?.themeOverride,
                    componentId
                  ).forEach((warning) => console.warn(warning));

                  const validatedType =
                    component &&
                    typeof component.type === "string" &&
                    componentMappers[component.type]
                      ? component.type
                      : "rich-text";

                  const Component = componentMappers[validatedType];
                  
                  // Inject component data if available
                  const componentSettings = {
                    ...component.settings,
                    ...(componentData[componentId] || {}),
                  };

                  return (
                    <Component
                      key={component.id}
                      settings={componentSettings}
                      themeOverride={component.themeOverride}
                      className={component.className}
                      style={component.style}
                      type={validatedType}
                      {...(componentData[componentId] || {})}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    } else if (currentLayout.elements) {
      // New format: nested elements structure
      return (
        <div className="min-h-screen">
          {renderLayoutElements(currentLayout.elements, componentData)}
        </div>
      );
    } else {
      // Fallback to default layout
      return <DefaultLayout>{children}</DefaultLayout>;
    }
  }, [currentLayout, children, componentData]);

  return renderedLayout;
}

// Recursive element rendering
function renderLayoutElements(elements: any[], componentData: Record<string, any> = {}) {
  if (!Array.isArray(elements)) {
    return null;
  }

  return elements.map((element) => {
    if (!element) {
      return null;
    }

    const { id, type } = element;
    const safeSettings = normalizeElementSettings(element.settings, id);

    const elementClassName = safeSettings.className;
    const elementStyle: React.CSSProperties = {
      ...safeSettings.style,
      ...(safeSettings.maxWidth ? { maxWidth: safeSettings.maxWidth } : {}),
      ...(safeSettings.alignment
        ? {
            textAlign:
              safeSettings.alignment as React.CSSProperties["textAlign"],
          }
        : {}),
      ...(safeSettings.geometry
        ? (() => {
            const columns =
              safeSettings.geometry.columns ??
              safeSettings.geometry.columnCount;
            const ratios =
              safeSettings.geometry.ratios ??
              safeSettings.geometry.columnRatios;
            const gap =
              safeSettings.geometry.gap ??
              (safeSettings.geometry.columnGaps &&
              safeSettings.geometry.columnGaps.length > 0
                ? Math.max(...safeSettings.geometry.columnGaps)
                : undefined);

            if (columns && columns > 1 && ratios && ratios.length > 0) {
              return {
                display: "grid",
                gridTemplateColumns: ratios
                  .map((ratio: number) => `${ratio * 100}%`)
                  .join(" "),
                ...(gap ? { gap: `${gap}px` } : {}),
              };
            }
            return {};
          })()
        : {}),
    };

    const componentList = Array.isArray(element.components)
      ? element.components
      : [];
    const childElements = Array.isArray(element.children)
      ? element.children
      : [];

    return (
      <div
        key={id}
        className={elementClassName}
        style={elementStyle}
        data-element-type={type}
        data-element-id={id}
      >
        {/* Render components in this element */}
        {componentList.map((component: any) => {
          const componentId = component?.id || "unknown";

          validateComponentType(component?.type, componentId).forEach(
            (warning) => console.warn(warning)
          );
          validateComponentSettings(
            component?.type,
            component?.settings,
            componentId
          ).forEach((warning) => console.debug(warning));
          validateThemeOverride(component?.themeOverride, componentId).forEach(
            (warning) => console.warn(warning)
          );

          const validatedType =
            component &&
            typeof component.type === "string" &&
            componentMappers[component.type]
              ? component.type
              : "rich-text";

          const Component = componentMappers[validatedType];
          
          // Inject component data if available
          const componentSettings = {
            ...component.settings,
            ...(componentData[componentId] || {}),
          };

          return (
            <Component
              key={component.id}
              settings={componentSettings}
              themeOverride={component.themeOverride}
              className={component.className}
              style={component.style}
              type={validatedType}
              {...(componentData[componentId] || {})}
            />
          );
        })}

        {/* Render child elements recursively */}
        {childElements.length > 0 && renderLayoutElements(childElements, componentData)}
      </div>
    );
  });
}

function normalizeElementSettings(
  settings: unknown,
  elementId?: string
): any {
  if (elementId) {
    validateLayoutSettings(settings, elementId).forEach((warning) =>
      console.warn(warning)
    );
  }

  return normalizeSettings(settings);
}

function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>{children}</div>
  );
}

// Simple helper components
function HeaderComponent({
  settings,
  themeOverride,
  className,
  style,
}: BasicModuleComponentProps) {
  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);
  return (
    <header
      className={cn(
        "bg-card shadow-sm border-b sticky top-0 z-50",
        settings?.className,
        className
      )}
      style={{ ...themeOverrideStyles, ...style }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-semibold text-foreground">
            {settings?.title || "Store"}
          </h1>
        </div>
      </div>
    </header>
  );
}

function SidebarComponent({
  settings,
  themeOverride,
  className,
  style,
}: BasicModuleComponentProps) {
  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);
  const categories = settings?.categories || [
    "Electronics",
    "Clothing",
    "Home & Garden",
    "Sports",
    "Books",
  ];

  return (
    <aside
      className={cn("w-64 bg-muted p-6", settings?.className, className)}
      style={{ ...themeOverrideStyles, ...style }}
    >
      <h3 className="font-semibold mb-4 text-foreground">
        {settings?.title || "Categories"}
      </h3>
      <ul className="space-y-2">
        {categories.map((category: string) => (
          <li key={category}>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary block py-1"
            >
              {category}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function HeadingComponent({
  settings,
  themeOverride,
  className,
  style,
}: BasicModuleComponentProps) {
  const level = settings?.level || 1;
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);

  let headingColor = settings?.color;
  if (!headingColor && themeOverride?.colors) {
    headingColor =
      themeOverride.colors["text-primary"] ||
      themeOverride.colors["primary"] ||
      themeOverride.colors["foreground"];
  }

  return (
    <Tag
      className={cn("font-bold", settings?.className, className)}
      style={{
        textAlign: settings?.align,
        fontSize: settings?.size,
        fontFamily: "var(--font-heading, inherit)",
        color: headingColor || "hsl(var(--foreground))",
        ...themeOverrideStyles,
        ...style,
      }}
    >
      {settings?.text || "Heading"}
    </Tag>
  );
}

function TextComponent({
  settings,
  themeOverride,
  className,
  style,
}: BasicModuleComponentProps) {
  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);

  let textColor = settings?.color;
  if (!textColor && themeOverride?.colors) {
    textColor =
      themeOverride.colors["text-primary"] ||
      themeOverride.colors["text-secondary"] ||
      themeOverride.colors["foreground"];
  }

  return (
    <p
      className={cn(settings?.className, className)}
      style={{
        fontFamily: "var(--font-body, inherit)",
        color: textColor || "hsl(var(--foreground))",
        textAlign: settings?.align,
        fontSize: settings?.size,
        ...themeOverrideStyles,
        ...style,
      }}
    >
      {settings?.content || "This is a text block. Add your content here."}
    </p>
  );
}

function ButtonComponent({
  settings,
  themeOverride,
  className,
  style,
}: BasicModuleComponentProps) {
  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);

  let buttonBgColor = settings?.backgroundColor;
  let buttonFgColor = settings?.color;

  if (!buttonBgColor && themeOverride?.colors) {
    buttonBgColor =
      themeOverride.colors["button"] ||
      themeOverride.colors["button-primary"] ||
      themeOverride.colors["primary"];
  }

  if (!buttonFgColor && themeOverride?.colors) {
    buttonFgColor =
      themeOverride.colors["button-text"] ||
      themeOverride.colors["text-primary"] ||
      "#ffffff";
  }

  return (
    <button
      className={cn("px-4 py-2 rounded", settings?.className || className)}
      style={{
        backgroundColor: buttonBgColor || "#3b82f6",
        color: buttonFgColor || "#ffffff",
        fontFamily: "var(--font-body, inherit)",
        ...themeOverrideStyles,
        ...style,
      }}
    >
      {settings?.text || "Button"}
    </button>
  );
}

function ImageComponent({
  settings,
  themeOverride,
  className,
  style,
}: BasicModuleComponentProps) {
  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);
  const alignment = settings?.align;
  const maxWidth = settings?.maxWidth;

  return (
    <div
      className={cn("flex", className)}
      style={{ ...themeOverrideStyles, ...style }}
    >
      <img
        src={settings?.src || "/placeholder-image.jpg"}
        alt={settings?.alt || "Image"}
        className={cn("max-w-full h-auto", settings?.className)}
        style={{
          maxWidth,
          height: settings?.height,
        }}
      />
    </div>
  );
}

function DividerComponent({
  settings,
  themeOverride,
  className,
  style,
}: BasicModuleComponentProps) {
  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);
  return (
    <hr
      className={cn("my-4", settings?.className || "border", className)}
      style={{
        borderColor: settings?.color ?? "hsl(var(--border))",
        borderWidth: settings?.thickness || "1px",
        ...themeOverrideStyles,
        ...style,
      }}
    />
  );
}

function SpacerComponent({
  settings,
  themeOverride,
  className,
  style,
}: BasicModuleComponentProps) {
  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);
  return (
    <div
      className={cn("w-full", settings?.className, className)}
      style={{
        height: settings?.height || "var(--space-gap, 1.5rem)",
        ...themeOverrideStyles,
        ...style,
      }}
    />
  );
}
