/**
 * Vendor Products Page (frontend app)
 */

import VendorKeywordClient from "../[keyword]/VendorKeywordClient";
import { buildChromeLayout } from "../layout-chrome";

interface Props {
  params: { vendorSlug: string };
}

export default async function VendorProductsPage({ params }: Props) {
  const { vendorSlug } = params;

  const apiBase = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_CORE_URL ||
    ""
  ).replace(/\/$/, "");

  let data: any = null;
  if (apiBase) {
    try {
      const res = await fetch(
        `${apiBase}/api/storefront/vendor/${vendorSlug}?page=products`,
        { next: { revalidate: 60 } },
      );
      if (res.ok) {
        const json = await res.json();
        if (!json.error) data = json;
      }
    } catch {
      // fall through to defaults
    }
  }

  const themeSettings = data?.themeJSON ?? {};
  const contentJSON = data?.contentJSON ?? {};
  const layoutJSON = data?.layoutJSON ?? null;
  const products: any[] = data?.products ?? [];
  const vendorName = data?.vendor?.name ?? vendorSlug;

  const pageLayout = buildChromeLayout(layoutJSON, vendorSlug, {
    id: "products-content",
    type: "product-grid",
    settings: {
      title: contentJSON.title ?? `${vendorName} Products`,
      columns: 4,
      align: "center",
      paddingY: 48,
    },
  });

  return (
    <VendorKeywordClient
      vendorSlug={vendorSlug}
      keyword="products"
      initialData={{
        layoutJSON: pageLayout,
        themeJSON: themeSettings,
        contentJSON: {},
        products,
        collections: data?.collections ?? [],
      }}
    />
  );
}
