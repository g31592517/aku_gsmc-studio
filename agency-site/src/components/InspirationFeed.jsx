import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Bookmark, Search, ExternalLink as ExternalLinkIcon, Play } from "lucide-react";
import VideoLightboxModal from "./VideoLightboxModal";
import { featuredVideoReel, getYoutubeThumbnailUrl } from "../utils/videoData";
import { useYoutubeMetadata } from "../hooks/useYoutubeMetadata";

// A few videos from the featured reel, woven into the inspiration grid for variety
const inspirationVideoPicks = [
  { ...featuredVideoReel[2], cardHeight: "h-64" },
  { ...featuredVideoReel[6], cardHeight: "h-56" },
  { ...featuredVideoReel[5], cardHeight: "h-48" },
];

const inspirationCategories = [
  "All",
  "Flyer & Poster Design",
  "Print & Publication Design",
  "Merchandise & Mockup Design",
  "Animated Explainer Videos",
  "Podcast Production (Video & Audio)",
  "Professional Videography & Photography",
];

const inspirationGalleryItems = [
  // Flyer & Poster Design
  {
    id: "insp-001",
    category: "Flyer & Poster Design",
    title: "Event Flyer Design",
    description: "Bold and engaging flyer layouts for campus and community events.",
    imageUrl: "/Assets/flyer1.jpeg",
    cardHeight: "h-72",
  },
  {
    id: "insp-002",
    category: "Flyer & Poster Design",
    title: "Poster Series",
    description: "Professional poster compositions for brand and event promotion.",
    imageUrl: "/Assets/poster1.jpeg",
    cardHeight: "h-56",
  },
  {
    id: "insp-003",
    category: "Flyer & Poster Design",
    title: "Creative Poster Layouts",
    description: "Visually compelling poster designs with strong typographic hierarchy.",
    imageUrl: "/Assets/poster3.jpg",
    cardHeight: "h-64",
  },

  // Print & Publication Design
  {
    id: "insp-004",
    category: "Print & Publication Design",
    title: "Print Layout Portfolio",
    description: "Professional print-ready layouts for brochures and collateral.",
    imageUrl: "/Assets/Print1.png",
    cardHeight: "h-60",
  },
  {
    id: "insp-005",
    category: "Print & Publication Design",
    title: "Publication Spread Design",
    description: "Editorial spreads designed for readability and visual impact.",
    imageUrl: "/Assets/publication1.png",
    cardHeight: "h-80",
  },
  {
    id: "insp-006",
    category: "Print & Publication Design",
    title: "Magazine & Report Layouts",
    description: "Clean, structured layouts for magazines, reports, and newsletters.",
    imageUrl: "/Assets/Print2.png",
    cardHeight: "h-52",
  },

  // Merchandise & Mockup Design
  {
    id: "insp-007",
    category: "Merchandise & Mockup Design",
    title: "Merchandise Mockup Collection",
    description: "Branded merchandise concepts with realistic product mockups.",
    imageUrl: "/Assets/Merch1.png",
    cardHeight: "h-64",
  },
  {
    id: "insp-008",
    category: "Merchandise & Mockup Design",
    title: "Apparel Branding Concepts",
    description: "Custom apparel and merchandise designs for brand identity.",
    imageUrl: "/Assets/Merch3.png",
    cardHeight: "h-48",
  },
  {
    id: "insp-009",
    category: "Merchandise & Mockup Design",
    title: "Product Mockup Showcase",
    description: "Detailed product mockups for packaging and promotional items.",
    imageUrl: "/Assets/Merch5.png",
    cardHeight: "h-68",
  },

  // Animated Explainer Videos
  {
    id: "insp-010",
    category: "Animated Explainer Videos",
    title: "Motion Explainer Frames",
    description: "Key visual frames from animated explainer video productions.",
    imageUrl: "/Assets/Animated1.png",
    cardHeight: "h-56",
  },
  {
    id: "insp-011",
    category: "Animated Explainer Videos",
    title: "Animation Styleframes",
    description: "Concept art and styleframes for short-form animated content.",
    imageUrl: "/Assets/Animated3.png",
    cardHeight: "h-44",
  },

  // Podcast Production (Video & Audio)
  {
    id: "insp-012",
    category: "Podcast Production (Video & Audio)",
    title: "Podcast Studio Setup",
    description: "Professional podcast recording and production environment.",
    imageUrl: "/Assets/aduio1.jpeg",
    cardHeight: "h-60",
  },

  // Professional Videography & Photography
  {
    id: "insp-013",
    category: "Professional Videography & Photography",
    title: "Video Production Stills",
    description: "Behind-the-scenes and key frames from video production projects.",
    imageUrl: "/Assets/video1.jpeg",
    cardHeight: "h-52",
  },
  {
    id: "insp-014",
    category: "Professional Videography & Photography",
    title: "Cinematic Photography",
    description: "Professional photography work for events and brand storytelling.",
    imageUrl: "/Assets/video2.jpeg",
    cardHeight: "h-72",
  },
];

function InspirationCard({ item, isLiked, isSaved, onToggleLike, onToggleSave }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className={`break-inside-avoid relative ${item.cardHeight} rounded-2xl overflow-hidden group cursor-pointer mb-4`}
      aria-label={item.title}
    >
      {/* Real image */}
      <img
        src={item.imageUrl}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        draggable={false}
      />

      {/* Gradient overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20 pointer-events-none" />

      {/* Category chip — always visible like YouTube cards */}
      <div
        className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-aku-primary/90 backdrop-blur-sm group-hover:opacity-0 transition-opacity pointer-events-none"
        aria-hidden="true"
      >
        {item.category}
      </div>

      {/* Title — always visible at bottom, green text like YouTube style */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
        <h3 className="text-aku-greenLight font-semibold font-display text-sm leading-snug">
          {item.title}
        </h3>
      </div>

      {/* Hover overlay — description, actions */}
      <div className="absolute inset-0 bg-surface-base/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-4">
        {/* Action buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleLike(); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isLiked
                ? "bg-red-500 text-white"
                : "bg-surface-overlay/80 text-text-primary hover:bg-red-500/60"
            }`}
            aria-label={isLiked ? `Unlike ${item.title}` : `Like ${item.title}`}
            aria-pressed={isLiked}
          >
            <Heart size={13} className={isLiked ? "fill-white" : ""} aria-hidden="true" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isSaved
                ? "bg-aku-green text-white"
                : "bg-surface-overlay/80 text-text-primary hover:bg-aku-green/60"
            }`}
            aria-label={isSaved ? `Unsave ${item.title}` : `Save ${item.title}`}
            aria-pressed={isSaved}
          >
            <Bookmark size={13} className={isSaved ? "fill-white" : ""} aria-hidden="true" />
          </button>
        </div>

        {/* Item info */}
        <div>
          <span className="text-xs font-semibold text-aku-greenLight uppercase tracking-wider">
            {item.category}
          </span>
          <p className="text-white/60 text-xs mt-1 leading-relaxed line-clamp-2">
            {item.description}
          </p>
          <button className="mt-2.5 flex items-center gap-1.5 text-xs text-aku-greenLight hover:text-white transition-colors font-medium">
            <ExternalLinkIcon size={11} aria-hidden="true" />
            View Details
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function InspirationVideoCard({ video, onPlay }) {
  const { title } = useYoutubeMetadata(video.youtubeId);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className={`break-inside-avoid relative ${video.cardHeight} rounded-2xl overflow-hidden group cursor-pointer mb-4`}
      onClick={() => onPlay(video.youtubeId, title)}
      role="button"
      tabIndex={0}
      aria-label={`Play preview: ${title}`}
    >
      <img
        src={getYoutubeThumbnailUrl(video.youtubeId)}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />

      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-aku-primary">
        {video.category}
      </span>

      <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
        <div className="w-11 h-11 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Play size={16} className="text-aku-green fill-aku-green ml-0.5" aria-hidden="true" />
        </div>
      </div>

      <p className="absolute bottom-3 left-3 right-3 text-white text-xs font-semibold leading-snug line-clamp-2">
        {title}
      </p>
    </motion.article>
  );
}

export default function InspirationFeed() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedItems, setLikedItems] = useState({});
  const [savedItems, setSavedItems] = useState({});
  const [activeVideo, setActiveVideo] = useState(null);

  const allGalleryItems = [
    ...inspirationGalleryItems,

    ...inspirationVideoPicks,
  ];

  const filteredItems = allGalleryItems.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleLike = (id) =>
    setLikedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleSave = (id) =>
    setSavedItems((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <section id="inspiration" className="py-24 px-6 bg-white section-divider" aria-labelledby="inspiration-heading">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <span className="text-aku-greenLight text-sm font-semibold tracking-widest uppercase">
            Inspiration
          </span>
          <h2
            id="inspiration-heading"
            className="font-display font-extrabold text-4xl md:text-5xl text-text-primary mt-2 mb-4"
          >
            See our creative Ideas
          </h2>
          <p className="text-text-secondary text-lg max-w-xl">
            Discover work that inspires. Save ideas and share them when you
            start your project brief.
          </p>
        </motion.div>

        {/* Search + Category Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-shrink-0 w-full md:w-72">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search inspiration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-surface-border rounded-full pl-10 pr-5 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-aku-green/50 transition-colors"
              aria-label="Search inspiration gallery"
            />
          </div>

          <div
            className="flex gap-2 flex-wrap"
            role="group"
            aria-label="Filter by category"
          >
            {inspirationCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === category
                    ? "bg-aku-primary text-white shadow-glow-green-sm"
                    : "bg-white border border-surface-border text-text-muted hover:text-text-primary hover:border-aku-green/30"
                }`}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry Gallery */}
        {filteredItems.length > 0 ? (
          <div
            className="columns-2 md:columns-3 lg:columns-4 gap-4"
            aria-live="polite"
            aria-label={`Showing ${filteredItems.length} inspiration items`}
          >
            {filteredItems.map((item) =>
              item.youtubeId ? (
                <InspirationVideoCard
                  key={item.id}
                  video={item}
                  onPlay={(youtubeId, title) => setActiveVideo({ youtubeId, title })}
                />
              ) : (
                <InspirationCard
                  key={item.id}
                  item={item}
                  isLiked={!!likedItems[item.id]}
                  isSaved={!!savedItems[item.id]}
                  onToggleLike={() => toggleLike(item.id)}
                  onToggleSave={() => toggleSave(item.id)}
                />
              )
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-text-muted">
            <p className="text-lg">No results for "{searchQuery}"</p>
            <button
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
              className="mt-4 text-sm text-aku-greenLight hover:text-white transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        <div className="mt-12 text-center">
          <button className="bg-white border border-surface-border text-text-primary font-medium px-9 py-3.5 rounded-full hover:border-aku-green/40 hover:bg-surface-subtle transition-all duration-300">
            Load More Inspiration
          </button>
        </div>

        <VideoLightboxModal
          youtubeId={activeVideo?.youtubeId}
          title={activeVideo?.title}
          onClose={() => setActiveVideo(null)}
        />
      </div>
    </section>
  );
}
