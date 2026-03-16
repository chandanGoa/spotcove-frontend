/**
 * Vendor Root Page
 */

import { getVendorLayoutConfig } from "@/data/vendor-registry";
import VendorKeywordClient from "./[keyword]/VendorKeywordClient";

interface VendorRootPageProps {
  params: {
    vendorSlug: string;
  };
}

export default async function VendorRootPage({ params }: VendorRootPageProps) {
  const { vendorSlug } = params;
  const keyword = "home";

  let initialData: {
    layoutJSON?: any;
    themeJSON?: any;
    contentJSON?: Record<string, any>;
    products?: any[];
    collections?: any[];
  } | null = null;

  const apiBase = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_CORE_URL ||
    ""
  ).replace(/\/$/, "");

  if (apiBase) {
    try {
      const res = await fetch(
        `${apiBase}/api/storefront/vendor/${vendorSlug}`,
        { next: { revalidate: 60 } },
      );
      if (res.ok) {
        const data = await res.json();
        if (!data.error) initialData = data;
      }
    } catch {
      // fall back to local registry
    }
  }

  if (!initialData) {
    const fallback = getVendorLayoutConfig(vendorSlug, keyword);
    if (fallback) {
      initialData = {
        layoutJSON: fallback.layoutJson,
        themeJSON: fallback.themeJson,
        contentJSON: {},
        products: [],
        collections: [],
      };
    }
  }

  return (
    <VendorKeywordClient
      vendorSlug={vendorSlug}
      keyword={keyword}
      initialData={initialData}
    />
  );
}
