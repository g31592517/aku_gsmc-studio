import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import VideoLightboxModal from "./VideoLightboxModal";
import VideoPreviewCard from "./VideoPreviewCard";
import InspirationImageCard from "./InspirationImageCard";
import InspirationLightbox from "./InspirationLightbox";
import { apiFetch } from "../utils/api";
import { mapInspirationAsset } from "../utils/inspirationAssets";

// Cycled by render index for masonry variety — replaces the old per-item stored cardHeight
const CARD_HEIGHTS = ["h-72", "h-56", "h-64", "h-60", "h-80", "h-52", "h-64", "h-48", "h-68"];

export default function InspirationFeed() {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVideo, setActiveVideo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    async function fetchItems() {
      setIsLoading(true);
      setLoadError(false);
      try {
        const response = await apiFetch("/api/inspiration-assets?placement=inspiration");
        const data = await response.json();
        if (data.success) {
          setItems(data.data.map(mapInspirationAsset));
        } else {
          setLoadError(true);
        }
      } catch {
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchItems();
  }, [reloadToken]);

  const handleOpenLightbox = useCallback((item) => setSelectedImage(item), []);
  const handleCloseLightbox = useCallback(() => setSelectedImage(null), []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((i) => i.category))).sort()],
    [items]
  );

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="inspiration" className="py-24 px-6 bg-white section-divider scroll-mt-header" aria-labelledby="inspiration-heading">
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
            See Our Creative Ideas
          </h2>
          <p className="text-text-muted text-lg max-w-xl">
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
            {categories.map((category) => (
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
            {filteredItems.map((item, index) =>
              item.mediaType === "video" ? (
                <div key={item.id} className="break-inside-avoid mb-4">
                  <VideoPreviewCard
                    video={item}
                    index={index}
                    cardHeight={CARD_HEIGHTS[index % CARD_HEIGHTS.length]}
                    onPlay={(youtubeId, title) => setActiveVideo({ youtubeId, title })}
                  />
                </div>
              ) : (
                <InspirationImageCard
                  key={item.id}
                  item={{ ...item, cardHeight: CARD_HEIGHTS[index % CARD_HEIGHTS.length] }}
                  onOpenLightbox={handleOpenLightbox}
                />
              )
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-text-muted">
            <p className="text-lg">
              {loadError
                ? "Couldn't load inspiration right now."
                : isLoading
                ? "Loading inspiration…"
                : items.length === 0
                ? "No inspiration items yet."
                : `No results for "${searchQuery}"`}
            </p>
            {loadError && (
              <button
                onClick={() => setReloadToken((t) => t + 1)}
                className="mt-4 text-sm text-aku-greenLight hover:text-white transition-colors"
              >
                Try again
              </button>
            )}
            {!loadError && !isLoading && items.length > 0 && (
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                className="mt-4 text-sm text-aku-greenLight hover:text-white transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        <VideoLightboxModal
          youtubeId={activeVideo?.youtubeId}
          title={activeVideo?.title}
          onClose={() => setActiveVideo(null)}
        />

        <InspirationLightbox item={selectedImage} onClose={handleCloseLightbox} />
      </div>
    </section>
  );
}
