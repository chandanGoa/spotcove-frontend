import vendorDomains from "@/data/vendor-domains.json";

export interface VendorDomainEntry {
  domain: string;
  vendorSlug: string;
}

export const VENDOR_DOMAIN_MAP: Record<string, string> = Object.fromEntries(
  (vendorDomains as VendorDomainEntry[]).map((entry) => [
    entry.domain.toLowerCase(),
    entry.vendorSlug,
  ])
);

