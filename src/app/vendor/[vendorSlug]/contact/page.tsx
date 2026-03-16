/**
 * Vendor Contact Page (frontend app)
 */

import VendorThemeWrapper from "../VendorThemeWrapper";

interface Props {
  params: { vendorSlug: string };
}

export default async function VendorContactPage({ params }: Props) {
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
        `${apiBase}/api/storefront/vendor/${vendorSlug}?page=contact`,
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
  const vendorName = data?.vendor?.name ?? vendorSlug;

  return (
    <VendorThemeWrapper themeSettings={themeSettings} vendorSlug={vendorSlug}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl font-bold mb-6">
            {contentJSON.heading ?? `Contact ${vendorName}`}
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            {contentJSON.body ??
              "You can update this text anytime from Vendor Admin > Content."}
          </p>
          {contentJSON.email && (
            <p className="text-base">
              Email:{" "}
              <a
                href={`mailto:${contentJSON.email}`}
                className="text-primary hover:underline"
              >
                {contentJSON.email}
              </a>
            </p>
          )}
          {contentJSON.phone && (
            <p className="text-base mt-2">Phone: {contentJSON.phone}</p>
          )}
        </div>
      </div>
    </VendorThemeWrapper>
  );
}
