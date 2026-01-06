"use client";

import { FAQSection } from "@/components/FAQSection";
import { FooterCTA } from "@/components/FooterCTA";
import { HeroSection } from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      {/* <HowItWorksSection /> */}
      <FAQSection />
      <FooterCTA />
    </>
  );
}
