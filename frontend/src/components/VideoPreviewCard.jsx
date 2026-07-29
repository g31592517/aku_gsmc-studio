import React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { getYoutubeThumbnailUrl } from "../utils/videoData";
import { useYoutubeMetadata } from "../hooks/useYoutubeMetadata";

const categoryAccent = {
  "Podcast Production": "from-aku-amber to-aku-green",
  "Audio Production": "from-aku-violet to-aku-green",
  "Video Production": "from-aku-green to-aku-greenLight",
};

export default function VideoPreviewCard({ video, index, onPlay, cardHeight = "h-56" }) {
  const { title, authorName, isLoaded } = useYoutubeMetadata(video.youtubeId);
  const accentGradient = categoryAccent[video.category] || "from-aku-green to-aku-greenLight";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className={`relative ${cardHeight} rounded-2xl overflow-hidden group cursor-pointer shadow-card hover:shadow-card-hover transition-all duration-400`}
      onClick={() => onPlay(video.youtubeId, title)}
      role="button"
      tabIndex={0}
      aria-label={`Play preview: ${title}`}
      onKeyDown={(e) => e.key === "Enter" && onPlay(video.youtubeId, title)}
    >
      {/* Thumbnail */}
      <img
        src={getYoutubeThumbnailUrl(video.youtubeId)}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        draggable={false}
      />

      {/* Gradient overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />

      {/* Category chip */}
      <span
        className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${accentGradient}`}
      >
        {video.category}
      </span>

      {/* Play button — center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white transition-all duration-300">
          <Play size={20} className="text-aku-green fill-aku-green ml-0.5" aria-hidden="true" />
        </div>
      </div>

      {/* Title + author */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p
          className={`text-white text-sm font-semibold leading-snug line-clamp-2 ${!isLoaded ? "opacity-60" : ""}`}
        >
          {title}
        </p>
        {authorName && (
          <p className="text-white/60 text-xs mt-1">{authorName}</p>
        )}
      </div>
    </motion.article>
  );
}
