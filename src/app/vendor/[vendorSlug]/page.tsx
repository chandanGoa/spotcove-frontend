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
  const themeScript = buildThemeScript(initialData?.themeJSON);
  const metricOverridesCss = buildMetricOverrides(initialData?.themeJSON);

  return (
    <>
      {metricOverridesCss && (
        <style dangerouslySetInnerHTML={{ __html: metricOverridesCss }} />
      )}
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
      {themeScript && (
        // eslint-disable-next-line @next/next/no-before-interactive-script-component
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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

// Maps bare font name (lowercase) → the matching @font-face fallback name defined in FONT_METRIC_OVERRIDES
const METRIC_FALLBACK_NAMES: Record<string, string> = {
  inter: "Inter Fallback",
  "playfair display": "Playfair Display Fallback",
  nunito: "Nunito Fallback",
  poppins: "Poppins Fallback",
};

/** Insert the metric-override fallback font as the second item in a CSS font-family stack. */
function withMetricFallback(fontFamily: string): string {
  const parts = fontFamily.split(",");
  if (!parts.length) return fontFamily;
  const primaryFont = parts[0].trim().replace(/['"]/g, "");
  const fallback = METRIC_FALLBACK_NAMES[primaryFont.toLowerCase()];
  if (!fallback || fontFamily.includes(fallback)) return fontFamily;
  return [parts[0], ` '${fallback}'`, ...parts.slice(1)].join(",");
}

function toFontStack(name: string) {
  const clean = name.replace(/'/g, "").trim();
  const fallback = METRIC_FALLBACK_NAMES[clean.toLowerCase()];
  const fallbackPart = fallback ? `, '${fallback}'` : "";
  return `'${clean}'${fallbackPart}, system-ui, -apple-system, sans-serif`;
}
function toGoogleUrl(name: string) {
  return `https://fonts.googleapis.com/css2?family=${name.trim().replace(/ /g, "+")}:wght@400;500;600;700;800&display=swap`;
}

function buildFontLinks(themeJson: any): string[] {
  if (!themeJson?.fonts) return [];
  const { heading, body, fontUrls } = themeJson.fonts;
  // Replace display=block with display=swap
  const urls: string[] = Array.isArray(fontUrls)
    ? fontUrls.map((u: string) => u.replace(/display=block/g, "display=swap"))
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
  if (heading && !heading.startsWith("var("))
    vars.push(
      `--font-heading: ${isBareFont(heading) ? toFontStack(heading) : heading}`,
    );
  if (body && !body.startsWith("var("))
    vars.push(`--font-body: ${isBareFont(body) ? toFontStack(body) : body}`);
  return vars.join("; ");
}

/** Build an IIFE that sets CSS custom properties synchronously before first paint */
function buildThemeScript(themeJson: any): string {
  const setters: string[] = [];

  Object.entries(themeJson?.colors ?? {}).forEach(([key, value]) => {
    if (typeof value === "string" && value) {
      setters.push(
        `r.setProperty('--${key}','${(value as string).replace(/'/g, "\\'")}')`,
      );
    }
  });

  const { heading, body } = themeJson?.fonts ?? {};
  if (heading && !heading.startsWith("var(")) {
    const v = isBareFont(heading) ? toFontStack(heading) : withMetricFallback(heading);
    setters.push(
      `r.setProperty('--font-heading','${v.replace(/'/g, "\\'")}') `,
    );
  }
  if (body && !body.startsWith("var(")) {
    const v = isBareFont(body) ? toFontStack(body) : withMetricFallback(body);
    setters.push(`r.setProperty('--font-body','${v.replace(/'/g, "\\'")}') `);
  }

  if (!setters.length) return "";
  return `(function(){try{var r=document.documentElement.style;${setters.join(";")}}catch(e){}})();`;
}

function buildColorCssVars(themeJson: any): string {
  if (!themeJson?.colors) return "";
  return Object.entries(themeJson.colors)
    .filter(([, v]) => typeof v === "string" && v)
    .map(([k, v]) => `--${k}: ${v}`)
    .join("; ");
}

// Font metric overrides for common Google Fonts to reduce layout shift with font-display: swap
const FONT_METRIC_OVERRIDES: Record<string, string> = {
  inter:
    "@font-face{font-family:'Inter Fallback';src:local('Arial');size-adjust:107%;ascent-override:90%;descent-override:22%;line-gap-override:0%}",
  "playfair display":
    "@font-face{font-family:'Playfair Display Fallback';src:local('Georgia');size-adjust:94%;ascent-override:85%;descent-override:22%;line-gap-override:0%}",
  nunito:
    "@font-face{font-family:'Nunito Fallback';src:local('Arial');size-adjust:102%;ascent-override:100%;descent-override:25%;line-gap-override:0%}",
  poppins:
    "@font-face{font-family:'Poppins Fallback';src:local('Arial');size-adjust:112%;ascent-override:92%;descent-override:22%;line-gap-override:0%}",
};

function buildMetricOverrides(themeJson: any): string {
  if (!themeJson?.fonts) return "";
  const { heading, body, fontUrls } = themeJson.fonts as any;
  const overrides: string[] = [];
  const seen = new Set<string>();
  const check = (val: string | undefined) => {
    if (!val) return;
    const m = val.match(/["']?([A-Za-z][A-Za-z ]+?)["']?(?=,|$)/);
    const name = (m?.[1] ?? val).toLowerCase().trim();
    if (!seen.has(name) && FONT_METRIC_OVERRIDES[name]) {
      overrides.push(FONT_METRIC_OVERRIDES[name]);
      seen.add(name);
    }
  };
  (fontUrls ?? []).forEach((u: string) => {
    const m = u.match(/family=([^:&]+)/);
    if (m) check(m[1].replace(/\+/g, " "));
  });
  check(heading);
  check(body);
  return overrides.join("");
}

function buildSSRCss(themeJson: any): string {
  return buildMetricOverrides(themeJson);
}
