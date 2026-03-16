/**
 * Vendor Products Page (frontend app)
 */

import VendorThemeWrapper from "../VendorThemeWrapper";

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
  const products: any[] = data?.products ?? [];
  const vendorName = data?.vendor?.name ?? vendorSlug;

  return (
    <VendorThemeWrapper themeSettings={themeSettings} vendorSlug={vendorSlug}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-8 text-center">
            {contentJSON.title ?? `${vendorName} Products`}
          </h1>

          {products.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No products found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <a
                  key={product.id}
                  href={`/vendor/${vendorSlug}/product/${product.slug ?? product.id}`}
                  className="group bg-card border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {product.image?.src && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image.src}
                      alt={product.image.alt ?? product.name}
                      className="w-full aspect-square object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {product.name}
                    </h2>
                    {product.price != null && (
                      <p className="text-primary font-bold mt-1">
                        ${Number(product.price).toFixed(2)}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </VendorThemeWrapper>
  );
}
