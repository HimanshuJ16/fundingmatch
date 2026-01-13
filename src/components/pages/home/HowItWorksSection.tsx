import React from "react";
import { HowItWorksHeaderSection } from "./HowItWorksDetailsHeader";
import { HowItWorksDetailsSection } from "./HowItWorksDetailsSection";
import { CallToActionSection } from "./CallToActionSection";

const HowItWorksSection = () => {
  return (
    <div className="relative w-full bg-[#182744] py-16 lg:py-24">
      <div className="flex flex-col w-full max-w-7xl mx-auto px-4 gap-12">
        <HowItWorksHeaderSection />
        <HowItWorksDetailsSection />
        <CallToActionSection />
      </div>
    </div>
  );
};

export default HowItWorksSection;
