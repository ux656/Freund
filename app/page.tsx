"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import DesktopSidebar from "@/components/DesktopSidebar";
import Hero from "@/components/Hero";
import PairingFlow from "@/components/PairingFlow";
import Features from "@/components/Features";
import About from "@/components/About";
import FAQ from "@/components/FAQ";
import Developers from "@/components/Developers";
import Privacy from "@/components/Privacy";
import Footer from "@/components/Footer";
import BotAssistant from "@/components/BotAssistant";
import PageEntrance from "@/components/PageEntrance";

export default function Home() {
  const [activePage, setActivePage] = useState("home");

  useEffect(() => {
    const section = window.location.hash.slice(1);
    if (["home", "about", "features", "faq", "developers", "privacy"].includes(section)) {
      setActivePage(section);
    }
  }, []);

  return (
    <>
      <DesktopSidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="min-h-screen min-[900px]:mr-[240px]">
        <Navbar activePage={activePage} onNavigate={setActivePage} />
        <PageEntrance key={activePage}>
          <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-5 sm:px-6 sm:pt-8 lg:px-10 xl:px-10">
            {activePage === "home" && (
              <div id="home" className="space-y-8 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-10 lg:space-y-0">
                <div className="min-w-0 lg:pt-2"><Hero /></div>
                <div className="min-w-0"><PairingFlow /></div>
              </div>
            )}
            {activePage === "about" && <div id="about"><About /></div>}
            {activePage === "features" && <div id="features"><Features /></div>}
            {activePage === "faq" && <div id="faq"><FAQ /></div>}
            {activePage === "developers" && <div id="developers"><Developers /></div>}
            {activePage === "privacy" && <div id="privacy"><Privacy /></div>}
          </main>
        </PageEntrance>
        <Footer />
        <BotAssistant />
      </div>
    </>
  );
}
