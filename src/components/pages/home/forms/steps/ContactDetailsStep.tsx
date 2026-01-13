"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

export const ContactDetailsStep = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Email Address */}
      <div className="flex flex-col gap-2">
        <label className="text-white text-sm font-medium font-['Roobert-Regular',Helvetica]">Email Address</label>
        <input
          type="email"
          {...register("email")}
          placeholder="name@example.com"
          className="w-full bg-[#ffffff0a] border border-[#ffffff33] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffffff66]"
        />
        {errors.email && (
          <p className="text-red-400 text-xs mt-1">{String(errors.email.message)}</p>
        )}
      </div>

      {/* Mobile Number */}
      <div className="flex flex-col gap-2">
        <label className="text-white text-sm font-medium font-['Roobert-Regular',Helvetica]">Mobile Number</label>
        <input
          type="tel"
          {...register("mobileNumber")}
          placeholder="07700 900000"
          className="w-full bg-[#ffffff0a] border border-[#ffffff33] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffffff66]"
        />
        {errors.mobileNumber && (
          <p className="text-red-400 text-xs mt-1">{String(errors.mobileNumber.message)}</p>
        )}
      </div>
    </div>
  );
};
