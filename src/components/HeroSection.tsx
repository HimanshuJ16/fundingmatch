"use client";

import { useState } from "react";
import { QuickMatchFormSection } from "./QuickMatchFormSection";

export const HeroSection = () => {
  const [selectedBusinessType, setSelectedBusinessType] = useState<
    string | null
  >(null);

  const steps = [
    {
      number: 1,
      text: "Complete a 5-minute application",
    },
    {
      number: 2,
      text: "AI matching to lenders",
    },
    {
      number: 3,
      text: "You approve your preferred quote",
    },
    {
      number: 4,
      text: "Funds paid out same day",
    },
  ];

  return (
    <div className="w-full bg-[#182744] flex justify-center overflow-hidden">
      <div className="flex flex-col lg:flex-row w-full max-w-7xl px-4 mt-8 lg:mt-16 items-center lg:items-start justify-between relative gap-12 lg:gap-8 pb-12">
        <section className="flex flex-col w-full lg:w-1/2 items-start gap-8 lg:gap-10 relative z-10">
          <div className="flex flex-col items-start gap-6 relative self-stretch w-full">
            <h1 className="relative self-stretch [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-transparent text-4xl md:text-5xl lg:text-[65px] tracking-tight leading-tight lg:-tracking-[2.80px] lg:leading-[81.2px]">
              <span className="text-white">Grow your business with </span>
              <span className="text-[#b0efbd] border-b-4 border-[#b0efbd] pb-1 decoration-skip-ink-none">
                smart funding
              </span>
            </h1>

            <h2 className="relative self-stretch [font-family:'Roobert-Regular',Helvetica] font-semibold text-white text-xl md:text-2xl lg:text-[28px] tracking-tight leading-snug">
              Apply once. Avoid declines. Get matched to the right lenders.
            </h2>

            <p className="relative self-stretch [font-family:'Roobert-Regular',Helvetica] font-normal text-transparent text-base md:text-lg tracking-normal leading-relaxed lg:leading-[32.0px]">
              <span className="text-[#ffffffcc]">
                Save time with a simple 5-minute application.{" "}
                <br className="hidden md:block" />
              </span>
              <span className="[font-family:'Roobert-Medium',Helvetica] font-medium text-[#b0efbd]">
                fundingmatch.ai
              </span>
              <span className="text-[#ffffffcc]"> uses </span>
              <span className="[font-family:'Roobert-Medium',Helvetica] font-bold text-white">
                AI technology
              </span>
              <span className="text-[#ffffffcc]">
                {" "}
                to analyze your business profile, income, and trading history,
                then intelligently matches you with lenders most likely to make
                you a real funding offer.
              </span>
            </p>
          </div>

          <ol className="flex flex-col w-full max-w-[589px] items-start gap-4 lg:gap-[17px] relative">
            {steps.map((step) => (
              <li
                key={step.number}
                className="flex items-start md:items-center gap-3 relative self-stretch w-full"
              >
                <div className="relative w-6 h-6 shrink-0 bg-[#b0efbd] rounded-full overflow-hidden flex items-center justify-center mt-1 md:mt-0">
                  <div className="[font-family:'Roobert-SemiBold',Helvetica] font-semibold text-[#121e36] text-sm md:text-base text-center leading-none">
                    {step.number}
                  </div>
                </div>
                <div className="relative flex-1 [font-family:'Roobert-Regular',Helvetica] font-normal text-white text-base md:text-lg leading-snug lg:leading-[28.8px]">
                  {step.text}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="w-full lg:w-auto flex justify-center lg:block">
          <QuickMatchFormSection />
        </div>
      </div>
    </div>
  );
};
