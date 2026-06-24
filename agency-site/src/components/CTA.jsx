import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";

export default function ConversionCallToAction() {
  return (
    <section
      className="py-28 px-6"
      aria-labelledby="cta-heading"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden p-14 md:p-20 text-center"
          style={{
            background: "linear-gradient(135deg, #008D4F 0%, #006B3C 100%)",
            border: "none",
          }}
        >
          {/* Background glow */}
          <div
            className="glow-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none animate-pulse-glow"
            style={{ background: "rgba(0,141,79,0.20)" }}
            aria-hidden="true"
          />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,183,102,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,183,102,0.8) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-2 mb-6">
              <Clock size={13} className="text-white/80" aria-hidden="true" />
              <span className="text-sm font-medium text-white/75">
                Limited project slots available this month
              </span>
            </div>

            <h2
              id="cta-heading"
              className="font-display font-extrabold text-4xl md:text-6xl text-white mb-5 leading-tight"
            >
              Sisi ndo you're best designer.
              <br />
              <span className="gradient-text">Project Starts Here.</span>
            </h2>

            <p className="text-white/75 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Upload your ideas, share your inspiration and let our OGs
              bring your vision to life.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                className="group flex items-center gap-2.5 bg-white text-aku-green font-semibold px-9 py-4 rounded-full shadow-glow-green hover:scale-105 active:scale-95 transition-all duration-300 text-base"
                aria-label="Start your creative project"
              >
                Start Your Project
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </button>
              <button
                className="bg-white/15 border border-white/30 text-white font-medium px-8 py-4 rounded-full hover:bg-white/25 hover:border-white/50 transition-all duration-300 text-base"
                aria-label="Browse inspiration gallery"
              >
                Browse Inspiration
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
