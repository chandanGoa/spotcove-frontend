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

async function VendorLayout({ children, params }: Props) {
  const vendor = vendorsData.find(v => v.slug === params.vendorSlug && v.is_active);
  
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

  const layout = {
    metadata: {
      name: `${vendor.name} Layout`,
      version: "1.0",
    },
    elements: [],
  };

  return (
    <VendorThemeWrapper
      themeSettings={themeSettings}
      layout={layout}
      vendorSlug={params.vendorSlug}
    >
      {children}
    </VendorThemeWrapper>
  );
}

export default VendorLayout;
