import { ReactNode } from "react";
import SimpleNavbar from "../../../../packages/render-runtime/src/components/SimpleNavbar";
import MainFooter from "../../../../packages/render-runtime/src/components/MainFooter";

interface Props {
  vendorSlug: string;
  layoutJSON?: any;
  children: ReactNode;
}

/** Walk the layout JSON (elements or zones) and find the first component matching one of the given types. */
function findLayoutComponent(layout: any, types: string[]): any | null {
  if (!layout) return null;

  const searchComponents = (components: any[]): any | null => {
    for (const c of components ?? []) {
      if (types.includes(c?.type)) return c;
    }
    return null;
  };

  // zones format
  for (const zone of layout.zones ?? []) {
    const found = searchComponents(zone.components);
    if (found) return found;
  }

  // elements format
  for (const el of layout.elements ?? []) {
    const found = searchComponents(el.components);
    if (found) return found;
    // recurse into children
    const child = findLayoutComponent({ elements: el.children ?? [] }, types);
    if (child) return child;
  }

  return null;
}

/** Prefix relative hrefs with the vendor base path so links work on sub-pages. */
function resolveLinks(
  links: Array<{ label: string; href: string }> | undefined,
  base: string,
): Array<{ label: string; href: string }> {
  if (!links) return [];
  return links.map((l) => ({
    label: l.label,
    href: l.href === "/" ? base : l.href.startsWith("/vendor/") ? l.href : `${base}${l.href}`,
  }));
}

function resolveFooterLinks(
  sections: Array<{ title: string; items: Array<{ title: string; href: string }> }> | undefined,
  base: string,
): Array<{ title: string; items: Array<{ title: string; href: string }> }> {
  if (!sections) return [];
  return sections.map((s) => ({
    title: s.title,
    items: s.items.map((item) => ({
      title: item.title,
      href: item.href === "/" ? base : item.href.startsWith("/vendor/") ? item.href : `${base}${item.href}`,
    })),
  }));
}

export default function VendorDefaultShell({ vendorSlug, layoutJSON, children }: Props) {
  const base = `/vendor/${vendorSlug}`;

  const navComp = findLayoutComponent(layoutJSON, ["navigation", "header"]);
  const footerComp = findLayoutComponent(layoutJSON, ["footer"]);

  const navSettings = {
    brandName: navComp?.settings?.brandName ?? vendorSlug,
    showSearch: false,
    links: resolveLinks(navComp?.settings?.links, base),
  };

  const footerSettings = {
    brandName: footerComp?.settings?.brandName ?? vendorSlug,
    links: resolveFooterLinks(footerComp?.settings?.links, base),
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SimpleNavbar settings={navSettings} />

      <main className="flex-1">{children}</main>

      <MainFooter settings={footerSettings} />
    </div>
  );
}
