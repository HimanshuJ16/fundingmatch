"use client";

import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";

interface Company {
  company_number: string;
  title: string;
  address_snippet: string;
}

export const BusinessDetailsStep = () => {
  const { setValue, watch, register, formState: { errors } } = useFormContext();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Company[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTimeTradingDropdown, setShowTimeTradingDropdown] = useState(false);
  const isSelectionRef = React.useRef(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      // If the query update was triggered by a selection, skip the search but reset the flag for future typing
      if (isSelectionRef.current) {
        isSelectionRef.current = false;
        return;
      }

      // Clear selection when user types
      setValue("companyName", "");
      setValue("companyRegistrationNumber", "");
      setValue("registeredAddress", "");

      if (query.trim().length > 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/companies-house/search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            setResults(data.items || []);
            setShowDropdown(true);
          }
        } catch (err) {
          console.error("Search failed", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const selectCompany = (company: Company) => {
    isSelectionRef.current = true;
    setValue("companyName", company.title);
    setValue("companyRegistrationNumber", company.company_number);
    setValue("registeredAddress", company.address_snippet);
    setQuery(company.title);
    setShowDropdown(false);
  };

  const companyName = watch("companyName");
  const registeredAddress = watch("registeredAddress");

  return (
    <div className="flex flex-col items-start gap-4 w-full">
      {/* Sole Trader Fields */}
      {watch("businessType") === "sole_trader" && (
        <>
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium font-['Roobert-Regular',Helvetica]">First Name</label>
              <input
                {...register("firstName")}
                placeholder="John"
                className="w-full bg-[#ffffff0a] border border-[#ffffff33] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffffff66]"
              />
              {errors.firstName && (
                <p className="text-red-400 text-xs mt-1">{String(errors.firstName.message)}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium font-['Roobert-Regular',Helvetica]">Last Name</label>
              <input
                {...register("lastName")}
                placeholder="Doe"
                className="w-full bg-[#ffffff0a] border border-[#ffffff33] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffffff66]"
              />
              {errors.lastName && (
                <p className="text-red-400 text-xs mt-1">{String(errors.lastName.message)}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="text-white text-sm font-medium font-['Roobert-Regular',Helvetica]">Business / Trading Name</label>
            <input
              {...register("tradingName")}
              placeholder="JD Plumbing"
              className="w-full bg-[#ffffff0a] border border-[#ffffff33] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffffff66]"
            />
            {errors.tradingName && (
              <p className="text-red-400 text-xs mt-1">{String(errors.tradingName.message)}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full relative">
            <label
              className="text-white text-sm font-medium font-['Roobert-Regular',Helvetica]"
              style={{ letterSpacing: "0.1px" }}
            >
              Time Trading
            </label>
            <div
              onClick={() => setShowTimeTradingDropdown(!showTimeTradingDropdown)}
              className="w-full bg-[#ffffff0a] border border-[#ffffff33] rounded-xl px-4 py-3 text-white cursor-pointer flex items-center justify-between transition-colors hover:bg-[#ffffff10]"
            >
              <span className={watch("timeTrading") ? "text-white" : "text-gray-400"}>
                {watch("timeTrading") || "Select time trading..."}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-gray-400 transition-transform ${showTimeTradingDropdown ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>

            {showTimeTradingDropdown && (
              <div
                className="absolute z-60 w-full top-full mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl"
                style={{
                  backgroundColor: "#111827",
                  maxHeight: "280px",
                  overflowY: "auto",
                }}
              >
                {[
                  "Less than 6 months",
                  "6 - 12 months",
                  "1 - 2 years",
                  "2+ years"
                ].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setValue("timeTrading", option);
                      setShowTimeTradingDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 text-white transition-colors border-b border-gray-800 last:border-0 hover:bg-slate-700 focus:bg-slate-700 outline-none"
                  >
                    <span className="font-medium text-sm tracking-wide">{option}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Hidden input for form registration/validation */}
            <select
              {...register("timeTrading")}
              className="hidden"
            >
              <option value="" disabled>Select time trading...</option>
              <option value="Less than 6 months">Less than 6 months</option>
              <option value="6 - 12 months">6 - 12 months</option>
              <option value="1 - 2 years">1 - 2 years</option>
              <option value="2+ years">2+ years</option>
            </select>

            {errors.timeTrading && (
              <p className="text-red-400 text-xs mt-1">{String(errors.timeTrading.message)}</p>
            )}
          </div>
        </>
      )}

      {/* Limited Company Fields */}
      {(watch("businessType") === "limited_company" || !watch("businessType")) && (
        <div className="relative w-full">
          <label className="block text-white text-sm font-medium mb-1 font-['Roobert-Regular',Helvetica]">
            Search Company
          </label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#ffffff0a] border border-[#ffffff33] rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffffff66] transition-colors"
              placeholder="Enter company name..."
            />
          </div>

          {showDropdown && results.length > 0 && (
            <div
              className="absolute z-60 w-full mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl"
              style={{
                backgroundColor: "#111827",
                maxHeight: "280px",
                overflowY: "auto",
              }}
            >
              {results.map((company) => (
                <button
                  key={company.company_number}
                  type="button"
                  onClick={() => selectCompany(company)}
                  className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-0 flex flex-col gap-1"
                >
                  <div className="font-semibold text-sm tracking-wide">{company.title}</div>
                  <div className="text-xs text-gray-400 font-normal leading-relaxed">{company.address_snippet}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hidden inputs to ensure registration is handled for LC */}
      <input type="hidden" {...register("companyName")} />
      <input type="hidden" {...register("companyRegistrationNumber")} />
      <input type="hidden" {...register("registeredAddress")} />

      {(watch("businessType") === "limited_company" || !watch("businessType")) && companyName && (
        <div className="w-full p-4 bg-[#ffffff0a] rounded-xl border border-[#ffffff33] mt-2">
          <h4 className="text-white font-semibold text-sm mb-1">Selected Company</h4>
          <p className="text-white text-sm opacity-90">{companyName}</p>
          <p className="text-[#ffffffcc] text-xs mt-1">{registeredAddress}</p>
        </div>
      )}
      {(watch("businessType") === "limited_company" || !watch("businessType")) && errors.companyName && (
        <p className="text-red-400 text-xs mt-1">{String(errors.companyName.message)}</p>
      )}
    </div>
  );
};
