import React, { useState } from "react";
import { motion } from "framer-motion";
import VideoPreviewCard from "./VideoPreviewCard";
import VideoLightboxModal from "./VideoLightboxModal";
import { featuredVideoReel } from "../utils/videoData";

const filterTabs = ["All", "Podcast Production", "Audio Production", "Video Production"];

export default function FeaturedWorkReel() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeVideo, setActiveVideo] = useState(null);

  const visibleVideos =
    activeFilter === "All"
      ? featuredVideoReel
      : featuredVideoReel.filter((v) => v.category === activeFilter);

  return (
    <section
      id="featured-work"
      className="py-24 px-6 bg-white section-divider"
      aria-labelledby="featured-work-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <span className="text-aku-greenLight text-sm font-semibold tracking-widest uppercase">
              Featured Work
            </span>
            <h2
              id="featured-work-heading"
              className="font-display font-extrabold text-3xl md:text-4xl text-text-primary mt-2"
            >
              Creative edits made. Ni mwecheche.
            </h2>
            <p className="text-text-muted text-base mt-3 max-w-lg">
              A look at our podcast, audio and video production work.
              Click any preview to watch in full.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by production type">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilter === tab
                    ? "bg-aku-primary text-white shadow-glow-green-sm"
                    : "bg-surface-subtle border border-surface-border text-text-muted hover:text-text-primary hover:border-aku-green/30"
                }`}
                aria-pressed={activeFilter === tab}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Video grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleVideos.map((video, index) => (
            <VideoPreviewCard
              key={video.id}
              video={video}
              index={index}
              onPlay={(youtubeId, title) => setActiveVideo({ youtubeId, title })}
            />
          ))}
        </div>
      </div>

      <VideoLightboxModal
        youtubeId={activeVideo?.youtubeId}
        title={activeVideo?.title}
        onClose={() => setActiveVideo(null)}
      />
    </section>
  );
}
