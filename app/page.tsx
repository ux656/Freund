"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PairingFlow from "@/components/PairingFlow";
import Features from "@/components/Features";
import About from "@/components/About";
import FAQ from "@/components/FAQ";
import Developers from "@/components/Developers";
import Privacy from "@/components/Privacy";
import Footer from "@/components/Footer";
import BotAssistant from "@/components/BotAssistant";

export default function Home() {
  const [activePage, setActivePage] = useState("home");

  return (
    <>
      <Navbar activePage={activePage} onNavigate={setActivePage} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-5 pb-20 pt-12">
        {activePage === "home" && (
          <div className="space-y-8">
            <Hero />
            <PairingFlow />
          </div>
        )}
        {activePage === "about" && <About />}
        {activePage === "features" && <Features />}
        {activePage === "faq" && <FAQ />}
        {activePage === "developers" && <Developers />}
        {activePage === "privacy" && <Privacy />}
      </main>
      <Footer />
      <BotAssistant />
    </>
  );
}
