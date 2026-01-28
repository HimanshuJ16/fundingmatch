"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2 } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Contact number is required"),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal = ({ isOpen, onClose }: ContactModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
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

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setIsSuccess(true);
      reset();
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state after a delay if desired, or keep it to show success on re-open?
    // For now, let's reset success state when closing so valid form is shown next time
    if (isSuccess) {
      setTimeout(() => {
        setIsSuccess(false);
        setError(null);
      }, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#182744] rounded-2xl border border-[#ffffff17] shadow-xl overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-['Roobert-SemiBold',Helvetica] font-semibold text-white mb-6">
            Speak to us
          </h2>

          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#b0efbd] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#121e36]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Message Sent!
              </h3>
              <p className="text-gray-300 mb-6">
                Thanks for reaching out. We'll get back to you shortly.
              </p>
              <button
                onClick={handleClose}
                className="w-full py-3 bg-[#b0efbd] text-[#121e36] font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Name
                </label>
                <input
                  {...register("name")}
                  id="name"
                  type="text"
                  className={`w-full px-4 py-3 bg-[#ffffff0a] border ${errors.name ? "border-red-500" : "border-[#ffffff17]"
                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#b0efbd] transition-colors`}
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Company Name
                </label>
                <input
                  {...register("companyName")}
                  id="companyName"
                  type="text"
                  className={`w-full px-4 py-3 bg-[#ffffff0a] border ${errors.companyName ? "border-red-500" : "border-[#ffffff17]"
                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#b0efbd] transition-colors`}
                  placeholder="Your company name"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Email Address
                </label>
                <input
                  {...register("email")}
                  id="email"
                  type="email"
                  className={`w-full px-4 py-3 bg-[#ffffff0a] border ${errors.email ? "border-red-500" : "border-[#ffffff17]"
                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#b0efbd] transition-colors`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Contact Number
                </label>
                <input
                  {...register("phone")}
                  id="phone"
                  type="tel"
                  className={`w-full px-4 py-3 bg-[#ffffff0a] border ${errors.phone ? "border-red-500" : "border-[#ffffff17]"
                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#b0efbd] transition-colors`}
                  placeholder="Your phone number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 mt-2 bg-[linear-gradient(106deg,rgba(165,215,171,1)_0%,rgba(147,195,195,1)_100%)] text-[#121e36] font-['Roobert-SemiBold',Helvetica] font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Sending...
                  </>
                ) : (
                  "Send Request"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
