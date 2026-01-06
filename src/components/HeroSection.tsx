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
    <div className="w-full bg-[#182744] flex justify-center">
      <div className="flex w-full max-w-[1224px] px-4 mt-15 items-center justify-between relative">
        <section className="flex flex-col w-[600px] items-start gap-10 relative">
          <div className="flex flex-col items-start gap-6 relative self-stretch w-full flex-[0_0_auto]">
            <h1 className="relative self-stretch mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-transparent text-[65px] tracking-[-2.80px] leading-[81.2px]">
              <span className="text-white tracking-[-1.96px]">
                Grow your business with{" "}
              </span>
              <span className="text-[#b0efbd] tracking-[-1.96px] underline">
                smart funding
              </span>
            </h1>

            <p className="relative self-stretch [font-family:'Roobert-Regular',Helvetica] font-normal text-transparent text-lg tracking-[0] leading-[32.0px]">
              <span className="text-[#ffffffcc]">
                Save time with a simple 5-minute application. <br />
              </span>
              <span className="[font-family:'Roobert-Medium',Helvetica] font-medium text-[#b0efbd]">
                fundingmatch.ai
              </span>
              <span className="text-[#ffffffcc]"> uses </span>
              <span className="[font-family:'Roobert-Medium',Helvetica] font-medium text-white">
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

          <ol className="flex flex-col w-[589px] items-start gap-[17px] relative flex-[0_0_auto]">
            {steps.map((step) => (
              <li
                key={step.number}
                className="flex items-center gap-2 relative self-stretch w-full flex-[0_0_auto]"
              >
                <div className="relative w-6 h-6 bg-[#b0efbd] rounded-[39px] overflow-hidden">
                  <div className="left-[calc(50.00%_-_3px)] absolute top-[calc(50.00%_-_13px)] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-[#121e36] text-base text-center tracking-[0] leading-[25.6px] whitespace-nowrap">
                    {step.number}
                  </div>
                </div>
                <div className="relative w-[557px] [font-family:'Roobert-Regular',Helvetica] font-normal text-white text-lg tracking-[0] leading-[28.8px]">
                  {step.text}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <QuickMatchFormSection />
      </div>
    </div>
  );
};
