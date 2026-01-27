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
        "bg-muted-background mt-[80px] md:mt-[180px] border-t border-zinc-600",
        settings.className,
        className
      )}
      style={{ ...themeOverrideStyles, ...style }}
    >
      <div className="container pb-10 pt-4 md:pt-8">
        <div className="grid grid-cols-3 gap-x-6 mb-[80px]">
          {links.map((section, index) => (
            <div key={index}>
              <p className="font-semibold mb-3">{section.title}</p>
              <div className="flex flex-col gap-y-2 flex-wrap">
                {section.items.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    onClick={(e) => handleLinkClick(e, item.href)}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-x-5 justify-between flex-col md:flex-row md:items-center items-start">
          <div className="flex flex-col md:flex-row gap-x-5 md:items-center items-start mb-4 md:mb-0">
            <div className="text-3xl font-bold">{brandName}</div>
            <div className="text-[10px] font-light">
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
