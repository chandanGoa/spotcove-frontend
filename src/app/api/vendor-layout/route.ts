import { NextResponse, type NextRequest } from "next/server";
import { getVendorLayoutConfig } from "@/data/vendor-registry";

type VendorLayoutResponse = {
  vendorSlug: string;
  keyword: string;
  name?: string;
  packageTier?: string;
  layoutJson: unknown;
  themeJson: unknown;
  source: "api" | "fallback";
  updatedAt?: string;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vendorSlug = searchParams.get("vendorSlug");
  const keyword = searchParams.get("keyword");

  if (!vendorSlug || !keyword) {
    return NextResponse.json(
      { error: "vendorSlug and keyword are required" },
      { status: 400 },
    );
  }

  const upstreamUrl = process.env.VENDOR_LAYOUT_API_URL;
  if (upstreamUrl) {
    try {
      const url = new URL(upstreamUrl);
      url.searchParams.set("vendorSlug", vendorSlug);
      url.searchParams.set("keyword", keyword);

      const upstreamResponse = await fetch(url.toString(), {
        cache: "no-store",
      });

      if (upstreamResponse.ok) {
        const upstreamData = (await upstreamResponse.json()) as Partial<VendorLayoutResponse>;
        if (upstreamData.layoutJson && upstreamData.themeJson) {
          return NextResponse.json({
            vendorSlug,
            keyword,
            name: upstreamData.name,
            packageTier: upstreamData.packageTier,
            layoutJson: upstreamData.layoutJson,
            themeJson: upstreamData.themeJson,
            source: "api",
            updatedAt: upstreamData.updatedAt,
          } satisfies VendorLayoutResponse);
        }
      }
    } catch (error) {
      console.error("Upstream vendor layout fetch failed:", error);
    }
  }

  const config = getVendorLayoutConfig(vendorSlug, keyword);
  if (!config) {
    return NextResponse.json(
      { error: "Vendor layout not found", source: "fallback" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    vendorSlug,
    keyword,
    name: config.name,
    packageTier: config.packageTier,
    layoutJson: config.layoutJson,
    themeJson: config.themeJson,
    source: "fallback",
  } satisfies VendorLayoutResponse);
}
