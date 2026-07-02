import React from "react";
import { motion } from "framer-motion";
import {
  Image,
  BookOpen,
  Package,
  Film,
  Mic2,
  Video,
  ArrowRight,
} from "lucide-react";

const serviceCategories = [
  {
    id: "graphic-design",
    title: "Graphic Design Services",
    description:
      "Visual design solutions that communicate your message with clarity and impact.",
    accentGradient: "from-aku-violet to-aku-green",
    services: [
      {
        id: "flyer-poster-design",
        icon: Image,
        title: "Flyer & Poster Design",
        description:
          "Eye-catching flyers and posters designed to communicate your event or message clearly.",
        ctaLabel: "Request Service",
      },
      {
        id: "print-publication-design",
        icon: BookOpen,
        title: "Print & Publication Design",
        description:
          "Brochures, newsletters, magazines, and reports designed for print and digital distribution.",
        ctaLabel: "Request Service",
      },
      {
        id: "merchandise-mockup-design",
        icon: Package,
        title: "Merchandise & Mockup Design",
        description:
          "Branded merchandise concepts and realistic product mockups for apparel, packaging, and promotional items.",
        ctaLabel: "Request Service",
      },
      {
        id: "animated-explainer-videos",
        icon: Film,
        title: "Animated Explainer Videos",
        description:
          "Short, engaging animations that simplify complex ideas and bring your message to life.",
        ctaLabel: "Request Service",
      },
    ],
  },
  {
    id: "video-audio-production",
    title: "Video & Audio Production",
    description:
      "End-to-end production services for podcasts, events, and broadcast-ready content.",
    accentGradient: "from-aku-green to-aku-greenLight",
    services: [
      {
        id: "podcast-production",
        icon: Mic2,
        title: "Podcast Production (Video & Audio)",
        description:
          "Full podcast production including recording, editing, mixing, and video post-production for every episode.",
        ctaLabel: "Request Service",
      },
      {
        id: "videography-photography",
        icon: Video,
        title: "Professional Videography & Photography",
        description:
          "Cinematic videography and photography for events, campaigns, interviews, and brand storytelling.",
        ctaLabel: "Request Service",
      },
    ],
  },
];

function ServiceCard({ service, index }) {
  const Icon = service.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="flex flex-col bg-white border border-surface-border rounded-3xl p-7 shadow-card hover:shadow-card-hover hover:border-aku-green/30 transition-all duration-400 group"
      aria-label={service.title}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-2xl bg-aku-primary flex items-center justify-center mb-5 shadow-glow-green-sm group-hover:scale-110 transition-transform duration-300 mx-auto md:mx-0"
        aria-hidden="true"
      >
        <Icon size={20} className="text-white" />
      </div>

      <h3 className="font-display font-bold text-lg text-text-primary mb-2 leading-snug text-center md:text-left">
        {service.title}
      </h3>

      <p className="text-text-muted text-sm leading-relaxed mb-6 flex-1 text-center md:text-left">
        {service.description}
      </p>

      <a
        href="#contact"
        onClick={(e) => {
          e.preventDefault();
          document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm border border-aku-green/30 text-aku-green bg-surface-subtle hover:bg-aku-primary hover:text-white hover:border-transparent transition-all duration-300 group/cta cursor-pointer"
        aria-label={`${service.ctaLabel}: ${service.title}`}
      >
        {service.ctaLabel}
        <ArrowRight
          size={15}
          className="group-hover/cta:translate-x-1 transition-transform"
          aria-hidden="true"
        />
      </a>
    </motion.article>
  );
}

function ServiceCategorySection({ category, isLast }) {
  return (
    <div className={isLast ? "" : "mb-20"}>
      {/* Category header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <h3 className="font-display font-extrabold text-2xl md:text-3xl text-text-primary mb-2 text-center md:text-left">
          {category.title}
        </h3>
        <p className="text-text-muted text-base max-w-2xl text-center md:text-left mx-auto md:mx-0">
          {category.description}
        </p>
      </motion.div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {category.services.map((service, index) => (
          <ServiceCard key={service.id} service={service} index={index} />
        ))}
      </div>
    </div>
  );
}

export default function Services() {
  return (
    <section
      id="services"
      className="py-24 px-6 relative bg-surface-subtle section-divider"
      aria-labelledby="services-heading"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section intro */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-aku-greenLight text-sm font-semibold tracking-widest uppercase">
            Services
          </span>
          <h2
            id="services-heading"
            className="font-display font-extrabold text-4xl md:text-5xl text-text-primary mt-2 mb-4"
          >
            What We Create
          </h2>
          <p className="text-text-muted text-lg max-w-xl mx-auto">
            Explore our creative and production services, organised by
            category to help you find exactly what you need.
          </p>
        </motion.div>

        {/* Category blocks */}
        {serviceCategories.map((category, index) => (
          <ServiceCategorySection
            key={category.id}
            category={category}
            isLast={index === serviceCategories.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
