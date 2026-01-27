/**
 * SimpleNavbar - Static Navigation (Tier 1)
 * 
 * NEW component for render runtime
 * No authentication, no cart, no dynamic data
 * Pure static navigation bar
 */
"use client";

import React from "react";
import { cn } from "../utils";
import { getThemeOverrideStyles } from "../theme-wrapper";

export interface SimpleNavbarSettings {
  brandName?: string;
  links?: Array<{ label: string; href: string }>;
  className?: string;
}

export interface SimpleNavbarProps {
  settings?: SimpleNavbarSettings;
  themeOverride?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
  onLinkClick?: (href: string) => void;
}

export const SimpleNavbar: React.FC<SimpleNavbarProps> = ({
  settings = {},
  themeOverride,
  className,
  style,
  onLinkClick,
}) => {
  const {
    brandName = "Store",
    links = [
      { label: "Home", href: "/" },
      { label: "Products", href: "/products" },
      { label: "About", href: "/about" },
    ],
  } = settings;

  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    if (onLinkClick) {
      e.preventDefault();
      onLinkClick(href);
    }
  };

  return (
    <nav
      className={cn(
        "bg-card shadow-sm border-b sticky top-0 z-50",
        settings.className,
        className
      )}
      style={{ ...themeOverrideStyles, ...style }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-semibold text-foreground">
            {brandName}
          </h1>
          <ul className="flex gap-6">
            {links.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

SimpleNavbar.displayName = "SimpleNavbar";

export default React.memo(SimpleNavbar);
