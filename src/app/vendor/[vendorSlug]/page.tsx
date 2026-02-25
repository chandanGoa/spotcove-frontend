/**
 * Vendor Root Page
 */

import VendorKeywordClient from "./[keyword]/VendorKeywordClient";

interface VendorRootPageProps {
  params: {
    vendorSlug: string;
  };
}

export default function VendorRootPage({ params }: VendorRootPageProps) {
  return <VendorKeywordClient vendorSlug={params.vendorSlug} keyword="home" />;
}
