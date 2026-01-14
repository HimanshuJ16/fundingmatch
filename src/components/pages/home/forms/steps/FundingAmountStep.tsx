"use client";

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";

const AMOUNTS = ["10000", "20000", "30000", "50000", "100000", "Custom"];

export const FundingAmountStep = () => {
  const { setValue, watch, register, formState: { errors } } = useFormContext();
  const selectedAmount = watch("fundingAmount");
  const [showCustom, setShowCustom] = useState(selectedAmount === "Custom");

  const handleAmountSelect = (value: string) => {
    setValue("fundingAmount", value, { shouldValidate: true });
    setShowCustom(value === "Custom");
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-2 gap-3">
        {AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => handleAmountSelect(amount)}
            className={`px-4 py-3 rounded-xl border text-sm font-medium text-white transition-colors ${selectedAmount === amount
              ? "bg-[#ffffff1a] border-[#b0efbd] "
              : "bg-[#ffffff0a] border-[#ffffff33] hover:bg-[#ffffff10]"
              }`}
          >
            {amount === "Custom" ? "Custom Amount" : `£${parseInt(amount).toLocaleString()}`}
          </button>
        ))}
      </div>

      {/* Hidden input for validation */}
      <input type="hidden" {...register("fundingAmount")} />

      {selectedAmount === "Custom" && (
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-white text-sm font-medium font-['Roobert-Regular',Helvetica]">Enter Amount</label>
          <div className="relative">
            <span
              className="absolute text-white font-medium text-lg"
              style={{ top: "50%", transform: "translateY(-50%)", left: "1.25rem" }}
            >
              £
            </span>
            <input
              type="number"
              {...register("fundingAmountCustom")}
              placeholder="e.g. 75,000"
              className="w-full bg-[#ffffff0a] border border-[#ffffff33] rounded-xl pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffffff66] transition-colors"
              style={{ paddingLeft: "35px" }}
            />
          </div>
          {errors.fundingAmountCustom && (
            <p className="text-red-400 text-xs mt-1">{String(errors.fundingAmountCustom.message)}</p>
          )}
        </div>
      )}

      {errors.fundingAmount && (
        <p className="text-red-400 text-xs mt-1">{String(errors.fundingAmount.message)}</p>
      )}
    </div>
  );
};
