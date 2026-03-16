/**
 * Vendor Storefront Layout
 */

import { ReactNode } from "react";
import { notFound } from "next/navigation";
import VendorThemeWrapper from "./VendorThemeWrapper";
import vendorsData from "@/data/vendors.json";
import { VENDOR_REGISTRY } from "@/data/vendor-registry";

type Props = {
  children: ReactNode;
  params: { vendorSlug: string };
};

/**
 * Build an inline script (not a <style>) that sets CSS custom properties
 * synchronously before the browser renders any content.
 *
 * A <style> in <body> only affects elements that come AFTER it; the browser
 * may already have rendered a frame using globals.css defaults by the time it
 * reaches a body <style>.  A synchronous inline <script> runs immediately when
 * the HTML parser hits it – before any paint – so the vars are correct on the
 * very first frame.
 */
function buildThemeScript(vendorSlug: string, fallbackSettings: any): string {
  const registryEntry = VENDOR_REGISTRY[vendorSlug];
  const themeJson = registryEntry
    ? (Object.values(registryEntry)[0] as any)?.themeJson
    : null;

  const source = themeJson ?? fallbackSettings;
  if (!source) return "";

  const setters: string[] = [];

  const colors = source.colors ?? {};
  Object.entries(colors).forEach(([key, value]) => {
    if (typeof value === "string" && value) {
      const safe = value.replace(/'/g, "\\'");
      setters.push(`r.setProperty('--${key}','${safe}')`);
    }
  });

  const fonts = source.fonts ?? {};
  if (
    typeof fonts.heading === "string" &&
    fonts.heading &&
    !fonts.heading.startsWith("var(")
  ) {
    const safe = fonts.heading.replace(/'/g, "\\'");
    setters.push(`r.setProperty('--font-heading','${safe}')`);
  }
  if (
    typeof fonts.body === "string" &&
    fonts.body &&
    !fonts.body.startsWith("var(")
  ) {
    const safe = fonts.body.replace(/'/g, "\\'");
    setters.push(`r.setProperty('--font-body','${safe}')`);
  }

  if (!setters.length) return "";

  // Wrapped in try/catch so any edge-case error never breaks the page
  return `(function(){try{var r=document.documentElement.style;${setters.join(";")}}catch(e){}})();`;
}

async function VendorLayout({ children, params }: Props) {
  const vendor = vendorsData.find(
    (v) => v.slug === params.vendorSlug && v.is_active,
  );

  if (!vendor) {
    notFound();
  }

  const fallbackSettings = vendor.custom_theme_settings || {};
  const themeScript = buildThemeScript(params.vendorSlug, fallbackSettings);

  return (
    <>
      {themeScript && (
        // eslint-disable-next-line @next/next/no-before-interactive-script-component
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      )}
      <VendorThemeWrapper
        themeSettings={fallbackSettings}
        vendorSlug={params.vendorSlug}
      >
        {children}
      </VendorThemeWrapper>
    </>
  );
}

export default VendorLayout;
