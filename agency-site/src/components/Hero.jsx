import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Video, Camera, Mic2 } from "lucide-react";

const platformStats = [
  { value: 60, suffix: "+", label: "Projects Delivered" },
  { value: 100, suffix: "%", label: "Client Satisfaction" },
  { value: 5, suffix: "+", label: "Creative Experts" },
];

const floatingServiceIndicators = [
  {
    icon: Video,
    label: "Videography",
    position: { left: "5%", top: "30%" },
    animationDelay: 0,
    bgColor: "bg-aku-green",
  },
  {
    icon: Camera,
    label: "Photography",
    position: { right: "5%", top: "34%" },
    animationDelay: 1.8,
    bgColor: "bg-aku-violet",
  },
  {
    icon: Mic2,
    label: "Audio",
    position: { left: "8%", bottom: "28%" },
    animationDelay: 1.0,
    bgColor: "bg-aku-amber",
  },
];

function AnimatedStatCounter({ targetValue, suffix }) {
  const [displayValue, setDisplayValue] = useState(0);
  const containerRef = useRef(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          const duration = 1800;
          let startTime = null;
          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.floor(eased * targetValue));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [targetValue]);

  return (
    <span ref={containerRef}>
      {displayValue}{suffix}
    </span>
  );
}

export default function Hero() {
  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-white"
    >
      {/* ── Atmospheric background — three soft blobs, not scattered ── */}
      <div className="hero-blob-1" aria-hidden="true" />
      <div className="hero-blob-2" aria-hidden="true" />
      <div className="hero-blob-3" aria-hidden="true" />

      {/* Top-right decorative arc — very subtle */}
      <div
        className="absolute top-0 right-0 w-[520px] h-[520px] pointer-events-none"
        style={{
          background:
            "conic-gradient(from 180deg at 100% 0%, rgba(0,141,79,0.06) 0deg, transparent 90deg)",
        }}
        aria-hidden="true"
      />

      {/* Bottom-left green fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,141,79,0.04) 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Floating service pills — desktop only (commented out for now)
      {floatingServiceIndicators.map(({ icon: Icon, label, position, animationDelay, bgColor }) => (
        <motion.div
          key={label}
          className="absolute hidden lg:flex items-center gap-2.5 bg-white rounded-full px-4 py-2.5 shadow-card border border-surface-border"
          style={position}
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 7,
            delay: animationDelay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        >
          <div
            className={`w-7 h-7 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}
          >
            <Icon size={14} className="text-white" />
          </div>
          <span className="text-xs font-semibold text-text-secondary whitespace-nowrap">
            {label}
          </span>
        </motion.div>
      )}
      */}

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 bg-white border border-surface-border rounded-full px-4 py-2 mb-10 shadow-sm"
        >
          <span
            className="w-2 h-2 rounded-full bg-aku-green animate-pulse"
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-text-secondary">
            Submit your ideas anytime 
          </span>
        </motion.div>

        {/*
          ── Headline ──
          Line 1: dark solid text — "Turn Your Ideas Into"
          Line 2: gradient text — "Stunning Visual" (dark green gradient, readable)
          Line 3: dark solid text — "Experiences."
          clamp() keeps it proportional — no stretching.
        */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-extrabold leading-[1.08] tracking-tight text-text-primary mb-6"
          style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}
        >
          Turn Your Ideas Into{" "}
          <br className="hidden sm:block" />
          <span className="gradient-text">Stunning Visual</span>
          <br className="hidden sm:block" />
          {" "}Experiences.
        </motion.h1>

        {/* Subheadline — clearly visible */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.26 }}
          className="text-base md:text-lg leading-relaxed font-normal mb-10 max-w-lg mx-auto"
          style={{ color: "#4A6A55" }}
        >
          From videography and photography to professional audio editing,
          bring your vision to life with Gurus wenye wanaelewa story yako.
        </motion.p>

        {/*
          ── CTA Buttons ──
          Primary: solid AKU green, white text, pill shape, shadow
          Secondary: white bg, green border, green text — styled, not plain
        */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
        >
          {/* Primary CTA — scrolls to project submission */}
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group relative flex items-center gap-2 text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 text-sm overflow-hidden cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #008D4F 0%, #006B3C 100%)",
              boxShadow: "0 4px 20px rgba(0,141,79,0.35), 0 1px 3px rgba(0,141,79,0.2)",
            }}
            aria-label="Submit your creative project"
          >
            {/* Shine sweep on hover */}
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)",
              }}
              aria-hidden="true"
            />
            <span className="relative">Submit you're idea</span>
            <ArrowRight
              size={16}
              className="relative group-hover:translate-x-0.5 transition-transform"
              aria-hidden="true"
            />
          </a>

          {/* Secondary CTA — scrolls to What We Create */}
          <a
            href="#services"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group flex items-center gap-2.5 bg-white font-medium px-7 py-3.5 rounded-full transition-all duration-300 text-sm cursor-pointer"
            style={{
              border: "1.5px solid #008D4F",
              color: "#008D4F",
              boxShadow: "0 2px 12px rgba(0,141,79,0.10)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0,141,79,0.05)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,141,79,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,141,79,0.10)";
            }}
            aria-label="Explore What We Create"
          >
            <PlayCircle
              size={18}
              aria-hidden="true"
              style={{ color: "#008D4F" }}
            />
            Explore Inspiration
          </a>
        </motion.div>

        {/*
          ── Stats ──
          Numbers: bold dark green. Labels: muted. Clear dividers between them.
        */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-0"
          aria-label="Platform statistics"
        >
          {platformStats.map(({ value, suffix, label }, index) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center px-8 py-4">
                <span
                  className="font-display font-extrabold mb-1"
                  style={{
                    fontSize: "clamp(1.75rem, 2.8vw, 2.4rem)",
                    color: "#008D4F",
                  }}
                >
                  <AnimatedStatCounter targetValue={value} suffix={suffix} />
                </span>
                <span
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "#6B8A76" }}
                >
                  {label}
                </span>
              </div>
              {/* Vertical divider between stats — hidden on mobile */}
              {index < platformStats.length - 1 && (
                <div
                  className="hidden sm:block w-px h-10 self-center"
                  style={{ background: "#D4E4DA" }}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
