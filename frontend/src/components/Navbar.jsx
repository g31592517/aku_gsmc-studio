import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import akuLogo from "../assets/logo.jpeg";
import { useCurrentUser } from "../context/UserContext";
import { useUnseenRequestUpdates } from "../hooks/useUnseenRequestUpdates";

// hash: null means "go to the top of the home page"
// page: the dedicated route this link jumps to when not already on the homepage
const navigationLinks = [
  { label: "Home", hash: null, page: null },
  { label: "Services", hash: "#services", page: "/services" },
  { label: "Inspiration", hash: "#inspiration", page: "/inspiration" },
  { label: "Featured Work", hash: "#featured-work", page: "/work" },
  { label: "Contact", hash: "#contact", page: null },
];

const MINIMIZED_NAV_PATHS = ["/services", "/work", "/inspiration"];

function dashboardDestination(role) {
  return role === "staff" || role === "admin"
    ? { href: "/staff/dashboard", label: "Dashboard" }
    : { href: "/my-requests", label: "My Requests" };
}

export default function Navbar() {
  const { currentUser, signOut, openAuthModal, requestsSeenVersion } = useCurrentUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const unseenCount = useUnseenRequestUpdates(currentUser, requestsSeenVersion);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const dashboard = currentUser ? dashboardDestination(currentUser.role) : null;
  const showBadge = dashboard?.label === "My Requests" && unseenCount > 0;
  const isMinimized = MINIMIZED_NAV_PATHS.includes(location.pathname);

  // Landing-page sections only exist on "/" — from anywhere else with a
  // dedicated page, navigate straight there; otherwise fall back to
  // navigating home with a hash (App.jsx's LandingPage watches for that).
  function goToSection(hash, page) {
    if (location.pathname === "/") {
      if (hash) {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (page) {
      navigate(page);
    } else {
      navigate(hash ? `/${hash}` : "/");
    }
  }

  const authCluster = currentUser ? (
    <>
      <div className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full bg-surface-subtle">
        <span className="w-7 h-7 rounded-full bg-aku-primary flex items-center justify-center flex-shrink-0">
          <User size={14} className="text-white" aria-hidden="true" />
        </span>
        <span className="text-xs font-medium text-text-secondary truncate max-w-[140px]">
          {currentUser.email}
        </span>
      </div>
      <Link
        to={dashboard.href}
        className="relative text-sm font-medium text-text-secondary hover:text-aku-green transition-colors px-4 py-2 rounded-lg hover:bg-surface-subtle"
      >
        {dashboard.label}
        {showBadge && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-aku-amber text-white text-[10px] font-bold flex items-center justify-center"
            aria-label={`${unseenCount} unseen update${unseenCount === 1 ? "" : "s"}`}
          >
            {unseenCount}
          </span>
        )}
      </Link>
      <button
        onClick={signOut}
        className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors px-4 py-2 rounded-lg hover:bg-surface-subtle"
      >
        Sign Out
      </button>
    </>
  ) : (
    <button
      onClick={() => openAuthModal()}
      className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors px-4 py-2 rounded-lg hover:bg-surface-subtle"
    >
      Sign In
    </button>
  );

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-nav border-b border-surface-border py-2.5"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* Logo + Brand Name */}
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); goToSection(null, null); }}
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

          {isMinimized ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => goToSection(null, null)}
                className="text-sm font-medium text-text-secondary hover:text-aku-green transition-colors px-4 py-2 rounded-lg hover:bg-surface-subtle"
              >
                Home
              </button>
              {authCluster}
            </div>
          ) : (
            <>
              {/* Desktop Navigation */}
              <nav
                aria-label="Primary navigation"
                className="hidden md:flex items-center gap-8"
              >
                {navigationLinks.map(({ label, hash, page }) => (
                  <a
                    key={label}
                    href={hash || "/"}
                    onClick={(e) => { e.preventDefault(); goToSection(hash, page); }}
                    className="text-sm font-medium text-text-secondary hover:text-aku-green transition-colors duration-200 relative group"
                  >
                    {label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-aku-green group-hover:w-full transition-all duration-300 rounded-full" />
                  </a>
                ))}
              </nav>

              {/* Desktop CTA */}
              <div className="hidden md:flex items-center gap-3">
                {authCluster}
                {!currentUser && (
                  <button
                    onClick={() => goToSection("#contact", null)}
                    className="text-sm font-semibold bg-aku-primary text-white px-5 py-2.5 rounded-full hover:shadow-glow-green transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Start Project
                  </button>
                )}
              </div>
            </>
          )}

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
            className="fixed inset-0 z-40 bg-white flex flex-col pt-24 px-8 gap-5 md:hidden overflow-y-auto"
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

            {currentUser && (
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 pb-4 border-b border-surface-border"
              >
                <span className="w-9 h-9 rounded-full bg-aku-primary flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-white" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-text-secondary truncate">
                  {currentUser.email}
                </span>
              </motion.div>
            )}

            {isMinimized ? (
              <motion.a
                href="/"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-display font-semibold text-text-primary hover:text-aku-green transition-colors border-b border-surface-border pb-4"
                onClick={(e) => {
                  e.preventDefault();
                  goToSection(null, null);
                  setIsMobileMenuOpen(false);
                }}
              >
                Home
              </motion.a>
            ) : (
              navigationLinks.map(({ label, hash, page }, index) => (
                <motion.a
                  key={label}
                  href={hash || "/"}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="text-2xl font-display font-semibold text-text-primary hover:text-aku-green transition-colors border-b border-surface-border pb-4"
                  onClick={(e) => {
                    e.preventDefault();
                    goToSection(hash, page);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {label}
                </motion.a>
              ))
            )}

            {currentUser ? (
              <>
                <Link
                  to={dashboard.href}
                  className="flex items-center gap-3 text-2xl font-display font-semibold text-text-primary hover:text-aku-green transition-colors border-b border-surface-border pb-4"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {dashboard.label}
                  {showBadge && (
                    <span
                      className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-aku-amber text-white text-xs font-bold flex items-center justify-center"
                      aria-label={`${unseenCount} unseen update${unseenCount === 1 ? "" : "s"}`}
                    >
                      {unseenCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="mt-4 text-base font-semibold border border-surface-border text-text-secondary px-7 py-4 rounded-full w-fit"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 text-base font-semibold bg-aku-primary text-white px-7 py-4 rounded-full w-fit"
                onClick={() => {
                  openAuthModal();
                  setIsMobileMenuOpen(false);
                }}
              >
                Sign In
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
