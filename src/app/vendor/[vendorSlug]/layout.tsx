/**
 * Vendor Storefront Layout
 */

import { ReactNode } from "react";
import { notFound } from "next/navigation";
import VendorThemeWrapper from "./VendorThemeWrapper";
import vendorsData from "@/data/vendors.json";

type Props = {
  children: ReactNode;
  params: { vendorSlug: string };
};

/** Generate :root { --var: value; } CSS for SSR injection (prevents FOUC) */
function generateSSRThemeCSS(themeSettings: any): string {
  if (!themeSettings) return "";
  const vars: string[] = [];

  const colors = themeSettings.colors ?? {};
  Object.entries(colors).forEach(([key, value]) => {
    if (typeof value === "string" && value) vars.push(`--${key}: ${value};`);
  });

  const fonts = themeSettings.fonts ?? {};
  if (typeof fonts.heading === "string" && fonts.heading)
    vars.push(`--font-heading: ${fonts.heading};`);
  if (typeof fonts.body === "string" && fonts.body)
    vars.push(`--font-body: ${fonts.body};`);

  if (!vars.length) return "";
  return `:root { ${vars.join(" ")} }`;
}

async function VendorLayout({ children, params }: Props) {
  const vendor = vendorsData.find(
    (v) => v.slug === params.vendorSlug && v.is_active,
  );

  if (!vendor) {
    notFound();
  }

  const themeSettings = vendor.custom_theme_settings || {
    colors: {
      primary: "#000000",
      secondary: "#ffffff",
      background: "#ffffff",
      foreground: "#000000",
    },
  };

  const ssrCSS = generateSSRThemeCSS(themeSettings);

  return (
    <>
      {ssrCSS && <style dangerouslySetInnerHTML={{ __html: ssrCSS }} />}
      <VendorThemeWrapper
        themeSettings={themeSettings}
        vendorSlug={params.vendorSlug}
      >
        {children}
      </VendorThemeWrapper>
    </>
  );
}

export default VendorLayout;
