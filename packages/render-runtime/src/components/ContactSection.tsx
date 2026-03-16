/**
 * ContactSection - Contact / social CTA section (Render Runtime)
 *
 * NO database imports, NO next/image, NO next/link.
 * Social links, contact button, and optional form — all via props/settings.
 * Form submit fires onSubmit callback (no API call in this component).
 */
"use client";

import React, { memo, useState } from "react";
import { cn } from "../utils";
import { getThemeOverrideStyles } from "../theme-wrapper";

interface SocialLink {
  platform: "facebook" | "instagram" | "twitter" | "linkedin" | "youtube" | string;
  href: string;
}

export interface ContactSectionSettings {
  heading?: string;
  body?: string;
  contactButtonText?: string;
  contactButtonHref?: string;
  avatarImage?: string;
  socials?: SocialLink[];
  showForm?: boolean;
  formTitle?: string;
  maxWidth?: number | string;
  align?: "left" | "center" | "right";
  paddingY?: number | string;
  containerPadding?: number | string;
  className?: string;
}

export interface ContactSectionProps {
  settings?: ContactSectionSettings;
  themeOverride?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
  onSubmit?: (data: { name: string; email: string; message: string }) => void;
  onContactClick?: (href: string) => void;
  onSocialClick?: (platform: string, href: string) => void;
}

const toCssValue = (v?: number | string) =>
  typeof v === "number" ? `${v}px` : v;

// Minimal SVG icons for common social platforms
const SocialIcons: Record<string, React.FC<{ size?: number }>> = {
  facebook: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  instagram: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  twitter: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  ),
  linkedin: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
};

function SocialButton({
  link,
  onClick,
}: {
  link: SocialLink;
  onClick?: (platform: string, href: string) => void;
}) {
  const Icon = SocialIcons[link.platform] ?? (({ size = 20 }) => (
    <span style={{ width: size, height: size, display: "inline-block" }} />
  ));

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={link.platform}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick(link.platform, link.href);
        }
      }}
      className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
    >
      <Icon size={20} />
    </a>
  );
}

export const ContactSection = memo(function ContactSection({
  settings = {},
  themeOverride,
  className,
  style,
  onSubmit,
  onContactClick,
  onSocialClick,
}: ContactSectionProps) {
  const {
    heading = "Get in touch",
    body = "Have a question or want to collaborate? Reach out — we'd love to hear from you.",
    contactButtonText = "Contact Us",
    contactButtonHref = "/contact",
    avatarImage,
    socials = [],
    showForm = false,
    formTitle = "Send a message",
    maxWidth,
    align = "center",
    paddingY,
    containerPadding,
  } = settings;

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const themeOverrideStyles = getThemeOverrideStyles(themeOverride);
  const sectionPadding = toCssValue(paddingY ?? 48);
  const innerPadding = toCssValue(containerPadding ?? 20);
  const gradientBg =
    "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent, var(--secondary))) 100%)";

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
      setSubmitted(true);
    }
  };

  return (
    <section
      className={cn("w-full bg-background", className)}
      style={{
        ...themeOverrideStyles,
        ...style,
        paddingTop: sectionPadding,
        paddingBottom: sectionPadding,
      }}
    >
      <div
        className="rounded-xl mx-auto"
        style={{
          maxWidth: maxWidth ? toCssValue(maxWidth) : "56rem",
          padding: innerPadding,
          background: gradientBg,
          textAlign: align,
        }}
      >
        <div className="space-y-8">
          {/* Optional avatar */}
          {avatarImage && (
            <div>
              <img
                src={avatarImage}
                alt="Contact avatar"
                className="mx-auto rounded w-24 h-24 object-cover"
              />
            </div>
          )}

          {/* Heading + body */}
          <div>
            <h4
              className="text-3xl font-semibold mb-4 text-foreground"
              style={{ fontFamily: "var(--font-heading, inherit)" }}
            >
              {heading}
            </h4>
            {body && (
              <p
                className="text-base max-w-xl mx-auto text-foreground/90"
                style={{ fontFamily: "var(--font-body, inherit)" }}
              >
                {body}
              </p>
            )}
          </div>

          {/* Social links */}
          {socials.length > 0 && (
            <div className="flex justify-center gap-3 flex-wrap">
              {socials.map((link, i) => (
                <SocialButton key={i} link={link} onClick={onSocialClick} />
              ))}
            </div>
          )}

          {/* Contact button */}
          {!showForm && contactButtonText && (
            <div>
              <a
                href={contactButtonHref}
                onClick={(e) => {
                  if (onContactClick) {
                    e.preventDefault();
                    onContactClick(contactButtonHref ?? "/contact");
                  }
                }}
                className="inline-block border-2 border-foreground rounded-full px-8 py-3 text-foreground hover:bg-foreground hover:text-background transition-colors"
                style={{ fontFamily: "var(--font-body, inherit)" }}
              >
                {contactButtonText}
              </a>
            </div>
          )}

          {/* Optional inline form */}
          {showForm && (
            <div className="mt-6">
              {formTitle && (
                <h5
                  className="text-xl font-semibold text-foreground mb-4"
                  style={{ fontFamily: "var(--font-heading, inherit)" }}
                >
                  {formTitle}
                </h5>
              )}
              {submitted ? (
                <p className="text-foreground font-medium">
                  ✓ Message sent! We'll be in touch soon.
                </p>
              ) : (
                <form
                  onSubmit={handleFormSubmit}
                  className="flex flex-col gap-3 max-w-md mx-auto text-left"
                >
                  <input
                    type="text"
                    placeholder="Your name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    style={{ fontFamily: "var(--font-body, inherit)" }}
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    style={{ fontFamily: "var(--font-body, inherit)" }}
                  />
                  <textarea
                    placeholder="Your message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/40"
                    style={{ fontFamily: "var(--font-body, inherit)" }}
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors text-sm font-semibold"
                    style={{ fontFamily: "var(--font-body, inherit)" }}
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

ContactSection.displayName = "ContactSection";
(ContactSection as any).__metadata = {
  tier: 2,
  description:
    "Contact section with avatar, heading, social links, and optional inline form with onSubmit callback",
  settingsType: "ContactSectionSettings",
};

export default ContactSection;
