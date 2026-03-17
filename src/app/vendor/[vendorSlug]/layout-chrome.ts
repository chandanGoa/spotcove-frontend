type NavLink = { label: string; href: string };
type FooterSection = { title: string; items: Array<{ title: string; href: string }> };

type LayoutComponent = {
  id: string;
  type: string;
  settings?: Record<string, any>;
};

function findLayoutComponent(layout: any, types: string[]): LayoutComponent | null {
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

    const childFound = findLayoutComponent({ elements: element.children ?? [] }, types);
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

function resolveFooterLinks(sections: FooterSection[] | undefined, base: string): FooterSection[] {
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
      href:
        item.href === "/"
          ? base
          : item.href.startsWith("/vendor/")
            ? item.href
            : `${base}${item.href}`,
    })),
  }));
}

export function buildChromeLayout(
  layoutJSON: any,
  vendorSlug: string,
  middleComponent: LayoutComponent,
) {
  const base = `/vendor/${vendorSlug}`;
  const navComponent = findLayoutComponent(layoutJSON, ["navigation", "header"]);
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
              links: resolveLinks(navComponent?.settings?.links, base),
            },
          },
          middleComponent,
          {
            id: footerComponent?.id ?? "subpage-footer",
            type: "footer",
            settings: {
              ...(footerComponent?.settings ?? {}),
              brandName: footerComponent?.settings?.brandName ?? vendorSlug,
              links: resolveFooterLinks(footerComponent?.settings?.links, base),
            },
          },
        ],
      },
    ],
  };
}
