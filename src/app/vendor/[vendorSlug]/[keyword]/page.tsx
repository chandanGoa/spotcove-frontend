/**
 * Vendor Keyword Page
 */

import { notFound } from "next/navigation";
import { getVendorLayoutConfig } from "@/data/vendor-registry";
import VendorKeywordClient from "./VendorKeywordClient";
import fs from "fs";
import path from "path";

interface VendorKeywordPageProps {
  params: {
    vendorSlug: string;
    keyword: string;
  };
}

export default async function VendorKeywordPage({ params }: VendorKeywordPageProps) {
  const { vendorSlug, keyword } = params;
  const layoutConfig = getVendorLayoutConfig(vendorSlug, keyword);
  
  if (!layoutConfig) {
    notFound();
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
    console.error(`Failed to load vendor layout files for ${vendorSlug}/${keyword}:`, error);
    notFound();
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
