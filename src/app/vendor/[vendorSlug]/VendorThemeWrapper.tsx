/**
 * Vendor Theme Wrapper
 * 
 * Client component that wraps vendor content with theme provider
 */
"use client";

import { ReactNode } from "react";
import { VendorThemeProvider, VendorLayoutRenderer } from "@spotcove/render-runtime";

interface Props {
  children: ReactNode;
  themeSettings: any;
  layout: any;
  vendorSlug: string;
}

export default function VendorThemeWrapper({
  children,
  themeSettings,
  layout,
  vendorSlug,
}: Props) {
  return (
    <VendorThemeProvider
      themeSettings={themeSettings}
      layout={layout}
      vendorSlug={vendorSlug}
    >
      <VendorLayoutRenderer>
        {children}
      </VendorLayoutRenderer>
    </VendorThemeProvider>
  );
}
