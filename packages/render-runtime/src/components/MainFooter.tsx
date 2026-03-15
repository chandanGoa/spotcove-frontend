/**
 * MainFooter - Static Footer (Tier 1)
 *
 * Simplified version for render runtime
 * No dynamic data, no forms, pure static content
 */
"use client";

import React from "react";
import { cn } from "../utils";
import { getThemeOverrideStyles } from "../theme-wrapper";

export interface MainFooterSettings {
  brandName?: string;
  address?: string;
  phone?: string;
  email?: string;
  links?: Array<{
    title: string;
    items: Array<{ title: string; href: string }>;
  }>;
  className?: string;
}

export interface MainFooterProps {
  settings?: MainFooterSettings;
  themeOverride?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
  onLinkClick?: (href: string) => void;
}

export const MainFooter: React.FC<MainFooterProps> = ({
  settings = {},
  themeOverride,
  className,
  style,
  onLinkClick,
}) => {
  const {
    brandName = "SpotCove",
    address = "123 Main St, City, State 12345",
    phone = "(123) 456-7890",
    email = "info@spotcove.com",
    links = [
      {
        title: "Shop",
        items: [
          { title: "Products", href: "/products" },
          { title: "Collections", href: "/collections" },
        ],
      },
      {
        title: "About",
        items: [
          { title: "Our Story", href: "/about" },
          { title: "Contact", href: "/contact" },
        ],
      },
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
    <footer
      className={cn(
        "bg-foreground text-background/70 mt-20 md:mt-28 border-t border-background/15",
        settings.className,
        className,
      )}
      style={{ ...themeOverrideStyles, ...style }}
    >
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3 mb-10">
          {links.map((section, index) => (
            <div key={index}>
              <p className="text-sm font-semibold uppercase tracking-wide mb-4 text-background">
                {section.title}
              </p>
              <div className="flex flex-col gap-y-2 flex-wrap text-sm">
                {section.items.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    onClick={(e) => handleLinkClick(e, item.href)}
                    className="text-background/70 hover:text-primary transition-colors"
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="text-2xl font-semibold text-background">
              {brandName}
            </div>
            <div className="text-xs text-background/70">
              <p>{address}</p>
              <p>
                {phone} /{" "}
                <a
                  className="hover:underline hover:text-primary"
                  href={`mailto:${email}`}
                >
                  {email}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

MainFooter.displayName = "MainFooter";

export default React.memo(MainFooter);
