import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Bookmark, Search, ExternalLink as ExternalLinkIcon, Play } from "lucide-react";
import VideoLightboxModal from "./VideoLightboxModal";
import { featuredVideoReel, getYoutubeThumbnailUrl, driveGalleryLink } from "../utils/videoData";
import { useYoutubeMetadata } from "../hooks/useYoutubeMetadata";

// A few videos from the featured reel, woven into the inspiration grid for variety
const inspirationVideoPicks = [
  { ...featuredVideoReel[2], cardHeight: "h-64" },
  { ...featuredVideoReel[6], cardHeight: "h-56" },
  { ...featuredVideoReel[5], cardHeight: "h-48" },
];

// Real photography samples from the local portfolio archive
const driveInspirationImages = [
  {
    id: "drive-001",
    category: "Portrait Photography",
    title: "Studio Portrait Collection",
    description: "Selected stills from the AKU GSMC photography archive.",
    imageUrl: "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=600&q=80",
    cardHeight: "h-60",
  },
  {
    id: "drive-002",
    category: "Event Coverage",
    title: "Campus Event Highlights",
    description: "Selected stills from the AKU GSMC photography archive.",
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80",
    cardHeight: "h-52",
  },
];

const inspirationCategories = [
  "All",
  "Wedding Videos",
  "Commercial Shoots",
  "Music Videos",
  "Podcasts",
  "Product Photography",
  "Portrait Photography",
  "Social Media",
  "Event Coverage",
];

// Real photography samples from the local portfolio archive
const inspirationGalleryItems = [
  {
    id: "insp-001",
    category: "Wedding Videos",
    title: "Golden Hour Ceremony Film",
    description: "Cinematic documentation of an intimate outdoor ceremony.",
    imageUrl: "/Photos/395A0409.jpg",
    cardHeight: "h-72",
  },
  {
    id: "insp-002",
    category: "Portrait Photography",
    title: "Urban Portrait Series",
    description: "Natural light editorial portraits against city architecture.",
    imageUrl: "/Photos/395A3106.jpg",
    cardHeight: "h-48",
  },
  {
    id: "insp-003",
    category: "Music Videos",
    title: "Neon Nights Visual",
    description: "Atmospheric music video with controlled practical lighting.",
    imageUrl: "/Photos/IMG_7048.jpg",
    cardHeight: "h-64",
  },
  {
    id: "insp-004",
    category: "Commercial Shoots",
    title: "Brand Identity Film",
    description: "Corporate documentary showcasing company culture and values.",
    imageUrl: "/Photos/IMG_7185.jpg",
    cardHeight: "h-56",
  },
  {
    id: "insp-005",
    category: "Product Photography",
    title: "Campaign",
    description: "Macro product photography with crafted studio lighting.",
    imageUrl: "/Photos/IMG_8230.jpg",
    cardHeight: "h-80",
  },
  {
    id: "insp-006",
    category: "Event Coverage",
    title: "Conference Documentation",
    description: "Multi-camera event coverage for a technology summit.",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
    cardHeight: "h-52",
  },
  {
    id: "insp-007",
    category: "Podcasts",
    title: "Studio Recording Session",
    description: "Professional podcast production in a treated recording space.",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80",
    cardHeight: "h-60",
  },
  {
    id: "insp-008",
    category: "Social Media",
    title: "Social Content Package",
    description: "Vertical-format creative content optimised for engagement.",
    imageUrl: "/Photos/395A9089.jpg",
    cardHeight: "h-44",
  },
  {
    id: "insp-009",
    category: "Wedding Videos",
    title: "Destination Wedding Film",
    description: "Feature-length documentary wedding film across two days.",
    imageUrl: "/Photos/395A9808.jpg",
    cardHeight: "h-68",
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

      {/* Permanent bottom gradient for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

      {/* Hover overlay */}
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
          <h3 className="text-white font-semibold font-display mt-1 text-sm leading-tight">
            {item.title}
          </h3>
          <p className="text-white/60 text-xs mt-1 leading-relaxed line-clamp-2">
            {item.description}
          </p>
          <button className="mt-2.5 flex items-center gap-1.5 text-xs text-aku-greenLight hover:text-white transition-colors font-medium">
            <ExternalLinkIcon size={11} aria-hidden="true" />
            View Details
          </button>
        </div>
      </div>

      {/* Always-visible category chip */}
      <div
        className="absolute top-3 left-3 px-2.5 py-1 glass rounded-full text-xs font-medium text-white/85 group-hover:opacity-0 transition-opacity pointer-events-none"
        aria-hidden="true"
      >
        {item.category}
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
    ...driveInspirationImages,
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

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button className="bg-white border border-surface-border text-text-primary font-medium px-9 py-3.5 rounded-full hover:border-aku-green/40 hover:bg-surface-subtle transition-all duration-300">
            Load More Inspiration
          </button>
          <a
            href={driveGalleryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-aku-green font-medium text-sm hover:text-aku-greenDark transition-colors px-4 py-3.5"
          >
            View Full Photo Archive
            <ExternalLinkIcon size={14} aria-hidden="true" />
          </a>
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
