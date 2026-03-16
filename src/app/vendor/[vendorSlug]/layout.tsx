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
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function normalizeFontUrl(url: string): string {
  if (!url) return url;
  if (/[?&]display=/.test(url))
    return url.replace(/([?&]display=)(swap|fallback|optional|auto|block)/, "$1block");
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}display=block`;
}

/** Resolve the best theme source: registry entry takes priority over vendor fallback. */
function resolveThemeSource(vendorSlug: string, fallback: any): any {
  const entry = VENDOR_REGISTRY[vendorSlug];
  const themeJson = entry ? (Object.values(entry)[0] as any)?.themeJson : null;
  return themeJson ?? fallback ?? {};
}

/** Return font stylesheet URLs from the theme source, normalised to display=block. */
function resolveFontUrls(source: any): string[] {
  const rawUrls: unknown[] = source?.fonts?.fontUrls ?? [];
  return (rawUrls as string[])
    .filter((u) => typeof u === "string" && u.trim().length > 0)
    .map(normalizeFontUrl);
}

/**
 * Build a tiny synchronous inline script that:
 *  1. Sets CSS custom properties before the first paint.
 *  2. Releases the visibility gate AFTER document.fonts.ready resolves.
 *
 * Font <link> elements are rendered as real HTML (see VendorLayout below) so
 * the browser includes them in the document.fonts.ready cycle.  We must NOT
 * inject font links here via JS because document.fonts.ready may have already
 * resolved by the time the dynamic link is processed, causing the gate to
 * release before fonts are loaded.
 */
function buildThemeScript(source: any): string {
  const setters: string[] = [];

  const colors = source?.colors ?? {};
  Object.entries(colors).forEach(([key, value]) => {
    if (typeof value === "string" && value) {
      const v = value.startsWith("#") ? hexToHSL(value) : value;
      setters.push(`r.setProperty('--${key}','${v.replace(/'/g, "\\'")}')`);
    }
  });

  const fonts = source?.fonts ?? {};
  if (typeof fonts.heading === "string" && fonts.heading && !fonts.heading.startsWith("var("))
    setters.push(`r.setProperty('--font-heading','${fonts.heading.replace(/'/g, "\\'")}')`);
  if (typeof fonts.body === "string" && fonts.body && !fonts.body.startsWith("var("))
    setters.push(`r.setProperty('--font-body','${fonts.body.replace(/'/g, "\\'")}')`);

  const varPart = setters.length
    ? `var d=document.documentElement;var r=d.style;${setters.join(";")};`
    : `var d=document.documentElement;`;

  // release(): mark that server vars are applied (data-vvr), then reveal body
  // waitAndRelease(): call release() only after document.fonts.ready
  // We first wait for every Google Fonts <link> to have its .sheet populated
  // (i.e. the @font-face rules are parsed) before we touch document.fonts.ready.
  // Without this, document.fonts.ready resolves immediately on hard refresh
  // because the browser hasn't seen any @font-face declarations yet.
  const gateRelease =
    `var release=function(){d.setAttribute('data-vvr','1');requestAnimationFrame(function(){requestAnimationFrame(function(){d.removeAttribute('data-vendor-theme-pending');});});};` +
    `var waitAndRelease=function(){if(document.fonts&&document.fonts.ready){Promise.race([document.fonts.ready,new Promise(function(rs){setTimeout(rs,2500);})]).then(release);}else{release();}};` +
    `var flinks=[].slice.call(document.querySelectorAll('link[rel="stylesheet"][href*="fonts.googleapis"]'));` +
    `if(!flinks.length){waitAndRelease();}` +
    `else{var pending=flinks.length;var onDone=function(){if(--pending<=0)waitAndRelease();};` +
    `for(var i=0;i<flinks.length;i++){var fl=flinks[i];if(fl.sheet){onDone();}` +
    `else{fl.addEventListener('load',onDone,{once:true});fl.addEventListener('error',onDone,{once:true});}}}`;

  return `(function(){try{${varPart}${gateRelease}}catch(e){try{document.documentElement.removeAttribute('data-vendor-theme-pending');}catch(_){}}})()`; 
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
  const source = resolveThemeSource(params.vendorSlug, fallbackSettings);
  const fontUrls = resolveFontUrls(source);
  const themeScript = buildThemeScript(source);

  return (
    <>
      {/*
       * Font stylesheets rendered as real HTML elements.
       * Next.js hoists <link precedence="…"> to <head>, so the browser
       * discovers these fonts during the initial parse and document.fonts.ready
       * correctly waits for them before the gate releases.
       */}
      {fontUrls.map((url) => (
        <link key={url} rel="stylesheet" href={url} precedence="default" />
      ))}
      {/* Theme vars + gate-release script — runs synchronously in <body> */}
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <VendorThemeWrapper
        themeSettings={source}
        vendorSlug={params.vendorSlug}
      >
        {children}
      </VendorThemeWrapper>
    </>
  );
}

export default VendorLayout;
