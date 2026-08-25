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
          className="relative rounded-3xl overflow-hidden p-14 md:p-20 text-center bg-white border border-surface-border"
        >
          <div className="relative z-10">
           

            <h2
              id="cta-heading"
              className="font-display font-extrabold text-4xl md:text-6xl text-black mb-5 leading-tight"
            >
              Sisi ndo you're best designer.
              <br />
              
            </h2>

            <p className="text-black text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Upload your ideas, share your inspiration and let our OGs
              bring your vision to life.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                className="group flex items-center gap-2.5 bg-aku-primary text-white font-semibold px-9 py-4 rounded-full shadow-glow-green hover:scale-105 active:scale-95 transition-all duration-300 text-base"
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
                className="bg-white border border-surface-border text-black font-medium px-8 py-4 rounded-full hover:bg-surface-subtle hover:border-aku-green/40 transition-all duration-300 text-base"
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
