"use client";

import { VendorThemeProvider } from "@/features/themes/VendorThemeContext";
import VendorLayoutRenderer from "@/features/themes/VendorLayoutRenderer";
import layoutData from "../../../data/test-layout.json";
import themeData from "../../../data/test-theme.json";

export default function RenderTestPage() {
  // Mock vendor data matching the parent project's structure
  const mockVendor = {
    id: "test-vendor-1",
    name: "Test Vendor",
    slug: "test-vendor",
    selected_layout: "custom",
    custom_theme_settings: themeData,
  };

  const mockLayoutMeta = {
    id: "layout-1",
    name: "Test Layout",
    slug: "custom",
    demo_json: layoutData,
  };

  return (
    <VendorThemeProvider
      vendor={mockVendor}
      vendorTheme={mockVendor}
      availableLayouts={[mockLayoutMeta]}
      availableThemes={[]}
    >
      <VendorLayoutRenderer>
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-4">Render Test Page</h1>
          <p className="text-gray-600">
            Testing VendorLayoutRenderer with test-layout.json and test-theme.json
          </p>
        </div>
      </VendorLayoutRenderer>
    </VendorThemeProvider>
  );
}
