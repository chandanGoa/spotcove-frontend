// frontend/src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getVendorPlan } from "@/data/vendor-plans";

const CUSTOM_DOMAIN_VENDOR_MAP: Record<string, string> = {
  "moonsoftlabs.com": "moonsoft",
  "www.moonsoftlabs.com": "moonsoft",
};

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const host = request.headers.get("host") || "";
  const hostWithoutPort = host.split(":")[0].toLowerCase();
  const isIpAddress = /^\d+\.\d+\.\d+\.\d+$/.test(hostWithoutPort);
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Subdomain-to-Path Rewrite
  const hostParts = hostWithoutPort.split(".");
  const isLocalhostDomain = hostWithoutPort.includes("localhost");
  const isVercelDomain = hostWithoutPort.endsWith(".vercel.app");
  const minParts = isLocalhostDomain ? 2 : 3;

  const mappedVendorSlug = CUSTOM_DOMAIN_VENDOR_MAP[hostWithoutPort];
  if (mappedVendorSlug && !pathname.startsWith("/api/") && !isAdminPath) {
    const vendorPlan = getVendorPlan(mappedVendorSlug);

    if (!vendorPlan || vendorPlan.plan !== "paid") {
      const upgradeUrl = new URL("/upgrade-required", request.url);
      upgradeUrl.search = url.search;
      return NextResponse.rewrite(upgradeUrl);
    }

    const rewritePath = `/vendor/${mappedVendorSlug}${pathname}`;
    const rewriteUrl = new URL(rewritePath, request.url);
    rewriteUrl.search = url.search;

    const rewriteResponse = NextResponse.rewrite(rewriteUrl);
    rewriteResponse.cookies.set("vendor_slug", mappedVendorSlug);
    rewriteResponse.cookies.set("is_demo", "false");

    return rewriteResponse;
  }

  if (!isVercelDomain && !isIpAddress && hostParts.length >= minParts) {
    const subdomain = hostParts[0];

    if (
      subdomain !== "www" &&
      subdomain !== "demo" &&
      subdomain !== "localhost"
    ) {
      if (isAdminPath || pathname.startsWith("/api/")) {
        return response;
      }
      const vendorSlug = subdomain;
      const vendorPlan = getVendorPlan(vendorSlug);

      if (!vendorPlan || vendorPlan.plan !== "paid") {
        const upgradeUrl = new URL("/upgrade-required", request.url);
        upgradeUrl.search = url.search;

        return NextResponse.rewrite(upgradeUrl);
      }

      const rewritePath = `/vendor/${vendorSlug}${pathname}`;
      const rewriteUrl = new URL(rewritePath, request.url);
      rewriteUrl.search = url.search;

      const rewriteResponse = NextResponse.rewrite(rewriteUrl);
      rewriteResponse.cookies.set("vendor_slug", vendorSlug);
      rewriteResponse.cookies.set("is_demo", "false");

      return rewriteResponse;
    }
  }

  // Vendor Detection for cookie setting
  let vendorSlug: string | null = null;
  let isDemo = false;

  const pathSegments = pathname.split("/").filter(Boolean);

  if (hostWithoutPort.startsWith("demo.")) {
    isDemo = true;
    vendorSlug = null;
  } else if (!isVercelDomain && hostParts.length > 2) {
    vendorSlug = hostParts[0];
  } else if (pathSegments[0] === "vendor") {
    vendorSlug = pathSegments[1] || null;
  } else if (CUSTOM_DOMAIN_VENDOR_MAP[hostWithoutPort]) {
    vendorSlug = CUSTOM_DOMAIN_VENDOR_MAP[hostWithoutPort];
  }

  if (vendorSlug) {
    response.cookies.set("vendor_slug", vendorSlug);
  } else {
    response.cookies.delete("vendor_slug");
  }
  response.cookies.set("is_demo", isDemo ? "true" : "false");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
