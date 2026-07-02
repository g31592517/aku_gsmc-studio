import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import InspirationFeed from "./components/InspirationFeed";
import Services from "./components/Services";
import FeaturedWorkReel from "./components/FeaturedWorkReel";
import ProjectSubmissionWizard from "./components/ProjectBrief";
// import PortfolioShowcaseSection from "./components/Portfolio";
import CompetitiveAdvantagesSection from "./components/WhyUs";
// import ClientTestimonialsSection from "./components/Testimonials";
import ConversionCallToAction from "./components/CTA";
import SiteFooter from "./components/Footer";

export default function App() {
  return (
    <div className="bg-white min-h-screen font-body">
      <Navbar />
      <main id="main-content">
        <Hero />
        <InspirationFeed />
        <Services />
        <FeaturedWorkReel />
        <ProjectSubmissionWizard />
        {/* <PortfolioShowcaseSection /> */}
        <CompetitiveAdvantagesSection />
        {/* <ClientTestimonialsSection /> */}
        <ConversionCallToAction />
      </main>
      <SiteFooter />
    </div>
  );
}
