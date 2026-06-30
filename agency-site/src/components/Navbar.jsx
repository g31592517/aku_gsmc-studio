import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import akuLogo from "../assets/logo.jpeg";

const navigationLinks = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Inspiration", href: "#inspiration" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hideNav, setHideNav] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHideNav(true);
      } else {
        setHideNav(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: hideNav ? -130 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-nav border-b border-surface-border py-2.5"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* Logo + Brand Name */}
          <a
            href="#"
            className="flex items-center gap-3"
            aria-label="GSMC STUDIO — Home"
          >
            <img
              src={akuLogo}
              alt="GSMC STUDIO"
              className="h-[120px] w-auto object-contain"
              draggable={false}
            />
            <span className="font-display font-extrabold text-4xl tracking-tight text-text-primary">
              GSMC <span className="text-aku-green">Studio</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-8"
          >
            {navigationLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm font-medium text-text-secondary hover:text-aku-green transition-colors duration-200 relative group"
              >
                {label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-aku-green group-hover:w-full transition-all duration-300 rounded-full" />
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors px-4 py-2 rounded-lg hover:bg-surface-subtle">
              Sign In
            </button>
            <button className="text-sm font-semibold bg-aku-primary text-white px-5 py-2.5 rounded-full hover:shadow-glow-green transition-all duration-300 hover:scale-105 active:scale-95">
              Submit your ideas, 
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-text-primary p-2 rounded-lg hover:bg-surface-subtle transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white flex flex-col pt-24 px-8 gap-5 md:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-4 mb-6">
              <img
                src={akuLogo}
                alt="GSMC STUDIO"
                className="h-[100px] w-auto object-contain"
                draggable={false}
              />
              <span className="font-display font-extrabold text-3xl tracking-tight text-text-primary">
                GSMC <span className="text-aku-green">STUDIO</span>
              </span>
            </div>
            {navigationLinks.map(({ label, href }, index) => (
              <motion.a
                key={label}
                href={href}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className="text-2xl font-display font-semibold text-text-primary hover:text-aku-green transition-colors border-b border-surface-border pb-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {label}
              </motion.a>
            ))}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-base font-semibold bg-aku-primary text-white px-7 py-4 rounded-full w-fit"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Start Your Project →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
