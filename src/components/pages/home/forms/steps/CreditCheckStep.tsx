"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

export const CreditCheckStep = () => {
  const { register, formState: { errors } } = useFormContext();

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
      <label className="flex items-start w-full gap-3 p-4 rounded-xl border border-[#ffffff33] cursor-pointer hover:bg-[#ffffff0a] transition-colors relative group">
        <div className="relative flex items-center pt-1 mt-1">
          <input
            type="checkbox"
            {...register("consentCreditCheck")}
            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-[#ffffff66] bg-[#ffffff0a] checked:bg-[#b0efbd] checked:border-[#b0efbd] transition-all"
          />
          <svg
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-[#121e36] opacity-0 peer-checked:opacity-100 transition-opacity"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-['Roobert-SemiBold',Helvetica] text-white text-md">
            I consent to the soft credit check
          </span>
          <span className="font-['Roobert-Regular',Helvetica] text-sm text-[#ffffffcc]">
            I understand this does not affect my credit rating.
          </span>
        </div>
      </label>
    </div>
  );
};
