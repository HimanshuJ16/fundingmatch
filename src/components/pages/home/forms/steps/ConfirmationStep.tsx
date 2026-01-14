"use client";

import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface ConfirmationStepProps {
  status: "matched" | "no_match";
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ status }) => {
  const isMatched = status === "matched";

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full py-10 bg-[#ffffff0a] rounded-xl border border-[#ffffff33]">
      <div className={`p-5 rounded-full ${isMatched ? "bg-[#b0efbd]/20" : "bg-red-500/20"}`} style={{ backgroundColor: isMatched ? "rgba(176, 239, 189, 0.2)" : "rgba(239, 68, 68, 0.2)" }}>
        {isMatched ? (
          <CheckCircle className="w-12 h-12 text-[#b0efbd]" />
        ) : (
          <XCircle className="w-12 h-12 text-red-500" />
        )}
      </div>

      <div className="flex flex-col items-center gap-2 text-center px-4">
        <h3 className="font-['Roobert-SemiBold',Helvetica] text-xl md:text-2xl text-white">
          {isMatched ? "Matched lenders identified" : "No lenders matched"}
        </h3>
        <p className="font-['Roobert-Regular',Helvetica] text-sm md:text-base text-[#ffffffcc] max-w-sm">
          {isMatched
            ? "A funding manager will contact within 24 hours to confirm offers"
            : "Unfortunately you do not qualify for any of our panel lenders this time"}
        </p>
      </div>
    </div>
  );
};
