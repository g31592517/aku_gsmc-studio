import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Award, Users } from "lucide-react";

const portfolioMetrics = [
  { icon: TrendingUp, value: "1M+", label: "Views Generated", colorClass: "text-aku-greenLight" },
  { icon: Award, value: "500+", label: "Projects Delivered", colorClass: "text-violet-400" },
  { icon: Users, value: "98%", label: "Satisfaction Rate", colorClass: "text-amber-400" },
];

const portfolioProjects = [
  {
    id: "proj-001",
    title: "Zenith Brand Film",
    category: "Videography",
    outcome: "4.2M organic views",
    tags: ["Commercial", "Brand Story"],
    imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=700&q=80",
  },
  {
    id: "proj-002",
    title: "Arc Studio Portraits",
    category: "Photography",
    outcome: "Campaign successfully launched",
    tags: ["Portrait", "Editorial"],
    imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=700&q=80",
  },
  {
    id: "proj-003",
    title: "Frequency Podcast",
    category: "Audio Editing",
    outcome: "Ranked Top 50 nationally",
    tags: ["Podcast", "Series"],
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=700&q=80",
  },
  {
    id: "proj-004",
    title: "Nova Product Line",
    category: "Photography",
    outcome: "30% sales conversion lift",
    tags: ["Product", "Luxury"],
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80",
  },
  {
    id: "proj-005",
    title: "Pulse Music Video",
    category: "Videography",
    outcome: "8M views — went viral",
    tags: ["Music Video", "Artist"],
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=700&q=80",
  },
  {
    id: "proj-006",
    title: "Echo Sound Design",
    category: "Audio Editing",
    outcome: "Industry award winner",
    tags: ["Sound Design", "Ambient"],
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=700&q=80",
  },
];

function PortfolioProjectCard({ project }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-card hover:shadow-card-hover transition-all duration-400"
      aria-label={`${project.title} — ${project.category}`}
    >
      <img
        src={project.imageUrl}
        alt={project.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-600 group-hover:scale-105"
        loading="lazy"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        <div className="flex gap-2 flex-wrap">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="glass text-xs font-medium text-white/80 px-2.5 py-1 rounded-full border border-white/10"
            >
              {tag}
            </span>
          ))}
        </div>
        <div>
          <p className="text-xs font-semibold text-aku-greenLight uppercase tracking-wider mb-1">
            {project.category}
          </p>
          <h3 className="font-display font-bold text-xl text-white mb-2">
            {project.title}
          </h3>
          <div className="flex items-center gap-2">
            <TrendingUp size={13} className="text-aku-greenLight" aria-hidden="true" />
            <span className="text-sm text-aku-greenLight font-medium">
              {project.outcome}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function PortfolioShowcaseSection() {
  return (
    <section id="work" className="py-24 px-6 bg-white section-divider" aria-labelledby="portfolio-heading">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-aku-greenLight text-sm font-semibold tracking-widest uppercase">
            Portfolio
          </span>
          <h2
            id="portfolio-heading"
            className="font-display font-extrabold text-4xl md:text-5xl text-text-primary mt-2 mb-4"
          >
            
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            Real projects with successfull results. See what we've built for clients who
            trusted us with their vision.
          </p>
        </motion.div>

        {/* Metrics */}
        <div
          className="grid grid-cols-3 gap-4 mb-16"
          aria-label="Portfolio metrics"
        >
          {portfolioMetrics.map(({ icon: Icon, value, label, colorClass }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
               className="bg-surface-subtle border border-surface-border rounded-2xl p-6 text-center"
            >
              <Icon size={20} className={`${colorClass} mx-auto mb-3`} aria-hidden="true" />
              <p className={`font-display font-extrabold text-3xl sm:text-4xl ${colorClass} mb-1`}>
                {value}
              </p>
              <p className="text-text-muted text-sm">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Project grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {portfolioProjects.map((project) => (
            <PortfolioProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
