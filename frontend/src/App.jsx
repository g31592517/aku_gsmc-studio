import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import InspirationFeed from "./components/InspirationFeed";
import Services from "./components/Services";
import FeaturedWorkReel from "./components/FeaturedWorkReel";
import ProjectSubmissionWizard from "./components/ProjectBrief";
import PortfolioShowcaseSection from "./components/Portfolio";
import CompetitiveAdvantagesSection from "./components/WhyUs";
import ConversionCallToAction from "./components/CTA";
import SiteFooter from "./components/Footer";
import MyRequestsPage from "./pages/MyRequestsPage";
import StaffDashboardPage from "./pages/StaffDashboardPage";

function LandingPage() {
  return (
    <>
      <Hero />
      <InspirationFeed />
      <Services />
      <FeaturedWorkReel />
      <ProjectSubmissionWizard />
      <PortfolioShowcaseSection />
      <CompetitiveAdvantagesSection />
      <ConversionCallToAction />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-white min-h-screen font-body">
        <Navbar />
        <main id="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/my-requests" element={<MyRequestsPage />} />
            <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
          </Routes>
        </main>
        <SiteFooter />
      </div>
    </BrowserRouter>
  );
}
