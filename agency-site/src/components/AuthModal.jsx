import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone } from "lucide-react";

const initialFormState = { email: "", contactNumber: "" };

const initialErrorState = { email: "", contactNumber: "" };

function validateEmail(value) {
  if (!value.trim()) return "Email address is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address.";
  return "";
}

function validateContactNumber(value) {
  if (!value.trim()) return "Contact number is required.";
  if (!/^\+?[\d\s\-().]{7,20}$/.test(value)) return "Please enter a valid contact number.";
  return "";
}

export default function AuthModal({ isOpen, onClose }) {
  const [formValues, setFormValues] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  // Lock background scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Escape key closes modal
  useEffect(() => {
    const onEscape = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [onClose]);

  function handleFieldChange(field, value) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validateAll() {
    const errors = {
      email: validateEmail(formValues.email),
      contactNumber: validateContactNumber(formValues.contactNumber),
    };
    setFormErrors(errors);
    return !errors.email && !errors.contactNumber;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateAll()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:4000/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formValues.email,
          contactNumber: formValues.contactNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
      } else {
        setFormErrors((prev) => ({
          ...prev,
          email: data.message || "Something went wrong. Please try again.",
        }));
      }
    } catch {
      setFormErrors((prev) => ({
        ...prev,
        email: "Could not connect to the server. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setFormValues(initialFormState);
    setFormErrors(initialErrorState);
    setIsSuccess(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          style={{ background: "rgba(10,26,15,0.75)", backdropFilter: "blur(4px)" }}
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label="Sign in to AKU Creative Services"
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-subtle hover:bg-surface-overlay flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
              aria-label="Close sign in"
            >
              <X size={15} aria-hidden="true" />
            </button>

            {isSuccess ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-aku-primary flex items-center justify-center mx-auto mb-5 shadow-glow-green-sm">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="font-display font-extrabold text-2xl text-text-primary mb-2">
                  You're signed in
                </h2>
                <p className="text-text-muted text-sm mb-6">
                  Welcome to AKU Creative Services.
                </p>
                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-xl bg-aku-primary text-white font-semibold text-sm hover:shadow-glow-green transition-all duration-300"
                >
                  Continue
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-8">
                  <span className="text-aku-greenLight text-xs font-semibold tracking-widest uppercase">
                    Welcome
                  </span>
                  <h2 className="font-display font-extrabold text-2xl text-text-primary mt-1">
                    Sign In
                  </h2>
                  <p className="text-text-muted text-sm mt-1">
                    Enter your details to access AKU Creative Services.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  {/* Email field */}
                  <div className="mb-5">
                    <label
                      htmlFor="auth-email"
                      className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        size={15}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        ref={firstInputRef}
                        id="auth-email"
                        type="email"
                        placeholder="you@example.com"
                        value={formValues.email}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-text-primary placeholder:text-text-placeholder bg-surface-subtle focus:outline-none focus:border-aku-green/50 transition-colors ${
                          formErrors.email ? "border-red-400" : "border-surface-border"
                        }`}
                        autoComplete="email"
                        aria-describedby={formErrors.email ? "email-error" : undefined}
                        aria-invalid={!!formErrors.email}
                      />
                    </div>
                    {formErrors.email && (
                      <p id="email-error" className="text-red-500 text-xs mt-1.5" role="alert">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Contact number field */}
                  <div className="mb-7">
                    <label
                      htmlFor="auth-contact"
                      className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2"
                    >
                      Contact Number
                    </label>
                    <div className="relative">
                      <Phone
                        size={15}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        id="auth-contact"
                        type="tel"
                        placeholder="+254 700 000 000"
                        value={formValues.contactNumber}
                        onChange={(e) => handleFieldChange("contactNumber", e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-text-primary placeholder:text-text-placeholder bg-surface-subtle focus:outline-none focus:border-aku-green/50 transition-colors ${
                          formErrors.contactNumber ? "border-red-400" : "border-surface-border"
                        }`}
                        autoComplete="tel"
                        aria-describedby={formErrors.contactNumber ? "contact-error" : undefined}
                        aria-invalid={!!formErrors.contactNumber}
                      />
                    </div>
                    {formErrors.contactNumber && (
                      <p id="contact-error" className="text-red-500 text-xs mt-1.5" role="alert">
                        {formErrors.contactNumber}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-aku-primary text-white font-semibold text-sm hover:shadow-glow-green disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {isSubmitting ? "Signing in\u2026" : "Sign In"}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
