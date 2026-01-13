"use client";

import { FAQSection } from "@/components/pages/home/FAQSection";
import { FooterCTA } from "@/components/pages/home/FooterCTA";
import { HeroSection } from "@/components/pages/home/HeroSection";
import HowItWorksSection from "@/components/pages/home/HowItWorksSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <FAQSection />
      <FooterCTA />
    </>
  );
}
