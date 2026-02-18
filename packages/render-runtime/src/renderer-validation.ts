/**
 * Renderer Validation Utilities
 *
 * Non-breaking validation that warns on unknown settings but does NOT prevent rendering.
 * All warnings are logged at console.warn() level with [Renderer] prefix.
 *
 * Status: FROZEN - These validations enforce the contract defined in docs/RENDERER_CONTRACT.md
 * Last Updated: December 27, 2025
 */

// ============================================================================
// KNOWN SETTINGS
// ============================================================================

/**
 * Element-level settings that the renderer understands and processes
 */
const KNOWN_ELEMENT_SETTINGS = new Set([
  "className", // Tailwind classes (applied to DOM)
  "style", // CSS properties (applied to DOM)
  "layout", // Layout hints (informational only)
  "columns", // Column count (informational only)
  "alignment", // text alignment (applied to textAlign)
  "maxWidth", // max-width (applied to DOM)
  "geometry", // Playwright-derived column geometry (applied to layout)
  "sectionCategory", // Section category from mining (informational)
  "layoutAnalysis", // Quality heuristics analysis (informational)
]);

/**
 * Component types registered in VendorLayoutRenderer
 * Maps to componentMappers in VendorLayoutRenderer.tsx
 */
const REGISTERED_COMPONENT_TYPES = new Set([
  "header",
  "navigation",
  "hero",
  "product-grid",
  "sidebar",
  "footer",
  "newsletter",
  "featured-products",
  "featured-services",
  "collections",
  "categories-grid",
  "heading",
  "text",
  "button",
  "image",
  "divider",
  "spacer",
  "Content",
  "our-process",
  "process-section",
  "how-it-works",
  "vendor-cta",
  "promoter-cta",
  "contact",
  "contact-section",
  "rich-text",
]);

/**
 * Theme override settings that are processed
 */
const KNOWN_THEME_OVERRIDE_SETTINGS = new Set(["colors", "fonts"]);

/**
 * Component-specific known settings by component type
 * This is informational for validation; components can accept any settings
 */
const COMPONENT_KNOWN_SETTINGS: Record<string, Set<string>> = {
  hero: new Set([
    "title",
    "subtitle",
    "backgroundImage",
    "buttonText",
    "buttonLink",
  ]),
  "featured-products": new Set(["title", "limit", "showPrices"]),
  "featured-services": new Set([
    "title",
    "columns",
    "showRating",
    "showBadge",
    "showDescription",
    "paddingY",
    "maxWidth",
    "align",
    "gap",
    "containerPadding",
    "services",
  ]),
  "product-grid": new Set(["title", "limit", "showPrices"]),
  collections: new Set(["title", "columns", "showDescription"]),
  "categories-grid": new Set([
    "title",
    "columns",
    "showDescription",
    "layout",
    "paddingY",
    "containerPadding",
  ]),
  newsletter: new Set(["title", "subtitle", "placeholder"]),
  "how-it-works": new Set([
    "title",
    "subtitle",
    "steps",
    "columns",
    "align",
    "paddingY",
    "gap",
    "maxWidth",
    "containerPadding",
  ]),
  "vendor-cta": new Set([
    "title",
    "subtitle",
    "buttonText",
    "buttonLink",
    "secondaryText",
    "align",
    "paddingY",
    "maxWidth",
    "containerPadding",
    "variant",
  ]),
  "promoter-cta": new Set([
    "title",
    "subtitle",
    "buttonText",
    "buttonLink",
    "secondaryText",
    "align",
    "paddingY",
    "maxWidth",
    "containerPadding",
    "variant",
  ]),
  heading: new Set(["text", "level", "align", "color", "size", "className"]),
  text: new Set(["content", "align", "color", "size", "className"]),
  button: new Set(["text", "backgroundColor", "color", "className"]),
  image: new Set(["src", "alt", "align", "maxWidth", "height", "className"]),
  spacer: new Set(["height", "className"]),
  divider: new Set(["color", "thickness", "className"]),
  header: new Set(["title", "className"]),
  navigation: new Set(["title", "className"]),
  sidebar: new Set(["title", "className"]),
  footer: new Set(["className"]),
  "our-process": new Set(["className"]),
  "process-section": new Set(["className"]),
  contact: new Set(["className"]),
  "contact-section": new Set(["className"]),
  "rich-text": new Set(["content", "className"]),
  Content: new Set(["content", "className"]),
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate element-level settings and return warnings for unknown ones
 *
 * @param settings - The settings object from layout JSON
 * @param elementId - Element ID for warning context
 * @returns Array of warning messages (empty if all settings are known)
 */
export function validateLayoutSettings(
  settings: unknown,
  elementId: string,
): string[] {
  const warnings: string[] = [];

  if (!settings || typeof settings !== "object") {
    return warnings; // Empty settings object is valid
  }

  const settingsObj = settings as Record<string, unknown>;

  // Check for unknown settings
  Object.keys(settingsObj).forEach((key) => {
    if (!KNOWN_ELEMENT_SETTINGS.has(key)) {
      warnings.push(
        `[Renderer] Element '${elementId}': unknown setting '${key}' (will be ignored)`,
      );
    }
  });

  // Validate nested 'layout' object if present
  if (settingsObj.layout && typeof settingsObj.layout === "object") {
    const layoutObj = settingsObj.layout as Record<string, unknown>;
    const validLayoutKeys = new Set([
      "columns",
      "gap",
      "alignment",
      "maxWidth",
    ]);

    Object.keys(layoutObj).forEach((key) => {
      if (!validLayoutKeys.has(key)) {
        warnings.push(
          `[Renderer] Element '${elementId}': unknown layout hint '${key}'`,
        );
      }
    });
  }

  // Validate 'style' object if present
  if (settingsObj.style && typeof settingsObj.style === "object") {
    // style object is free-form CSS; no validation needed
    // but log if it's not a plain object
    if (Array.isArray(settingsObj.style)) {
      warnings.push(
        `[Renderer] Element '${elementId}': 'style' must be an object, not an array`,
      );
    }
  }

  return warnings;
}

/**
 * Validate component type and return warnings for unknown types
 *
 * @param componentType - The type from component definition
 * @param componentId - Component ID for warning context
 * @returns Array of warning messages; empty if type is registered
 */
export function validateComponentType(
  componentType: unknown,
  componentId: string,
): string[] {
  const warnings: string[] = [];

  if (typeof componentType !== "string") {
    warnings.push(
      `[Renderer] Component '${componentId}': type must be a string, got ${typeof componentType}`,
    );
    return warnings;
  }

  if (!REGISTERED_COMPONENT_TYPES.has(componentType)) {
    warnings.push(
      `[Renderer] Component '${componentId}': unknown component type '${componentType}' (will fallback to 'rich-text')`,
    );
  }

  return warnings;
}

/**
 * Validate component settings and return warnings for unknown ones
 *
 * Note: Components are flexible and can accept any settings.
 * This validation is informational only.
 *
 * @param componentType - Component type (for known settings lookup)
 * @param settings - Component settings object
 * @param componentId - Component ID for warning context
 * @returns Array of warning messages (informational; components decide what to accept)
 */
export function validateComponentSettings(
  componentType: unknown,
  settings: unknown,
  componentId: string,
): string[] {
  const warnings: string[] = [];

  if (!settings || typeof settings !== "object") {
    return warnings; // Empty settings is valid
  }

  if (typeof componentType !== "string") {
    return warnings; // Type validation happens elsewhere
  }

  const settingsObj = settings as Record<string, unknown>;
  const knownSettings = COMPONENT_KNOWN_SETTINGS[componentType];

  // If we don't have known settings for this component, skip validation
  // (component may accept any settings)
  if (!knownSettings) {
    return warnings;
  }

  // Check for unknown settings (informational only - components decide)
  Object.keys(settingsObj).forEach((key) => {
    if (!knownSettings.has(key)) {
      // Don't warn about 'className' and 'style' which are standard
      if (key !== "className" && key !== "style") {
        // Log at debug level - components may have custom settings
        console.debug(
          `[Renderer] Component '${componentId}' (type: ${componentType}): ` +
            `setting '${key}' not in documented list (this is okay if the component supports it)`,
        );
      }
    }
  });

  return warnings;
}

/**
 * Validate theme override object
 *
 * @param themeOverride - Theme override object
 * @param componentId - Component ID for warning context
 * @returns Array of warning messages
 */
export function validateThemeOverride(
  themeOverride: unknown,
  componentId: string,
): string[] {
  const warnings: string[] = [];

  if (!themeOverride || typeof themeOverride !== "object") {
    return warnings; // No override is valid
  }

  const overrideObj = themeOverride as Record<string, unknown>;

  // Check for unknown override keys
  Object.keys(overrideObj).forEach((key) => {
    if (!KNOWN_THEME_OVERRIDE_SETTINGS.has(key)) {
      warnings.push(
        `[Renderer] Component '${componentId}': unknown theme override '${key}' (will be ignored)`,
      );
    }
  });

  // Validate colors object if present
  if (overrideObj.colors && typeof overrideObj.colors === "object") {
    const colorsObj = overrideObj.colors as Record<string, unknown>;
    Object.entries(colorsObj).forEach(([colorName, colorValue]) => {
      if (typeof colorValue !== "string") {
        warnings.push(
          `[Renderer] Component '${componentId}': theme color '${colorName}' ` +
            `must be a string, got ${typeof colorValue}`,
        );
      }
    });
  }

  return warnings;
}

/**
 * Validate an entire layout JSON structure
 *
 * @param layout - Layout JSON object (either elements or zones format)
 * @returns Array of warning messages
 */
export function validateLayout(layout: unknown): string[] {
  const warnings: string[] = [];

  if (!layout || typeof layout !== "object") {
    return warnings; // No layout is valid (uses default)
  }

  const layoutObj = layout as Record<string, unknown>;

  // Check for elements format
  if (layoutObj.elements && Array.isArray(layoutObj.elements)) {
    const elements = layoutObj.elements as any[];
    elements.forEach((element, idx) => {
      if (element && typeof element === "object") {
        const elementId = element.id || `element-${idx}`;

        // Validate element settings
        warnings.push(...validateLayoutSettings(element.settings, elementId));

        // Validate components in element
        if (Array.isArray(element.components)) {
          element.components.forEach((component: any, cIdx: number) => {
            const componentId = component?.id || `component-${cIdx}`;
            warnings.push(
              ...validateComponentType(component?.type, componentId),
            );
            warnings.push(
              ...validateComponentSettings(
                component?.type,
                component?.settings,
                componentId,
              ),
            );
            warnings.push(
              ...validateThemeOverride(component?.themeOverride, componentId),
            );
          });
        }

        // Recursively validate children
        if (Array.isArray(element.children)) {
          const childLayout = { elements: element.children };
          warnings.push(...validateLayout(childLayout));
        }
      }
    });
  }

  // Check for zones format (legacy)
  if (layoutObj.zones && Array.isArray(layoutObj.zones)) {
    const zones = layoutObj.zones as any[];
    zones.forEach((zone, zIdx) => {
      if (zone && typeof zone === "object" && Array.isArray(zone.components)) {
        zone.components.forEach((component: any, cIdx: number) => {
          const componentId = component?.id || `component-${cIdx}`;
          warnings.push(...validateComponentType(component?.type, componentId));
          warnings.push(
            ...validateComponentSettings(
              component?.type,
              component?.settings,
              componentId,
            ),
          );
          warnings.push(
            ...validateThemeOverride(component?.themeOverride, componentId),
          );
        });
      }
    });
  }

  return warnings;
}

/**
 * Normalize element settings to extract known properties
 *
 * This is used internally by the renderer to safely extract known settings
 * without throwing errors on unknown properties.
 *
 * @param settings - Raw settings object from JSON
 * @returns Normalized settings with only known properties
 */
export type GeometrySettings = {
  columns: number;
  ratios: number[];
  gap?: number;
  // Legacy fields for backward compatibility
  columnCount?: number;
  columnRatios?: number[];
  columnGaps?: number[];
  layoutVariant?: "single" | "two-column" | "three-column" | "asymmetric";
  source?: string;
};

export function normalizeSettings(settings: unknown): {
  className: string;
  style: React.CSSProperties;
  layout: Record<string, unknown>;
  columns?: number;
  alignment?: string;
  maxWidth?: string;
  geometry?: GeometrySettings;
} {
  if (!settings || typeof settings !== "object") {
    return {
      className: "",
      style: {},
      layout: {},
    };
  }

  const settingsObj = settings as Record<string, unknown>;

  return {
    className:
      typeof settingsObj.className === "string" ? settingsObj.className : "",

    style:
      settingsObj.style && typeof settingsObj.style === "object"
        ? (settingsObj.style as React.CSSProperties)
        : {},

    layout:
      settingsObj.layout && typeof settingsObj.layout === "object"
        ? (settingsObj.layout as Record<string, unknown>)
        : {},

    columns:
      typeof settingsObj.columns === "number"
        ? settingsObj.columns
        : typeof settingsObj.columns === "string"
          ? Number(settingsObj.columns)
          : undefined,

    alignment:
      typeof settingsObj.alignment === "string"
        ? settingsObj.alignment
        : undefined,

    maxWidth:
      typeof settingsObj.maxWidth === "string"
        ? settingsObj.maxWidth
        : undefined,

    geometry:
      settingsObj.geometry && typeof settingsObj.geometry === "object"
        ? (settingsObj.geometry as GeometrySettings)
        : undefined,
  };
}

/**
 * Log all validation warnings for a layout
 *
 * Convenience function to validate and log in one call
 *
 * @param layout - Layout JSON to validate
 * @param logFn - Logger function (defaults to console.warn)
 */
export function logLayoutValidation(
  layout: unknown,
  logFn: (message: string) => void = console.warn,
): void {
  const warnings = validateLayout(layout);
  warnings.forEach((warning) => logFn(warning));
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LayoutValidationWarning = string;
export type ComponentValidationWarning = string;
export type ThemeValidationWarning = string;

// ============================================================================
// FROZEN RENDERER MARKER
// ============================================================================

/**
 * This marker indicates that renderer behavior is FROZEN.
 *
 * Any changes to:
 * - Validation rules
 * - Component registry
 * - Settings processing
 * - Fallback behavior
 *
 * Require careful consideration and should be documented in:
 * - docs/RENDERER_CONTRACT.md (update version, add migration guide)
 * - CHANGELOG.md (document breaking changes)
 * - commit message (explain why)
 *
 * The renderer is a critical piece of infrastructure that affects:
 * - All custom vendor layouts
 * - Admin layout builder
 * - AI layout generation
 * - Customer experience
 */
export const FROZEN_RENDERER_VERSION = "2.1" as const;

/**
 * Get current frozen renderer version
 *
 * Useful for debugging and ensuring compatibility
 */
export function getRendererVersion(): typeof FROZEN_RENDERER_VERSION {
  return FROZEN_RENDERER_VERSION;
}
