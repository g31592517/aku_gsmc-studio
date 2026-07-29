import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { getYoutubeEmbedUrl, getYoutubeWatchUrl } from "../utils/videoData";

export default function VideoLightboxModal({ youtubeId, title, onClose }) {
  useEffect(() => {
    document.body.style.overflow = youtubeId ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [youtubeId]);

  useEffect(() => {
    const handleEscapeKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {youtubeId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          style={{ background: "rgba(10,26,15,0.85)" }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title || "Video preview"}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-white text-sm font-medium truncate pr-4">
                {title}
              </p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={getYoutubeWatchUrl(youtubeId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors"
                >
                  <ExternalLink size={13} aria-hidden="true" />
                  Open on YouTube
                </a>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  aria-label="Close video"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Player */}
            <div className="rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video">
              <iframe
                key={youtubeId}
                src={getYoutubeEmbedUrl(youtubeId)}
                title={title || "Video player"}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
