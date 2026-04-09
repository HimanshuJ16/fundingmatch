"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { contactSchema, ContactFormData } from "@/schemas/contact.schema";

interface ContactFormProps {
  onClose?: () => void;
}

export const ContactForm = ({ onClose }: ContactFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSuccess(true);
        reset();
      } else {
        setError(result.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Contact form submission error:", err);
      setError("Failed to send request. please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col w-full max-w-[480px] justify-center items-center gap-6 p-8 relative rounded-[32px] bg-[#121e36] shadow-2xl text-center">
        <div className="w-16 h-16 bg-[#b0efbd22] rounded-full flex items-center justify-center mb-2">
          <div className="w-8 h-8 rounded-full bg-[#b0efbd]" />
        </div>
        <h2 className="text-2xl font-semibold text-white">Request Sent!</h2>
        <p className="text-[#ffffffcc]">
          Thank you for reaching out. Our team will contact you shortly.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="mt-4 px-8 py-3 rounded-full bg-[linear-gradient(106deg,rgba(165,215,171,1)_0%,rgba(147,195,195,1)_100%)] text-[#121e36] font-semibold hover:opacity-90 transition-opacity"
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-[480px] justify-between items-center gap-8 p-8 relative rounded-[32px] bg-[#121e36] shadow-2xl border border-[#ffffff14]">
      {/* Header */}
      <div className="flex justify-between items-center w-full">
        <h2 className="text-[32px] font-bold text-white tracking-tight">Speak to us</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-[#ffffff66] hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
        {/* Name Field */}
        <div className="flex flex-col gap-2">
          <label className="text-[#ffffffcc] text-sm font-medium ml-1">Name</label>
          <input
            {...register("name")}
            placeholder="Your full name"
            className={`w-full bg-[#1c2b4a] border ${errors.name ? "border-red-500" : "border-[#ffffff14]"} rounded-xl px-4 py-4 text-white placeholder-[#ffffff44] focus:outline-none focus:border-[#b0efbd] transition-colors`}
          />
          {errors.name && <span className="text-red-500 text-xs ml-1">{errors.name.message}</span>}
        </div>

        {/* Company Name Field */}
        <div className="flex flex-col gap-2">
          <label className="text-[#ffffffcc] text-sm font-medium ml-1">Company Name</label>
          <input
            {...register("companyName")}
            placeholder="Your company name"
            className={`w-full bg-[#1c2b4a] border ${errors.companyName ? "border-red-500" : "border-[#ffffff14]"} rounded-xl px-4 py-4 text-white placeholder-[#ffffff44] focus:outline-none focus:border-[#b0efbd] transition-colors`}
          />
          {errors.companyName && <span className="text-red-500 text-xs ml-1">{errors.companyName.message}</span>}
        </div>

        {/* Email Address Field */}
        <div className="flex flex-col gap-2">
          <label className="text-[#ffffffcc] text-sm font-medium ml-1">Email Address</label>
          <input
            {...register("email")}
            placeholder="you@example.com"
            className={`w-full bg-[#1c2b4a] border ${errors.email ? "border-red-500" : "border-[#ffffff14]"} rounded-xl px-4 py-4 text-white placeholder-[#ffffff44] focus:outline-none focus:border-[#b0efbd] transition-colors`}
          />
          {errors.email && <span className="text-red-500 text-xs ml-1">{errors.email.message}</span>}
        </div>

        {/* Contact Number Field */}
        <div className="flex flex-col gap-2">
          <label className="text-[#ffffffcc] text-sm font-medium ml-1">Contact Number</label>
          <input
            {...register("phone")}
            placeholder="Your phone number"
            type="tel"
            className={`w-full bg-[#1c2b4a] border ${errors.phone ? "border-red-500" : "border-[#ffffff14]"} rounded-xl px-4 py-4 text-white placeholder-[#ffffff44] focus:outline-none focus:border-[#b0efbd] transition-colors`}
          />
          {errors.phone && <span className="text-red-500 text-xs ml-1">{errors.phone.message}</span>}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex items-center justify-center w-full py-5 mt-2 rounded-[60px] bg-[linear-gradient(106deg,rgba(165,215,171,1)_0%,rgba(147,195,195,1)_100%)] text-[#121e36] text-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? "Sending..." : "Send Request"}
        </button>
      </form>
    </div>
  );
};
