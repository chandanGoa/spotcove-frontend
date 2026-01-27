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
      <body>{children}</body>
    </html>
  );
}
