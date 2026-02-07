/**
 * Vendor Theme Wrapper
 *
 * Client component that wraps vendor content with theme provider
 */
"use client";

import { ReactNode } from "react";
import { VendorThemeProvider } from "@spotcove/render-runtime";

interface Props {
  children: ReactNode;
  themeSettings: any;
  vendorSlug: string;
}

export default function VendorThemeWrapper({
  children,
  themeSettings,
  vendorSlug,
}: Props) {
  return (
    <VendorThemeProvider themeSettings={themeSettings} vendorSlug={vendorSlug}>
      {children}
    </VendorThemeProvider>
  );
}
