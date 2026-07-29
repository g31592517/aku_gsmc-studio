import React, { useState } from "react";
import { motion } from "framer-motion";

export default function InspirationImageCard({ item, onOpenLightbox }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`
        break-inside-avoid relative ${item.cardHeight} rounded-2xl overflow-hidden
        mb-4 cursor-pointer group
        border border-transparent hover:border-aku-green/30
        shadow-card hover:shadow-card-hover
        transition-shadow duration-300
      `}
      style={{ WebkitTransition: "box-shadow 0.3s ease" }}
      onClick={() => onOpenLightbox(item)}
      role="button"
      tabIndex={0}
      aria-label={`Open preview: ${item.title} — ${item.category}`}
      onKeyDown={(e) => e.key === "Enter" && onOpenLightbox(item)}
    >
      {/* Skeleton placeholder — only visible while image is still loading */}
      {!isImageLoaded && (
        <div
          className="absolute inset-0 bg-surface-overlay animate-pulse"
          aria-hidden="true"
        />
      )}

      <img
        src={item.imageUrl}
        alt={item.title}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsImageLoaded(true)}
        className={`
          absolute inset-0 w-full h-full object-cover
          transition-opacity duration-500
          ${isImageLoaded ? "opacity-100" : "opacity-0"}
        `}
        style={{
          willChange: "transform",
          transform: "translateZ(0)",
        }}
        draggable={false}
      />

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-aku-primary shadow-sm">
        {item.category}
      </span>

      <div
        className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none flex items-center justify-center"
        aria-hidden="true"
      >
        <div
          className="
            w-10 h-10 rounded-full
            bg-white/0 group-hover:bg-white/90
            flex items-center justify-center
            scale-75 group-hover:scale-100
            opacity-0 group-hover:opacity-100
            transition-all duration-300
          "
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#008D4F"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
      </div>
    </motion.article>
  );
}
