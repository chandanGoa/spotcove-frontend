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

function buildSSRThemeCSS(vendorSlug: string, fallbackSettings: any): string {
  // Prefer the actual theme JSON from the vendor registry (has real colors/fonts)
  // over vendors.json which only stores overrides (usually empty).
  const registryEntry = VENDOR_REGISTRY[vendorSlug];
  const themeJson = registryEntry
    ? (Object.values(registryEntry)[0] as any)?.themeJson
    : null;

  const source = themeJson ?? fallbackSettings;
  if (!source) return "";

  const vars: string[] = [];

  const colors = source.colors ?? {};
  Object.entries(colors).forEach(([key, value]) => {
    if (typeof value === "string" && value) vars.push(`--${key}: ${value}`);
  });

  const fonts = source.fonts ?? {};
  if (
    typeof fonts.heading === "string" &&
    fonts.heading &&
    !fonts.heading.startsWith("var(")
  )
    vars.push(`--font-heading: ${fonts.heading}`);
  if (
    typeof fonts.body === "string" &&
    fonts.body &&
    !fonts.body.startsWith("var(")
  )
    vars.push(`--font-body: ${fonts.body}`);

  return vars.length ? `:root { ${vars.join("; ")} }` : "";
}

async function VendorLayout({ children, params }: Props) {
  const vendor = vendorsData.find(
    (v) => v.slug === params.vendorSlug && v.is_active,
  );

  if (!vendor) {
    notFound();
  }

  const fallbackSettings = vendor.custom_theme_settings || {};
  const ssrCSS = buildSSRThemeCSS(params.vendorSlug, fallbackSettings);

  return (
    <>
      {ssrCSS && <style dangerouslySetInnerHTML={{ __html: ssrCSS }} />}
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
