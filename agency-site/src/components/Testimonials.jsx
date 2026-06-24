import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const clientTestimonials = [
  {
    id: "testimonial-001",
    clientName: "Priya Sharma",
    clientRole: "Head of Marketing",
    clientCompany: "NexaTech",
    starRating: 5,
    reviewText:
      "AKU completely transformed our brand presence. The video produced for our product launch hit 2M views in the first week. The team understood our vision immediately and delivered something beyond what we imagined.",
    initialsDisplay: "PS",
    avatarGradient: "from-aku-green to-aku-greenLight",
  },
  {
    id: "testimonial-002",
    clientName: "Marcus Webb",
    clientRole: "Independent Artist",
    clientCompany: "Webb Music",
    starRating: 5,
    reviewText:
      "My music video looked like a major label production. The cinematic quality, the storytelling — it was everything I envisioned. My fanbase grew 40% in the month following the release.",
    initialsDisplay: "MW",
    avatarGradient: "from-aku-violet to-aku-green",
  },
  {
    id: "testimonial-003",
    clientName: "Sofia Andrade",
    clientRole: "Founder & CEO",
    clientCompany: "Bloom Skincare",
    starRating: 5,
    reviewText:
      "The product photography elevated our entire brand identity. We saw a direct 35% increase in online conversions after the new campaign imagery launched. Worth every cent invested.",
    initialsDisplay: "SA",
    avatarGradient: "from-aku-amber to-aku-green",
  },
  {
    id: "testimonial-004",
    clientName: "David Osei",
    clientRole: "Podcast Host",
    clientCompany: "The Deep Dive",
    starRating: 5,
    reviewText:
      "I've worked with multiple editors before and none come close to this level. My podcast sounds crisp and professional, and listeners noticed immediately. Turnaround is under 24 hours — consistently.",
    initialsDisplay: "DO",
    avatarGradient: "from-aku-green to-aku-violet",
  },
];

export default function ClientTestimonialsSection() {
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);

  const showPreviousTestimonial = () =>
    setActiveTestimonialIndex(
      (i) => (i - 1 + clientTestimonials.length) % clientTestimonials.length
    );

  const showNextTestimonial = () =>
    setActiveTestimonialIndex((i) => (i + 1) % clientTestimonials.length);

  const activeTestimonial = clientTestimonials[activeTestimonialIndex];

  return (
    <section
      className="py-24 px-6 relative overflow-hidden bg-white section-divider"
      aria-labelledby="testimonials-heading"
    >
      <div
        className="glow-orb absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: "rgba(0,141,79,0.10)" }}
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-aku-greenLight text-sm font-semibold tracking-widest uppercase">
            Testimonials
          </span>
          <h2
            id="testimonials-heading"
            className="font-display font-extrabold text-4xl md:text-5xl text-text-primary mt-2"
          >
            Clients Who Trust Us
          </h2>
        </motion.div>

        <div
          role="region"
          aria-label="Client testimonials carousel"
          aria-live="polite"
        >
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={activeTestimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
               className="bg-surface-subtle border border-surface-border rounded-3xl p-8 md:p-12 shadow-card"
            >
              <Quote
                size={36}
                className="text-aku-green/40 mb-6"
                aria-hidden="true"
              />
              <p className="text-text-primary text-lg md:text-xl leading-relaxed mb-8 font-light">
                "{activeTestimonial.reviewText}"
              </p>
              <footer className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${activeTestimonial.avatarGradient} flex items-center justify-center font-display font-bold text-white text-sm`}
                    aria-hidden="true"
                  >
                    {activeTestimonial.initialsDisplay}
                  </div>
                  <div>
                    <cite className="not-italic font-semibold text-text-primary block">
                      {activeTestimonial.clientName}
                    </cite>
                    <span className="text-sm text-text-muted">
                      {activeTestimonial.clientRole} · {activeTestimonial.clientCompany}
                    </span>
                  </div>
                </div>
                <div
                  className="flex gap-1"
                  aria-label={`${activeTestimonial.starRating} out of 5 stars`}
                >
                  {Array.from({ length: activeTestimonial.starRating }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-amber-400 fill-amber-400"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </footer>
            </motion.blockquote>
          </AnimatePresence>

          {/* Carousel controls */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex gap-2" role="tablist" aria-label="Testimonial indicators">
              {clientTestimonials.map((_, index) => (
                <button
                  key={index}
                  role="tab"
                  onClick={() => setActiveTestimonialIndex(index)}
                  aria-selected={index === activeTestimonialIndex}
                  aria-label={`Go to testimonial ${index + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    index === activeTestimonialIndex
                      ? "w-8 h-2.5 bg-aku-primary"
                      : "w-2.5 h-2.5 bg-surface-border hover:bg-surface-muted"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={showPreviousTestimonial}
                className="w-10 h-10 glass border border-surface-border rounded-full flex items-center justify-center text-text-primary hover:border-aku-green/40 transition-all"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                onClick={showNextTestimonial}
                className="w-10 h-10 bg-white border border-surface-border rounded-full flex items-center justify-center text-text-primary hover:border-aku-green/40 transition-all"
                aria-label="Next testimonial"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
