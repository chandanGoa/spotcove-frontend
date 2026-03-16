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

/**
 * Build an inline script (not a <style>) that sets CSS custom properties
 * synchronously before the browser renders any content.
 *
 * A <style> in <body> only affects elements that come AFTER it; the browser
 * may already have rendered a frame using globals.css defaults by the time it
 * reaches a body <style>.  A synchronous inline <script> runs immediately when
 * the HTML parser hits it – before any paint – so the vars are correct on the
 * very first frame.
 */
function buildThemeScript(vendorSlug: string, fallbackSettings: any): string {
  const registryEntry = VENDOR_REGISTRY[vendorSlug];
  const themeJson = registryEntry
    ? (Object.values(registryEntry)[0] as any)?.themeJson
    : null;

  const source = themeJson ?? fallbackSettings;
  if (!source) return "";

  const setters: string[] = [];
  const fontUrls: string[] = [];

  const hexToHSL = (hex: string): string => {
    const clean = hex.replace("#", "");
    if (clean.length !== 6) return hex;

    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
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
  };

  const normalizeFontUrl = (url: string): string => {
    if (!url) return url;
    const sep = url.includes("?") ? "&" : "?";
    if (/[?&]display=/.test(url)) {
      return url.replace(
        /([?&]display=)(swap|fallback|optional|auto|block)/,
        "$1block",
      );
    }
    return `${url}${sep}display=block`;
  };

  const colors = source.colors ?? {};
  Object.entries(colors).forEach(([key, value]) => {
    if (typeof value === "string" && value) {
      const normalized = value.startsWith("#") ? hexToHSL(value) : value;
      const safe = normalized.replace(/'/g, "\\'");
      setters.push(`r.setProperty('--${key}','${safe}')`);
    }
  });

  const fonts = source.fonts ?? {};
  if (
    typeof fonts.heading === "string" &&
    fonts.heading &&
    !fonts.heading.startsWith("var(")
  ) {
    const safe = fonts.heading.replace(/'/g, "\\'");
    setters.push(`r.setProperty('--font-heading','${safe}')`);
  }
  if (
    typeof fonts.body === "string" &&
    fonts.body &&
    !fonts.body.startsWith("var(")
  ) {
    const safe = fonts.body.replace(/'/g, "\\'");
    setters.push(`r.setProperty('--font-body','${safe}')`);
  }

  if (Array.isArray(fonts.fontUrls)) {
    fonts.fontUrls.forEach((url: unknown) => {
      if (typeof url === "string" && url.trim().length > 0) {
        fontUrls.push(normalizeFontUrl(url));
      }
    });
  }

  if (!setters.length) return "";

  return `(function(){try{var d=document.documentElement;var r=d.style;${setters.join(";")};var fontUrls=${JSON.stringify(fontUrls)};if(fontUrls&&fontUrls.length){for(var i=0;i<fontUrls.length;i++){var href=fontUrls[i];if(!document.querySelector('link[data-vendor-font="'+href+'"]')){var l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute('data-vendor-font',href);document.head.appendChild(l);}}}var release=function(){requestAnimationFrame(function(){requestAnimationFrame(function(){d.removeAttribute('data-vendor-theme-pending');});});};if(document.fonts&&document.fonts.ready){Promise.race([document.fonts.ready,new Promise(function(resolve){setTimeout(resolve,2500);})]).then(release);}else{release();}}catch(e){try{document.documentElement.removeAttribute('data-vendor-theme-pending');}catch(_e){}}})();`;
}

async function VendorLayout({ children, params }: Props) {
  const vendor = vendorsData.find(
    (v) => v.slug === params.vendorSlug && v.is_active,
  );

  if (!vendor) {
    notFound();
  }

  const fallbackSettings = vendor.custom_theme_settings || {};
  const themeScript = buildThemeScript(params.vendorSlug, fallbackSettings);

  return (
    <>
      {themeScript && (
        // eslint-disable-next-line @next/next/no-before-interactive-script-component
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      )}
      <VendorThemeWrapper
        themeSettings={fallbackSettings}
        vendorSlug={params.vendorSlug}
      >
        {children}
      </VendorThemeWrapper>
    </>
  );
}

export default VendorLayout;
