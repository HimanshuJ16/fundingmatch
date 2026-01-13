"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

export const SoleTraderPersonalDetailsStep = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Residential Address */}
      <div className="flex flex-col gap-2">
        <label className="text-white text-sm font-medium font-['Roobert-Regular',Helvetica]">Residential Address</label>
        <input
          {...register("residentialAddress")}
          placeholder="Enter residential address"
          className="w-full bg-[#ffffff0a] border border-[#ffffff33] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffffff66]"
        />
        {errors.residentialAddress && (
          <p className="text-red-400 text-xs mt-1">{String(errors.residentialAddress.message)}</p>
        )}
      </div>

      {/* Date of Birth */}
      <div className="flex flex-col gap-2">
        <label className="text-white text-sm font-medium font-['Roobert-Regular',Helvetica]">Date of Birth</label>
        <input
          type="date"
          {...register("directorDateOfBirth")} // Using same field as Director for simplicity in schema
          className="w-full bg-[#ffffff0a] border border-[#ffffff33] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffffff66] scheme-dark"
        />
        {errors.directorDateOfBirth && (
          <p className="text-red-400 text-xs mt-1">{String(errors.directorDateOfBirth.message)}</p>
        )}
      </div>

      {/* Homeowner Status */}
      <div className="flex items-center gap-3 mt-2">
        <input
          type="checkbox"
          id="homeOwnerStatus"
          {...register("homeOwnerStatus")}
          className="w-5 h-5 rounded border-gray-400 bg-[#ffffff0a] text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="homeOwnerStatus" className="text-white text-sm font-['Roobert-Regular',Helvetica]">
          I am a homeowner
        </label>
      </div>
    </div>
  );
};
