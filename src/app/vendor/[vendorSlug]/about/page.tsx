/**
 * Vendor About Page (frontend app)
 */

import VendorKeywordClient from "../[keyword]/VendorKeywordClient";
import { buildChromeLayout } from "../layout-chrome";
import { headers } from "next/headers";

interface Props {
  params: { vendorSlug: string };
}

export default async function VendorAboutPage({ params }: Props) {
  const { vendorSlug } = params;
  const requestHost = headers().get("host") ?? "";

  const apiBase = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_CORE_URL ||
    ""
  ).replace(/\/$/, "");

  let data: any = null;
  if (apiBase) {
    try {
      const res = await fetch(
        `${apiBase}/api/storefront/vendor/${vendorSlug}?page=about`,
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
  const vendorName = data?.vendor?.name ?? vendorSlug;

  const pageLayout = buildChromeLayout(
    layoutJSON,
    vendorSlug,
    {
      id: "about-content",
      type: "rich-text",
      settings: {
        title: contentJSON.title ?? `About ${vendorName}`,
        content:
          contentJSON.body ??
          "You can update this text anytime from Vendor Admin > Content.",
        className: "container mx-auto px-4 py-16 max-w-4xl",
      },
    },
    requestHost,
  );

  return (
    <VendorKeywordClient
      vendorSlug={vendorSlug}
      keyword="about"
      initialData={{
        layoutJSON: pageLayout,
        themeJSON: themeSettings,
        contentJSON: {},
        products: data?.products ?? [],
        collections: data?.collections ?? [],
      }}
    />
  );
}
