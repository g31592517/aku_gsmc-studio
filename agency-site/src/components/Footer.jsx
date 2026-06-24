import React from "react";
import { Image, MessageCircle, Play, Briefcase } from "lucide-react";
import akuLogo from "../assets/logo.jpeg";

const footerNavigationGroups = {
  Services: ["Videography", "Photography", "Audio Editing", "Pricing"],
  Company: ["About Us", "Portfolio", "Blog", "Careers"],
  Support: ["Contact", "FAQ", "Privacy Policy", "Terms of Service"],
};

const socialMediaLinks = [
  { icon: Image, label: "Instagram", href: "#" },
  { icon: MessageCircle, label: "Twitter / X", href: "#" },
  { icon: Play, label: "YouTube", href: "#" },
  { icon: Briefcase, label: "LinkedIn", href: "#" },
];

export default function SiteFooter() {
  return (
    <footer
      className="border-t border-surface-border px-6 py-16 bg-surface-subtle"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand column */}
          <div className="md:col-span-2">
            <a
              href="#"
              className="inline-block mb-4"
              aria-label="AKU Creative Services — Home"
            >
              <img
                src={akuLogo}
                alt="AKU Creative Services"
                className="h-10 w-auto object-contain"
                draggable={false}
              />
            </a>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs mb-6">
              Services poa for the brands and artists and evryone whith briliant
              idea. Videography, photography and audio crafted with
              intention.


            </p>
            <nav
              aria-label="Social media links"
              className="flex gap-3"
            >
              {socialMediaLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                   className="w-9 h-9 bg-white border border-surface-border rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:border-aku-green/40 transition-all duration-300"
                >
                  <Icon size={15} aria-hidden="true" />
                </a>
              ))}
            </nav>
          </div>

          {/* Navigation groups */}
          {Object.entries(footerNavigationGroups).map(([groupName, groupLinks]) => (
            <nav key={groupName} aria-label={`${groupName} navigation`}>
              <h3 className="font-display font-semibold text-text-primary text-sm mb-4 uppercase tracking-wider">
                {groupName}
              </h3>
              <ul className="space-y-2.5">
                {groupLinks.map((linkLabel) => (
                  <li key={linkLabel}>
                    <a
                      href="#"
                      className="text-sm text-text-muted hover:text-text-primary transition-colors duration-200"
                    >
                      {linkLabel}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-t border-surface-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} AKU Creative Services. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            Built for creatives who demand better.
          </p>
        </div>
      </div>
    </footer>
  );
}
