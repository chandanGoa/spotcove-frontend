/**
 * Vendor Storefront Layout
 */

import { ReactNode } from "react";
import { notFound } from "next/navigation";
import VendorThemeWrapper from "./VendorThemeWrapper";
import vendorsData from "@/data/vendors.json";
import { VENDOR_REGISTRY } from "@/data/vendor-registry";

type Props = {
  children: ReactNode;
  params: { vendorSlug: string };
};

// ─── Server-side helpers ────────────────────────────────────────────────────

function hexToHSL(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function normalizeFontUrl(url: string): string {
  if (!url) return url;
  if (/[?&]display=/.test(url))
    return url.replace(
      /([?&]display=)(swap|fallback|optional|auto|block)/,
      "$1block",
    );
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}display=block`;
}

/** Resolve the best theme source: registry entry takes priority over vendor fallback. */
function resolveThemeSource(vendorSlug: string, fallback: any): any {
  const entry = VENDOR_REGISTRY[vendorSlug];
  const themeJson = entry ? (Object.values(entry)[0] as any)?.themeJson : null;
  return themeJson ?? fallback ?? {};
}

function normalizeThemeSource(raw: any): any {
  if (!raw) return null;
  if (raw.colors || raw.fonts) return raw;
  if (raw.themeJSON?.colors || raw.themeJSON?.fonts) return raw.themeJSON;
  if (raw.themeJson?.colors || raw.themeJson?.fonts) return raw.themeJson;
  if (raw.theme?.colors || raw.theme?.fonts) return raw.theme;
  if (
    raw.selected_theme?.settings_json?.colors ||
    raw.selected_theme?.settings_json?.fonts
  ) {
    return raw.selected_theme.settings_json;
  }
  if (
    raw.selected_theme?.settings?.colors ||
    raw.selected_theme?.settings?.fonts
  ) {
    return raw.selected_theme.settings;
  }
  if (raw.custom_theme_settings?.colors || raw.custom_theme_settings?.fonts) {
    return raw.custom_theme_settings;
  }
  return null;
}

async function fetchVendorThemeSource(vendorSlug: string): Promise<any | null> {
  const apiBase = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_CORE_URL ||
    ""
  ).replace(/\/$/, "");

  if (!apiBase) return null;

  try {
    const res = await fetch(`${apiBase}/api/storefront/vendor/${vendorSlug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.error) return null;
    return normalizeThemeSource(data);
  } catch {
    return null;
  }
}

/** Return font stylesheet URLs from the theme source, normalised to display=block. */
function resolveFontUrls(source: any): string[] {
  const rawUrls: unknown[] = source?.fonts?.fontUrls ?? [];
  return (rawUrls as string[])
    .filter((u) => typeof u === "string" && u.trim().length > 0)
    .map(normalizeFontUrl);
}

/**
 * Build a CSS :root{} block with all vendor CSS custom properties.
 *
 * Rendered as <style precedence="high" data-vendor={slug}>.
 * Next.js/React guarantees that precedence-tagged styles are hoisted into
 * <head> in the INITIAL HTML RESPONSE — even from async Server Components.
 * This is the only reliable way to have CSS vars applied before first paint.
 *
 * A <script> with setProperty() calls does NOT have this guarantee: async RSC
 * output streams, and the script may arrive in a late chunk, AFTER the first
 * paint has already occurred with the wrong (globals.css default) values.
 */
function buildVendorCss(source: any): string {
  const lines: string[] = [];

  const colors = source?.colors ?? {};
  Object.entries(colors).forEach(([key, value]) => {
    if (typeof value === "string" && value) {
      const v = value.startsWith("#") ? hexToHSL(value) : value;
      lines.push(`--${key}:${v}`);
    }
  });

  const fonts = source?.fonts ?? {};
  if (
    typeof fonts.heading === "string" &&
    fonts.heading &&
    !fonts.heading.startsWith("var(")
  )
    lines.push(`--font-heading:${fonts.heading}`);
  if (
    typeof fonts.body === "string" &&
    fonts.body &&
    !fonts.body.startsWith("var(")
  )
    lines.push(`--font-body:${fonts.body}`);

  if (!lines.length) return "";
  return `:root{${lines.join(";")}}`;
}

/**
 * Gate-release script: reveals body once Google Fonts CSS file is parsed.
 * Does NOT set any CSS vars — those are in the <style> tag above.
 * It is fine for this to arrive in a streaming chunk: the gate keeps the
 * body hidden (visibility:hidden) until this script runs and the font
 * stylesheet is ready.
 */
function buildGateReleaseScript(): string {
  return (
    `(function(){try{` +
    `var d=document.documentElement;` +
    `var release=function(){requestAnimationFrame(function(){requestAnimationFrame(function(){d.removeAttribute('data-vendor-theme-pending');});});};` +
    `var flinks=[].slice.call(document.querySelectorAll('link[rel="stylesheet"][href*="fonts.googleapis"]'));` +
    `if(!flinks.length){release();}` +
    `else{var pending=flinks.length;var onDone=function(){if(--pending<=0)release();};` +
    `for(var i=0;i<flinks.length;i++){var fl=flinks[i];if(fl.sheet){onDone();}` +
    `else{fl.addEventListener('load',onDone,{once:true});fl.addEventListener('error',onDone,{once:true});}}}` +
    `}catch(e){try{document.documentElement.removeAttribute('data-vendor-theme-pending');}catch(_){}}})()`
  );
}

// ─── Layout component ────────────────────────────────────────────────────────

async function VendorLayout({ children, params }: Props) {
  const vendor = vendorsData.find(
    (v) => v.slug === params.vendorSlug && v.is_active,
  );

  if (!vendor) {
    notFound();
  }

  const fallbackSettings = vendor.custom_theme_settings || {};
  const remoteSource = await fetchVendorThemeSource(params.vendorSlug);
  const source =
    remoteSource ?? resolveThemeSource(params.vendorSlug, fallbackSettings);
  const fontUrls = resolveFontUrls(source);
  const vendorCss = buildVendorCss(source);
  const gateScript = buildGateReleaseScript();

  return (
    <>
      {/* Font stylesheets — hoisted to <head> by Next.js precedence handling */}
      {fontUrls.map((url) => (
        <link key={url} rel="stylesheet" href={url} precedence="default" />
      ))}
      {/*
       * CSS vars in a <style precedence="high"> — React/Next.js GUARANTEES
       * this is in <head> in the initial HTML response, before any body paint.
       * data-vendor attribute is read by VendorThemeContext to skip client-side
       * var-writes on initial mount (server already set everything correctly).
       */}
      {vendorCss && (
        <style
          precedence="high"
          data-vendor={params.vendorSlug}
          dangerouslySetInnerHTML={{ __html: vendorCss }}
        />
      )}
      {/* Gate-release script — reveals body after font CSS is parsed */}
      <script dangerouslySetInnerHTML={{ __html: gateScript }} />
      <VendorThemeWrapper themeSettings={source} vendorSlug={params.vendorSlug}>
        {children}
      </VendorThemeWrapper>
    </>
  );
}

export default VendorLayout;
