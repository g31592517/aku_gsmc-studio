import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

function useFocusTrap(isOpen, containerRef) {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const focusableSelectors = [
      "button",
      "[href]",
      "input",
      "select",
      "textarea",
      "[tabindex]:not([tabindex='-1'])",
    ].join(", ");

    const all = containerRef.current.querySelectorAll(focusableSelectors);
    const first = all[0];
    const last = all[all.length - 1];

    first?.focus();

    function onTab(e) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    containerRef.current.addEventListener("keydown", onTab);
    return () => containerRef.current?.removeEventListener("keydown", onTab);
  }, [isOpen, containerRef]);
}

export default function InspirationLightbox({ item, onClose }) {
  const isOpen = !!item;
  const modalRef = useRef(null);

  useFocusTrap(isOpen, modalRef);

  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const onEscape = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && item && (
        // Backdrop — clicking here closes the modal
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
          style={{ background: "rgba(10,26,15,0.82)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Preview: ${item.title}`}
        >
          {/* Modal panel — clicks here do not close the modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row"
            style={{ maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* X close button — top right */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
              aria-label="Close preview"
            >
              <X size={16} aria-hidden="true" />
            </button>

            {/* Left panel — image at full resolution */}
            <div
              className="relative lg:w-3/5 w-full bg-surface-subtle flex-shrink-0"
              style={{ minHeight: "280px" }}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                style={{ minHeight: "280px", maxHeight: "70vh" }}
                draggable={false}
              />
              {/* Category badge over the image */}
              <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-aku-primary shadow-sm">
                {item.category}
              </span>
            </div>

            {/* Right panel — project details */}
            <div className="lg:w-2/5 w-full flex flex-col justify-center p-8 overflow-y-auto">
              <span className="text-aku-greenLight text-xs font-semibold tracking-widest uppercase mb-3">
                {item.category}
              </span>
              <h2 className="font-display font-extrabold text-2xl text-text-primary mb-3 leading-snug">
                {item.title}
              </h2>
              <p className="text-text-muted text-sm leading-relaxed mb-6">
                {item.description}
              </p>

              {item.tags && item.tags.length > 0 && (
                <div
                  className="flex flex-wrap gap-2 mb-8"
                  aria-label="Creative tags"
                >
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-surface-subtle border border-surface-border text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={onClose}
                className="mt-auto w-full py-3 rounded-xl font-semibold text-sm bg-aku-primary text-white hover:shadow-glow-green transition-all duration-300"
              >
                Close Preview
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
