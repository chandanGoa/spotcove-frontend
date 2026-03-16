import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpotCove - Public Frontend",
  description: "SpotCove demo and vendor storefronts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html:
              "html[data-vendor-theme-pending='1'] body{visibility:hidden !important;}",
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var d=document.documentElement;var p=location.pathname||'';if(/^\\/vendor\\/[^\\/]+/.test(p)){d.setAttribute('data-vendor-theme-pending','1');setTimeout(function(){if(d.getAttribute('data-vendor-theme-pending')==='1'){d.removeAttribute('data-vendor-theme-pending');}},12000);}}catch(_e){}})();",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
