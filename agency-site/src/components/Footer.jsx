import React from "react";
import akuLogo from "../assets/logo.jpeg";

const socialLinks = [
  {
    label: "Instagram",
    handle: "@akugsmc",
    href: "https://www.instagram.com/akugsmc",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "X (Twitter)",
    handle: "@aku_gsmc",
    href: "https://www.x.com/aku_gsmc",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    handle: "AKU GSMC",
    href: "https://www.facebook.com/akugsmc",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
];

export default function SiteFooter() {
  return (
    <footer
      className="border-t border-surface-border bg-surface-subtle px-6 py-16"
      aria-label="Site footer"
    >
      <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-8">

        {/* Logo */}
        <a href="#" aria-label="AKU Creative Services — Home">
          <img
            src={akuLogo}
            alt="AKU Graduate School of Media and Communications"
            className="h-12 w-auto object-contain"
            draggable={false}
          />
        </a>

        {/* Description */}
        <p className="text-text-muted text-sm leading-relaxed max-w-sm">
          The Aga Khan University Graduate School of Media and Communications.
          Creative and multimedia services for the AKU community.
        </p>

        {/* Social links */}
        <nav aria-label="Social media links">
          <ul className="flex items-center justify-center gap-6">
            {socialLinks.map(({ label, handle, href, icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} — ${handle}`}
                  className="group flex flex-col items-center gap-1.5"
                >
                  <span className="
                    w-10 h-10 rounded-full
                    border border-surface-border bg-white
                    flex items-center justify-center
                    text-text-muted
                    group-hover:text-aku-green
                    group-hover:border-aku-green/40
                    group-hover:shadow-glow-green-sm
                    transition-all duration-300
                  ">
                    {icon}
                  </span>
                  <span className="text-xs text-text-muted group-hover:text-aku-green transition-colors duration-200 font-medium">
                    {handle}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Divider */}
        <div className="w-full border-t border-surface-border" />

        {/* Copyright */}
        <p className="text-xs text-text-muted">
          © {new Date().getFullYear()} Aga Khan University Graduate School of Media and Communications. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
