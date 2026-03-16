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

  const colors = source.colors ?? {};
  Object.entries(colors).forEach(([key, value]) => {
    if (typeof value === "string" && value) {
      const safe = value.replace(/'/g, "\\'");
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
        const normalized = /[?&]display=/.test(url)
          ? url.replace(
              /([?&]display=)(swap|fallback|optional|auto|block)/,
              "$1block",
            )
          : `${url}${url.includes("?") ? "&" : "?"}display=block`;
        fontUrls.push(normalized);
      }
    });
  }

  if (!setters.length) return "";

  // Wrapped in try/catch so any edge-case error never breaks the page
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
