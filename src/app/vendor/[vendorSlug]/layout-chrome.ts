import { VENDOR_DOMAIN_MAP } from "@/data/vendor-domains";

type NavLink = { label: string; href: string };
type FooterSection = {
  title: string;
  items: Array<{ title: string; href: string }>;
};

type LayoutComponent = {
  id: string;
  type: string;
  settings?: Record<string, any>;
};

function findLayoutComponent(
  layout: any,
  types: string[],
): LayoutComponent | null {
  if (!layout) return null;

  const inComponents = (components: any[]): LayoutComponent | null => {
    for (const component of components ?? []) {
      if (types.includes(component?.type)) {
        return component as LayoutComponent;
      }
    }
    return null;
  };

  for (const zone of layout.zones ?? []) {
    const found = inComponents(zone.components);
    if (found) return found;
  }

  for (const element of layout.elements ?? []) {
    const found = inComponents(element.components);
    if (found) return found;

    const childFound = findLayoutComponent(
      { elements: element.children ?? [] },
      types,
    );
    if (childFound) return childFound;
  }

  return null;
}

function resolveLinks(links: NavLink[] | undefined, base: string): NavLink[] {
  if (!links || links.length === 0) {
    return [
      { label: "Home", href: base },
      { label: "Products", href: `${base}/products` },
      { label: "About", href: `${base}/about` },
      { label: "Contact", href: `${base}/contact` },
    ];
  }

  return links.map((link) => ({
    label: link.label,
    href:
      link.href === "/"
        ? base
        : link.href.startsWith("/vendor/")
          ? link.href
          : `${base}${link.href}`,
  }));
}

function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

function toVendorPath(href: string, base: string, vendorSlug: string): string {
  if (!href || isExternalHref(href)) return href;

  const normalizedHref = href.startsWith("/") ? href : `/${href}`;

  if (!base) {
    // On separate vendor domains, links should be root-relative.
    if (normalizedHref === "/") return "/";
    const ownVendorPrefix = `/vendor/${vendorSlug}`;
    if (normalizedHref === ownVendorPrefix) return "/";
    if (normalizedHref.startsWith(`${ownVendorPrefix}/`)) {
      return normalizedHref.slice(ownVendorPrefix.length) || "/";
    }
    return normalizedHref;
  }

  if (normalizedHref === "/") return base;
  if (normalizedHref.startsWith("/vendor/")) return normalizedHref;
  return `${base}${normalizedHref}`;
}

function resolveFooterLinks(
  sections: FooterSection[] | undefined,
  base: string,
  vendorSlug: string,
): FooterSection[] {
  if (!sections || sections.length === 0) {
    return [
      {
        title: "Shop",
        items: [{ title: "Products", href: `${base}/products` }],
      },
      {
        title: "Info",
        items: [
          { title: "About", href: `${base}/about` },
          { title: "Contact", href: `${base}/contact` },
        ],
      },
    ];
  }

  return sections.map((section) => ({
    title: section.title,
    items: section.items.map((item) => ({
      title: item.title,
      href: toVendorPath(item.href, base, vendorSlug),
    })),
  }));
}

function getVendorLinkBase(vendorSlug: string, requestHost?: string): string {
  const host = (requestHost ?? "").split(":")[0].toLowerCase();
  const fallback = `/vendor/${vendorSlug}`;
  if (!host) return fallback;

  const isLocalhost = host.includes("localhost");
  const isIpAddress = /^\d+\.\d+\.\d+\.\d+$/.test(host);
  const mappedVendor = VENDOR_DOMAIN_MAP[host];
  const isCustomVendorDomain = mappedVendor === vendorSlug;

  const hostParts = host.split(".");
  const subdomain = hostParts[0];
  const isVendorSubdomain =
    !isLocalhost &&
    !isIpAddress &&
    hostParts.length >= 3 &&
    subdomain === vendorSlug &&
    subdomain !== "www" &&
    subdomain !== "demo";

  return isCustomVendorDomain || isVendorSubdomain ? "" : fallback;
}

export function buildChromeLayout(
  layoutJSON: any,
  vendorSlug: string,
  middleComponent: LayoutComponent,
  requestHost?: string,
) {
  const base = getVendorLinkBase(vendorSlug, requestHost);
  const navComponent = findLayoutComponent(layoutJSON, [
    "navigation",
    "header",
  ]);
  const footerComponent = findLayoutComponent(layoutJSON, ["footer"]);

  return {
    elements: [
      {
        id: "subpage-root",
        type: "container",
        settings: { className: "min-h-screen" },
        components: [
          {
            id: navComponent?.id ?? "subpage-nav",
            type: "navigation",
            settings: {
              ...(navComponent?.settings ?? {}),
              brandName: navComponent?.settings?.brandName ?? vendorSlug,
              showSearch: false,
              links: (
                resolveLinks(navComponent?.settings?.links, base) || []
              ).map((link) => ({
                label: link.label,
                href: toVendorPath(link.href, base, vendorSlug),
              })),
            },
          },
          middleComponent,
          {
            id: footerComponent?.id ?? "subpage-footer",
            type: "footer",
            settings: {
              ...(footerComponent?.settings ?? {}),
              brandName: footerComponent?.settings?.brandName ?? vendorSlug,
              links: resolveFooterLinks(
                footerComponent?.settings?.links,
                base,
                vendorSlug,
              ),
            },
          },
        ],
      },
    ],
  };
}
