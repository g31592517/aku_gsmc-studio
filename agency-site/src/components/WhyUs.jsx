import React from "react";
import { motion } from "framer-motion";
import { Zap, Palette, Users, DollarSign, MessageSquare, Trophy } from "lucide-react";

const competitiveAdvantages = [
 {
  icon: Zap,
  title: "Quick Delivery",
  description: "We deliver your projects on time without compromising on quality.",
  iconGradient: "from-amber-500 to-aku-green",
},

{
  icon: Palette,
  title: "Creative Excellence",
  description: "Fresh ideas, thoughtful designs and attention to detail in every project.",
  iconGradient: "from-aku-green to-aku-greenLight",
},

{
  icon: Users,
  title: "Professional Team",
  description: "Work with a skilled team of designers, editors, photographers and videographers who are passionate about what they do.",
  iconGradient: "from-aku-violet to-aku-green",
},

{
  icon: DollarSign,
  title: "Transparent Pricing",
  description: "Clear pricing , no hidden costs or unexpected charges.",
  iconGradient: "from-aku-green to-aku-greenLight",
},

{
  icon: MessageSquare,
  title: "Collaborative Process",
  description: "Your feedback matters. We work with you throughout the process to make sure the final result meets your expectations.",
  iconGradient: "from-aku-amber to-aku-green",
},

{
  icon: Trophy,
  title: "High-Quality Results",
  description: "Every project is carefully crafted to deliver a polished and professional final product.",
  iconGradient: "from-aku-violet to-aku-green",
},
];

export default function CompetitiveAdvantagesSection() {
  return (
    <section
      className="py-24 px-6 relative overflow-hidden bg-surface-subtle section-divider"
      aria-labelledby="why-us-heading"
    >
      <div
        className="glow-orb absolute top-0 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{ background: "rgba(0,141,79,0.08)" }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-aku-greenLight text-sm font-semibold tracking-widest uppercase">
            Why Choose Us
          </span>
          <h2
            id="why-us-heading"
            className="font-display font-extrabold text-4xl md:text-5xl text-text-primary mt-2 mb-4"
          >
            Why we stand out
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            We're not just another creative agency. Here's what sets us apart.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {competitiveAdvantages.map((advantage, index) => {
            const Icon = advantage.icon;
            return (
              <motion.div
                key={advantage.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-white border border-surface-border rounded-2xl p-6 hover:border-aku-green/25 transition-all duration-300 group"
                aria-label={advantage.title}
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${advantage.iconGradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  aria-hidden="true"
                >
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-lg text-text-primary mb-2">
                  {advantage.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {advantage.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
