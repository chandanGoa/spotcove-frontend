/**
 * SimpleNavbar - Enhanced Navigation Component
 *
 * Props-driven — no authentication, no database, no server state.
 * Cart count, user, and search are injected by the parent via props.
 */
"use client";

import React, { useState } from "react";
import { cn } from "../utils";
import { getThemeOverrideStyles } from "../theme-wrapper";

export interface NavLink {
  label: string;
  href: string;
}

export interface SimpleNavbarSettings {
  brandName?: string;
  brandLogo?: string; // URL to logo image
  links?: NavLink[];
  showSearch?: boolean;
  className?: string;
}

export interface SimpleNavbarUser {
  name: string;
  avatar?: string;
}

export interface SimpleNavbarProps {
  settings?: SimpleNavbarSettings;
  themeOverride?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
  // Cart
  cartCount?: number;
  onCartClick?: () => void;
  // Auth
  user?: SimpleNavbarUser | null;
  onAuthClick?: () => void;
  // Search
  onSearch?: (query: string) => void;
  // Link interception
  onLinkClick?: (href: string) => void;
}

const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const SimpleNavbar: React.FC<SimpleNavbarProps> = ({
  settings = {},
  themeOverride,
  className,
  style,
  cartCount,
  onCartClick,
  user,
  onAuthClick,
  onSearch,
  onLinkClick,
}) => {
  const {
    brandName = "Store",
    brandLogo,
    links = [
      { label: "Home", href: "/" },
      { label: "Products", href: "/products" },
      { label: "About", href: "/about" },
    ],
    showSearch = true,
  } = settings;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);

  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    if (onLinkClick) {
      e.preventDefault();
      onLinkClick(href);
    }
    setMobileOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchExpanded(false);
      setSearchQuery("");
    }
  };

  const hasCart = cartCount !== undefined || !!onCartClick;
  const hasAuth = user !== undefined || !!onAuthClick;
  const hasSearch = showSearch && !!onSearch;

  return (
    <nav
      className={cn(
        "bg-card shadow-sm border-b sticky top-0 z-50",
        settings.className,
        className,
      )}
      style={{ ...themeOverrideStyles, ...style }}
    >
      {/* Desktop bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, "/")}
            className="flex items-center gap-2 shrink-0"
          >
            {brandLogo ? (
              <img
                src={brandLogo}
                alt={brandName}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span
                className="text-xl font-semibold text-foreground"
                style={{ fontFamily: "var(--font-heading, inherit)" }}
              >
                {brandName}
              </span>
            )}
          </a>

          {/* Desktop nav links */}
          <ul className="hidden md:flex gap-6 items-center">
            {links.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                  style={{ fontFamily: "var(--font-body, inherit)" }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search */}
            {hasSearch && (
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center"
              >
                {searchExpanded ? (
                  <>
                    <input
                      autoFocus
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onBlur={() => !searchQuery && setSearchExpanded(false)}
                      placeholder="Search..."
                      className="w-48 pl-3 pr-8 py-1.5 text-sm rounded-full border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      style={{ fontFamily: "var(--font-body, inherit)" }}
                    />
                    <button
                      type="submit"
                      className="absolute right-2 text-muted-foreground hover:text-primary"
                      aria-label="Search"
                    >
                      <SearchIcon />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSearchExpanded(true)}
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Open search"
                  >
                    <SearchIcon />
                  </button>
                )}
              </form>
            )}

            {/* Cart */}
            {hasCart && (
              <button
                onClick={onCartClick}
                className="relative p-1.5 text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Cart${cartCount ? `, ${cartCount} items` : ""}`}
              >
                <CartIcon />
                {!!cartCount && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center leading-none px-1">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Auth */}
            {hasAuth && (
              <button
                onClick={onAuthClick}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                aria-label={user ? user.name : "Sign in"}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-border"
                  />
                ) : (
                  <span className="p-1.5">
                    <UserIcon />
                  </span>
                )}
                <span
                  className="hidden lg:inline font-medium"
                  style={{ fontFamily: "var(--font-body, inherit)" }}
                >
                  {user ? user.name : "Sign in"}
                </span>
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile expanded menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t border-border bg-card"
          style={{ fontFamily: "var(--font-body, inherit)" }}
        >
          {/* Mobile search */}
          {hasSearch && (
            <div className="px-4 py-3 border-b border-border">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 px-3 py-2 text-sm rounded-full border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          )}

          {/* Mobile links */}
          <ul className="py-2">
            {links.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="block px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile cart + auth */}
          {(hasCart || hasAuth) && (
            <div className="px-4 py-3 border-t border-border flex items-center gap-4">
              {hasCart && (
                <button
                  onClick={() => {
                    onCartClick?.();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <span className="relative">
                    <CartIcon />
                    {!!cartCount && cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center leading-none px-0.5">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    )}
                  </span>
                  <span>Cart{cartCount ? ` (${cartCount})` : ""}</span>
                </button>
              )}
              {hasAuth && (
                <button
                  onClick={() => {
                    onAuthClick?.();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <UserIcon />
                  )}
                  <span>{user ? user.name : "Sign in"}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

SimpleNavbar.displayName = "SimpleNavbar";

export default SimpleNavbar;
