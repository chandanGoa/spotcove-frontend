import homepageLayout from "@/data/layouts/homepage.json";
import homepageTheme from "@/data/themes/homepage.json";
import HomePageClient from "./HomePageClient";

export default function HomePage() {
  return (
    <HomePageClient layoutJson={homepageLayout} themeJson={homepageTheme} />
  );
}
