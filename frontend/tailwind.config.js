/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      colors: {
        aku: {
          green: "#008D4F",
          greenLight: "#00A85E",
          greenDark: "#006B3C",
          white: "#FFFFFF",
          black: "#0A0A0A",
          amber: "#E67E00",
          violet: "#662D91",
          brown: "#AA6F3D",
        },
        surface: {
          base: "#FFFFFF",
          subtle: "#F7FAF8",
          raised: "#F0F5F2",
          overlay: "#E8F0EC",
          border: "#D4E4DA",
          muted: "#C2D6CA",
        },
        text: {
          primary: "#0A1A0F",
          secondary: "#2D4A38",
          muted: "#6B8A76",
          placeholder: "#9BB8A6",
          inverse: "#FFFFFF",
        },
      },
      backgroundImage: {
        "aku-primary": "linear-gradient(135deg, #008D4F 0%, #00A85E 100%)",
        "aku-violet": "linear-gradient(135deg, #662D91 0%, #008D4F 100%)",
        "aku-amber": "linear-gradient(135deg, #E67E00 0%, #008D4F 100%)",
        "hero-radial":
          "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,141,79,0.08) 0%, transparent 70%)",
        "section-tint":
          "linear-gradient(180deg, #F7FAF8 0%, #FFFFFF 100%)",
        "card-shine":
          "linear-gradient(135deg, rgba(0,141,79,0.04) 0%, transparent 60%)",
      },
      animation: {
        "float-slow": "float 9s ease-in-out infinite",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "slide-up": "slideUp 0.55s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in": "fadeIn 0.7s ease forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(1deg)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.03)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      boxShadow: {
        "glow-green": "0 0 32px rgba(0,141,79,0.20)",
        "glow-green-sm": "0 0 16px rgba(0,141,79,0.15)",
        "glow-violet": "0 0 32px rgba(102,45,145,0.18)",
        "glow-amber": "0 0 32px rgba(230,126,0,0.18)",
        card: "0 2px 16px rgba(0,30,15,0.08), 0 1px 4px rgba(0,30,15,0.05)",
        "card-hover": "0 8px 40px rgba(0,30,15,0.12), 0 2px 8px rgba(0,141,79,0.10)",
        "nav": "0 1px 0 rgba(0,141,79,0.10), 0 4px 24px rgba(0,30,15,0.06)",
      },
      fontSize: {
        "hero-xl": ["clamp(2.5rem, 6vw, 4.5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "hero-lg": ["clamp(2rem, 4.5vw, 3.5rem)", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        "section-title": ["clamp(1.75rem, 3vw, 2.75rem)", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
      },
    },
  },
  plugins: [],
};
