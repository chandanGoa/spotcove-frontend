/**
 * Demo Route - Public Layout/Theme Demos
 */

import { notFound } from "next/navigation";
import { getDemoConfig, getAllDemoKeywords } from "@/data/demo-registry";
import DemoPageClient from "./DemoPageClient";
import fs from "fs";
import path from "path";

interface DemoPageProps {
  params: {
    keyword: string;
  };
}

export async function generateStaticParams() {
  return getAllDemoKeywords().map((keyword) => ({
    keyword,
  }));
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { keyword } = params;
  const demoConfig = getDemoConfig(keyword);
  
  if (!demoConfig) {
    notFound();
  }
  
  const dataDir = path.join(process.cwd(), "src", "data");
  
  let layoutJson: any;
  let themeJson: any;
  
  try {
    const layoutPath = path.join(dataDir, demoConfig.layoutJsonPath);
    const themePath = path.join(dataDir, demoConfig.themeJsonPath);
    
    layoutJson = JSON.parse(fs.readFileSync(layoutPath, "utf-8"));
    themeJson = JSON.parse(fs.readFileSync(themePath, "utf-8"));
  } catch (error) {
    console.error(`Failed to load demo files for ${keyword}:`, error);
    notFound();
  }
  
  return (
    <DemoPageClient
      keyword={keyword}
      demoConfig={demoConfig}
      layoutJson={layoutJson}
      themeJson={themeJson}
    />
  );
}
