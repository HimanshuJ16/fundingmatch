"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quickMatchSchema, QuickMatchFormData } from "@/schemas/quickmatchform.schema";
import { BusinessDetailsStep } from "./steps/BusinessDetailsStep";
import { DirectorDetailsStep } from "./steps/DirectorDetailsStep";

import { SoleTraderPersonalDetailsStep } from "./steps/SoleTraderPersonalDetailsStep";
import { ContactDetailsStep } from "./steps/ContactDetailsStep";
import { FundingAmountStep } from "./steps/FundingAmountStep";

export const QuickMatchFormSection = () => {
  const [step, setStep] = useState(1);
  const methods = useForm<QuickMatchFormData>({
    resolver: zodResolver(quickMatchSchema),
    mode: "onChange",
    defaultValues: {
      homeOwnerStatus: false,
    }
  });

  const { trigger, setValue, watch, formState: { errors } } = methods;
  const businessType = watch("businessType");

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      if (businessType) {
        setStep(2);
      }
    } else if (step === 2) {
      if (businessType === "limited_company") {
        isValid = await trigger(["companyName", "companyRegistrationNumber", "registeredAddress"]);
      } else {
        isValid = await trigger(["firstName", "lastName", "tradingName", "timeTrading"]);
      }
      if (isValid) setStep(3);
    } else if (step === 3) {
      if (businessType === "limited_company") {
        isValid = await trigger(["directorName", "directorDateOfBirth", "residentialAddress"]);
      } else {
        isValid = await trigger(["residentialAddress", "directorDateOfBirth", "homeOwnerStatus"]);
        // Note: directorDateOfBirth is reused for dob in sole trader step component
      }
      if (isValid) setStep(4);
    } else if (step === 4) {
      isValid = await trigger(["email", "mobileNumber"]);
      if (isValid) setStep(5);
    } else if (step === 5) {
      isValid = await trigger(["fundingAmount", "fundingAmountCustom"]);
      if (isValid) {
        console.log("Form Completed", methods.getValues());
      }
    }
  };

  const handleBusinessTypeSelection = (type: string) => {
    setValue("businessType", type as any);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
              <p className="relative self-stretch -mt-px font-['Roobert-SemiBold',Helvetica] font-semibold text-white text-xl md:text-2xl tracking-[0] leading-snug">
                What type of business do you have?
              </p>

              <p className="relative self-stretch font-['Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-sm md:text-md md:text-base tracking-[0] leading-snug">
                We only use soft checks - no impact on your credit score.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 relative self-stretch w-full flex-[0_0_auto]">
              <button
                onClick={() => handleBusinessTypeSelection("limited_company")}
                type="button"
                className={`flex items-center justify-center gap-[3px] px-2.5 py-4 md:py-[22px] relative self-stretch w-full rounded-xl overflow-hidden border border-solid transition-colors cursor-pointer ${businessType === "limited_company" ? "bg-[#ffffff1a] border-[#b0efbd]" : "bg-[#ffffff0a] border-[#ffffff33] hover:bg-[#ffffff1a]"}`}
              >
                <div className="relative w-fit -mt-px font-['Roobert-SemiBold',Helvetica] font-semibold text-white text-base md:text-[17px] tracking-[-0.34px] leading-[normal] whitespace-nowrap">
                  Limited Company
                </div>
              </button>

              <button
                onClick={() => handleBusinessTypeSelection("sole_trader")}
                type="button"
                className={`flex items-center justify-center gap-[3px] px-2.5 py-4 md:py-[22px] relative self-stretch w-full rounded-xl overflow-hidden border border-solid transition-colors cursor-pointer ${businessType === "sole_trader" ? "bg-[#ffffff1a] border-[#b0efbd]" : "bg-[#ffffff0a] border-[#ffffff33] hover:bg-[#ffffff1a]"}`}
              >
                <div className="relative w-fit -mt-px font-['Roobert-SemiBold',Helvetica] font-semibold text-white text-base md:text-[17px] tracking-[-0.34px] leading-[normal] whitespace-nowrap">
                  Sole Trader
                </div>
              </button>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
              <p className="relative self-stretch -mt-px font-['Roobert-SemiBold',Helvetica] font-semibold text-white text-xl md:text-2xl tracking-[0] leading-snug">
                Business details
              </p>
              <p className="relative self-stretch font-['Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-sm md:text-md md:text-base tracking-[0] leading-snug">
                {businessType === "limited_company" ? "Search via Companies House" : "Tell us about your business"}
              </p>
            </div>
            <BusinessDetailsStep />
          </>
        );
      case 3:
        return (
          <>
            <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
              <p className="relative self-stretch -mt-px font-['Roobert-SemiBold',Helvetica] font-semibold text-white text-xl md:text-2xl tracking-[0] leading-snug">
                {businessType === "limited_company" ? "Director details" : "Personal details"}
              </p>
              <p className="relative self-stretch font-['Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-sm md:text-md md:text-base tracking-[0] leading-snug">
                {businessType === "limited_company" ? "Select one or more directors" : "Tell us a bit about yourself"}
              </p>
            </div>
            {businessType === "limited_company" ? <DirectorDetailsStep /> : <SoleTraderPersonalDetailsStep />}
          </>
        );
      case 4:
        return (
          <>
            <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
              <p className="relative self-stretch -mt-px font-['Roobert-SemiBold',Helvetica] font-semibold text-white text-xl md:text-2xl tracking-[0] leading-snug">
                Contact details
              </p>
              <p className="relative self-stretch font-['Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-sm md:text-md md:text-base tracking-[0] leading-snug">
                Where should we send your quotes?
              </p>
            </div>
            <ContactDetailsStep />
          </>
        );
      case 5:
        return (
          <>
            <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
              <p className="relative self-stretch -mt-px font-['Roobert-SemiBold',Helvetica] font-semibold text-white text-xl md:text-2xl tracking-[0] leading-snug">
                Funding amount
              </p>
              <p className="relative self-stretch font-['Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-sm md:text-md md:text-base tracking-[0] leading-snug">
                How much funding do you need?
              </p>
            </div>
            <FundingAmountStep />
          </>
        );
      default:
        return null;
    }
  };

  const getButtonText = () => {
    if (step === 1) return "Get started";
    if (step === 5) return "See my quotes";
    return "Continue";
  };

  return (
    <div
      className="flex flex-col w-full max-w-lg lg:max-w-[600px] justify-between items-center gap-6 p-6 md:p-8 relative rounded-[32px] border-[none] bg-[linear-gradient(325deg,rgba(40,60,100,1)_60%,rgba(59,124,126,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[32px] before:[background:linear-gradient(142deg,rgba(40,60,100,1)_60%,rgba(59,124,126,1)_100%) before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:mask-exclude before:z-1 before:pointer-events-none shadow-2xl"
      style={{ width: "500px" }}
    >
      <div className="flex flex-col items-start gap-6 md:gap-8 relative self-stretch w-full flex-1">
        <div className="flex flex-col w-full items-start gap-5 relative flex-[0_0_auto]">
          {/* Header content */}
          <div className="flex items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative w-3.5 h-3.5 bg-[#b0efbd] rounded-full shrink-0" />
            <div className="relative flex-1 font-['Roobert-Regular',Helvetica] font-normal text-white text-lg leading-[28.8px]">
              Quick match form
            </div>
          </div>
          {/* ... icons ... */}
          <div className="flex flex-wrap items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
            {/* Clock */}
            <div className="inline-flex items-center gap-[3px] p-2.5 relative flex-[0_0_auto] bg-[#ffffff0a] rounded-[35px] border border-solid border-[#ffffff33]">
              <div className="relative w-4 h-4 shrink-0">
                <img className="w-full h-full object-contain" alt="Clock Icon" src="assets/clock.png" />
              </div>
              <div className="relative w-fit font-['Roobert-Regular',Helvetica] font-normal text-white text-sm md:text-base tracking-[-0.32px] leading-snug whitespace-nowrap">
                5 minutes
              </div>
            </div>
            {/* AI */}
            <div className="inline-flex items-center gap-[3px] p-2.5 relative flex-[0_0_auto] bg-[#ffffff0a] rounded-[35px] border border-solid border-[#ffffff33]">
              <div className="relative w-4 h-4 shrink-0">
                <div className="w-full h-full relative">
                  <div className="w-full h-full relative">
                    <img className="absolute inset-0 w-full h-full object-contain" alt="AI Icon" src="assets/ai.png" />
                  </div>
                </div>
              </div>
              <div className="relative w-fit font-['Roobert-Regular',Helvetica] font-normal text-white text-sm md:text-base tracking-[-0.32px] leading-snug whitespace-nowrap">
                AI-powered
              </div>
            </div>
          </div>
        </div>

        <FormProvider {...methods}>
          <form className="flex flex-col gap-3 relative self-stretch w-full flex-[0_0_auto] z-10" onSubmit={(e) => e.preventDefault()}>
            {renderStepContent()}
          </form>
        </FormProvider>
      </div>

      <div className="flex flex-col items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
        <div className="relative self-stretch w-full h-2 bg-[#ffffff1f] rounded-[25px] overflow-hidden">
          <div
            className="h-2 bg-[#b0efbd] transition-all duration-300 ease-in-out"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        <div className="relative self-stretch [\font-['Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-sm md:text-base text-center tracking-[0] leading-snug">
          Step {step} of 5
        </div>
      </div>

      <button
        onClick={handleNext}
        type="button"
        className="all-[unset] box-border flex w-full sm:w-[182px] items-center justify-center gap-2.5 pt-4 pb-[18px] px-[23px] relative flex-[0_0_auto] rounded-[29px] overflow-hidden bg-[linear-gradient(106deg,rgba(165,215,171,1)_0%,rgba(147,195,195,1)_100%)] hover:opacity-90 cursor-pointer transition-opacity"
      >
        <div className="relative w-fit -mt-px font-['Roobert-SemiBold',Helvetica] font-semibold text-[#121e36] text-[17px] tracking-[-0.34px] leading-[normal] whitespace-nowrap">
          {getButtonText()}
        </div>
      </button>
    </div>
  );
};
