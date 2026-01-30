/**
 * Vendor Homepage
 */

export default function VendorHomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">
          Vendor Storefront
        </h1>
        <p className="text-muted-foreground">
          This is the default vendor storefront page.
          Navigate to /vendor/[vendorSlug]/[keyword] to view specific layouts.
        </p>
      </div>
    </div>
  );
}
