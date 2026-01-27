"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

export const CreditCheckStep = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const [checking, setChecking] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const consent = watch("consentCreditCheck");
  const companyNumber = watch("companyRegistrationNumber");
  const directorName = watch("directorName");

  React.useEffect(() => {
    if (consent && companyNumber && !result && !checking) {
      const checkCredit = async () => {
        setChecking(true);
        try {
          // TEMPORARY: Commented out Experian API call until production keys are available
          /*
          const response = await fetch("/api/experian/check-eligibility", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ companyNumber, directorName }),
          });
          const data = await response.json();
          */

          // Mock successful response
          const data: any = {
            // company: {
            //   summary: {
            //     companyName: "Mock Company Ltd",
            //     registrationNumber: companyNumber,
            //     companyStatus: "Active",
            //     creditRating: 90,
            //     creditLimit: 50000,
            //   }
            // },
            // director: {
            //   summary: {
            //     personalCreditScore: 999
            //   }
            // }
          };

          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

          setResult(data);
          // Optionally store relevant data in form
          if (data && !data.error) {
            setValue("experianData", data);
          }
        } catch (error) {
          console.error("Credit check failed:", error);
        } finally {
          setChecking(false);
        }
      };
      checkCredit();
    }
  }, [consent, companyNumber, directorName, result, checking, setValue]);

  return (
    <div className="flex flex-col items-start gap-4 w-full">
      <p className="font-['Roobert-Regular',Helvetica] text-sm text-[#ffffffcc] leading-relaxed">
        To provide you with the most accurate funding options, we need to perform a <span className="text-white font-semibold">soft credit check</span>.
      </p>
      <div className="px-4 rounded-xl flex flex-col gap-3">
        <ul className="list-disc pl-5 font-['Roobert-Regular',Helvetica] text-sm text-[#ffffffcc] space-y-1">
          <li>
            For <span className="text-white">Limited Companies</span>, we check for CCJs and credit details on the business.
          </li>
          <li>
            We also check the <span className="text-white">Director's personal credit score</span> to assess eligibility.
          </li>
        </ul>
      </div>
      <p className="font-['Roobert-Regular',Helvetica] text-sm text-[#ffffffcc] mt-1">
        This is a soft check only and <strong>will not impact your credit score</strong>.
      </p>
      <label className={`flex items-start w-full gap-3 p-4 rounded-xl border border-[#ffffff33] cursor-pointer hover:bg-[#ffffff0a] transition-colors relative group ${checking ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="relative flex items-center pt-1 mt-1">
          <input
            type="checkbox"
            {...register("consentCreditCheck")}
            className="w-5 h-5 rounded border-gray-400 bg-[#ffffff0a] text-blue-600 focus:ring-blue-500"
            disabled={checking}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-['Roobert-SemiBold',Helvetica] text-white text-md">
            I consent to the soft credit check
          </span>
          <span className="font-['Roobert-Regular',Helvetica] text-sm text-[#ffffffcc]">
            I understand this does not affect my credit rating.
          </span>
        </div>
        {checking && (
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <span className="text-xs text-[#ffffff99]">Checking...</span>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
        )}
      </label>
      {result && !result.error && (
        <div className="w-full p-4 bg-[#b0efbd1a] border border-[#b0efbd] rounded-xl flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[#b0efbd] flex items-center justify-center text-[#121e36]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-['Roobert-SemiBold',Helvetica] text-white">Eligibility Check Complete</p>
            <p className="text-xs text-[#ffffffcc]">We have successfully verified the business details.</p>
          </div>
        </div>
      )}
      {errors.consentCreditCheck && (
        <p className="text-red-400 text-xs mt-1">{String(errors.consentCreditCheck.message)}</p>
      )}
    </div>
  );
};
