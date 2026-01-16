"use client";

import React, { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { AddressFinder } from "@ideal-postcodes/address-finder";

export const SoleTraderPersonalDetailsStep = () => {
  const { register, setValue, formState: { errors } } = useFormContext();
  const shouldRender = useRef(true);

  useEffect(() => {
    if (!shouldRender.current) return;
    shouldRender.current = false;

    if (process.env.IDEAL_POSTCODES_API_KEY) {
      AddressFinder.watch({
        inputField: "#sole-trader-address-search",
        apiKey: process.env.IDEAL_POSTCODES_API_KEY,
        checkKey: true,
        defaultCountry: "GBR",
        restrictCountries: ["GBR"],
        detectCountry: false,
        injectStyle: false,
        hideToolbar: true,
        listStyle: {
          backgroundColor: "#111827",
          border: "1px solid #374151",
          borderRadius: "0.75rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          padding: "0",
          position: "absolute",
          width: "100%",
          zIndex: "60",
          marginTop: "0.25rem",
          overflowY: "auto",
          maxHeight: "280px",
          listStyleType: "none"
        },
        liStyle: {
          color: "white",
          borderBottom: "1px solid #1f2937",
          padding: "0.75rem 1rem",
          fontSize: "0.875rem",
          cursor: "pointer"
        },
        onAddressRetrieved: (address: any) => {
          const formattedAddress = [
            address.line_1,
            address.line_2,
            address.line_3,
            address.post_town,
            address.postcode
          ].filter(Boolean).join(", ");

          setValue("residentialAddress", formattedAddress, { shouldValidate: true });
        },
      });
    }
  }, [setValue]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Residential Address */}
      <div className="flex flex-col gap-2">
        <label className="text-white text-sm font-medium font-['Roobert-Regular',Helvetica]">Residential Address</label>
        <input
          {...register("residentialAddress")}
          id="sole-trader-address-search"
          placeholder="Start typing your address..."
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
