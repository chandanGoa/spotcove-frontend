/**
 * Vendor Root Page
 */

import { getVendorLayoutConfig } from "@/data/vendor-registry";
import VendorKeywordClient from "./[keyword]/VendorKeywordClient";

interface VendorRootPageProps {
  params: {
    vendorSlug: string;
  };
}

export default async function VendorRootPage({ params }: VendorRootPageProps) {
  const { vendorSlug } = params;
  const keyword = "home";

  let initialData: {
    layoutJSON?: any;
    themeJSON?: any;
    contentJSON?: Record<string, any>;
    products?: any[];
    collections?: any[];
  } | null = null;

  const apiBase = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_CORE_URL ||
    ""
  ).replace(/\/$/, "");

  if (apiBase) {
    try {
      const res = await fetch(
        `${apiBase}/api/storefront/vendor/${vendorSlug}`,
        { next: { revalidate: 60 } },
      );
      if (res.ok) {
        const data = await res.json();
        if (!data.error) initialData = data;
      }
    } catch {
      // fall back to local registry
    }
  }

  if (!initialData) {
    const fallback = getVendorLayoutConfig(vendorSlug, keyword);
    if (fallback) {
      initialData = {
        layoutJSON: fallback.layoutJson,
        themeJSON: fallback.themeJson,
        contentJSON: {},
        products: [],
        collections: [],
      };
    }
  }

  const fontLinks = buildFontLinks(initialData?.themeJSON);
  const fontCssVars = buildFontCssVars(initialData?.themeJSON);

  return (
    <>
      {fontLinks.length > 0 && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin=""
          />
        </>
      )}
      {fontLinks.map((url) => (
        <link key={url} rel="stylesheet" href={url} />
      ))}
      {fontCssVars && (
        <style dangerouslySetInnerHTML={{ __html: fontCssVars }} />
      )}
      <VendorKeywordClient
        vendorSlug={vendorSlug}
        keyword={keyword}
        initialData={initialData}
      />
    </>
  );
}

function isBareFont(v: string) {
  return typeof v === "string" && !v.includes(",") && !v.includes("(");
}
function toFontStack(name: string) {
  return `'${name.replace(/'/g, "")}', system-ui, -apple-system, sans-serif`;
}
function toGoogleUrl(name: string) {
  return `https://fonts.googleapis.com/css2?family=${name.trim().replace(/ /g, "+")}:wght@400;500;600;700;800&display=block`;
}

function buildFontLinks(themeJson: any): string[] {
  if (!themeJson?.fonts) return [];
  const { heading, body, fontUrls } = themeJson.fonts;
  // Replace display=swap with display=block to prevent FOUT
  const urls: string[] = Array.isArray(fontUrls)
    ? fontUrls.map((u: string) => u.replace(/display=swap/g, "display=block"))
    : [];
  if (heading && isBareFont(heading))
    urls.push(toGoogleUrl(heading.replace(/['"]/g, "").trim()));
  if (body && isBareFont(body) && body !== heading)
    urls.push(toGoogleUrl(body.replace(/['"]/g, "").trim()));
  return [...new Set(urls)];
}

function buildFontCssVars(themeJson: any): string {
  if (!themeJson?.fonts) return "";
  const { heading, body } = themeJson.fonts;
  const vars: string[] = [];
  // Skip var(...) references — the underlying CSS variable is not defined in this app
  if (heading && !heading.startsWith("var("))
    vars.push(
      `--font-heading: ${isBareFont(heading) ? toFontStack(heading) : heading}`,
    );
  if (body && !body.startsWith("var("))
    vars.push(`--font-body: ${isBareFont(body) ? toFontStack(body) : body}`);
  return vars.length ? `:root { ${vars.join("; ")} }` : "";
}
