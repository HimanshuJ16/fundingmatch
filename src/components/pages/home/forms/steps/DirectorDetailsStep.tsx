"use client";

import React, { useEffect, useState, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { AddressFinder } from "@ideal-postcodes/address-finder";

interface Officer {
  name: string;
  date_of_birth?: {
    year: number;
    month: number;
  };
  appointed_on?: string;
  officer_role: string;
}

export const DirectorDetailsStep = () => {
  const { setValue, watch, register, formState: { errors } } = useFormContext();
  const companyNumber = watch("companyRegistrationNumber");
  const [directors, setDirectors] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (companyNumber) {
      setLoading(true);
      fetch(`/api/companies-house/officers?companyNumber=${companyNumber}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.items) {
            // Filter for active directors if needed, currently taking all
            setDirectors(data.items);
          }
        })
        .catch((err) => console.error("Failed to fetch officers", err))
        .finally(() => setLoading(false));
    }
  }, [companyNumber]);

  const shouldRenderAddressFinder = useRef(true);

  useEffect(() => {
    if (!shouldRenderAddressFinder.current) return;
    shouldRenderAddressFinder.current = false;

    if (process.env.IDEAL_POSTCODES_API_KEY) {
      AddressFinder.watch({
        inputField: "#director-address-search",
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

  const [showDropdown, setShowDropdown] = useState(false);
  const selectedDirector = watch("directorName");

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2 relative">
        <label className="text-white text-sm font-medium font-['Roobert-Regular',Helvetica]">Select Director</label>
        {loading ? (
          <div className="text-gray-300 text-sm">Loading directors...</div>
        ) : directors.length > 0 ? (
          <>
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full bg-[#ffffff0a] border border-[#ffffff33] rounded-xl px-4 py-3 text-white cursor-pointer flex items-center justify-between"
            >
              <span className={selectedDirector ? "text-white" : "text-gray-400"}>
                {selectedDirector || "Select a director..."}
              </span>
              <div className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </div>

            {showDropdown && (
              <div
                className="absolute z-60 w-full top-full mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl"
                style={{
                  backgroundColor: "#111827",
                  maxHeight: "280px",
                  overflowY: "auto",
                }}
              >
                {directors.map((director, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setValue("directorName", director.name, { shouldValidate: true });
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 text-white transition-colors border-b border-gray-800 last:border-0 hover:bg-slate-700 focus:bg-slate-700 outline-none"
                  >
                    <div className="font-semibold text-sm tracking-wide">{director.name}</div>
                    <div className="text-xs text-gray-400 font-normal leading-relaxed">{director.officer_role}</div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <input
            {...register("directorName")}
            placeholder="Enter director name"
            className="w-full bg-[#ffffff0a] border border-[#ffffff33] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffffff66]"
          />
        )}
        {errors.directorName && (
          <p className="text-red-400 text-xs mt-1">{String(errors.directorName.message)}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-white text-sm font-medium font-['Roobert-Regular',Helvetica]">Date of Birth</label>
        <input
          type="date"
          {...register("directorDateOfBirth")}
          className="w-full bg-[#ffffff0a] border border-[#ffffff33] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffffff66] scheme-dark"
        />
        {errors.directorDateOfBirth && (
          <p className="text-red-400 text-xs mt-1">{String(errors.directorDateOfBirth.message)}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-white text-sm font-medium font-['Roobert-Regular',Helvetica]">Residential Address</label>
        <input
          {...register("residentialAddress")}
          id="director-address-search"
          placeholder="Start typing your address..."
          className="w-full bg-[#ffffff0a] border border-[#ffffff33] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffffff66]"
        />
        {errors.residentialAddress && (
          <p className="text-red-400 text-xs mt-1">{String(errors.residentialAddress.message)}</p>
        )}
      </div>

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
