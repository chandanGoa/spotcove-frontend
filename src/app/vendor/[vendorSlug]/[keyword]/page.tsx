/**
 * Vendor Keyword Page
 */

import { getVendorLayoutConfig, VENDOR_REGISTRY } from "@/data/vendor-registry";
import VendorKeywordClient from "./VendorKeywordClient";
import fs from "fs";
import path from "path";

interface VendorKeywordPageProps {
  params: {
    vendorSlug: string;
    keyword: string;
  };
}

function VendorNotFound({
  vendorSlug,
  keyword,
}: {
  vendorSlug: string;
  keyword: string;
}) {
  const vendorEntry = VENDOR_REGISTRY[vendorSlug];
  const availableVendors = Object.keys(VENDOR_REGISTRY);
  const availableKeywords = vendorEntry ? Object.keys(vendorEntry) : [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--background))" }}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Vendor not found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find a layout for{" "}
            <span className="font-semibold">{vendorSlug}</span> /
            <span className="font-semibold"> {keyword}</span>.
          </p>

          {vendorEntry ? (
            <div className="text-left bg-card border rounded-lg p-4">
              <p className="font-semibold mb-2">
                Available layouts for "{vendorSlug}":
              </p>
              <div className="space-y-2">
                {availableKeywords.map((k) => (
                  <a
                    key={k}
                    href={`/vendor/${vendorSlug}/${k}`}
                    className="block text-primary hover:underline"
                  >
                    /vendor/{vendorSlug}/{k}
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-left bg-card border rounded-lg p-4">
              <p className="font-semibold mb-2">Available vendors:</p>
              <div className="space-y-2">
                {availableVendors.map((vendor) => (
                  <a
                    key={vendor}
                    href={`/vendor/${vendor}/minimal`}
                    className="block text-primary hover:underline"
                  >
                    /vendor/{vendor}/minimal
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <a href="/" className="text-primary hover:underline">
              Back to homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function VendorKeywordPage({
  params,
}: VendorKeywordPageProps) {
  const { vendorSlug, keyword } = params;
  const layoutConfig = getVendorLayoutConfig(vendorSlug, keyword);
  
  if (!layoutConfig) {
    return <VendorNotFound vendorSlug={vendorSlug} keyword={keyword} />;
  }
  
  const dataDir = path.join(process.cwd(), "src", "data");
  
  let layoutJson: any;
  let themeJson: any;
  
  try {
    const layoutPath = path.join(dataDir, layoutConfig.layoutJsonPath);
    const themePath = path.join(dataDir, layoutConfig.themeJsonPath);
    
    layoutJson = JSON.parse(fs.readFileSync(layoutPath, "utf-8"));
    themeJson = JSON.parse(fs.readFileSync(themePath, "utf-8"));
  } catch (error) {
    console.error(
      `Failed to load vendor layout files for ${vendorSlug}/${keyword}:`,
      error,
    );
    return <VendorNotFound vendorSlug={vendorSlug} keyword={keyword} />;
  }
  
  return (
    <VendorKeywordClient
      vendorSlug={vendorSlug}
      keyword={keyword}
      layoutConfig={layoutConfig}
      layoutJson={layoutJson}
      themeJson={themeJson}
    />
  );
}
