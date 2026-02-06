// frontend/src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const host = request.headers.get("host") || "";
  const hostWithoutPort = host.split(":")[0];

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
  
  if (!isVercelDomain && hostParts.length >= minParts) {
    const subdomain = hostParts[0];
    
    if (subdomain !== "www" && subdomain !== "demo" && subdomain !== "localhost") {
      const vendorSlug = subdomain;
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

  if (host.startsWith("demo.")) {
    isDemo = true;
    vendorSlug = null;
  } else if (!isVercelDomain && hostParts.length > 2) {
    vendorSlug = hostParts[0];
  } else if (pathSegments[0] === "vendor") {
    vendorSlug = pathSegments[1] || null;
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
