import { Metadata } from "next";
import { ContactForm } from "@/components/pages/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | FundingMatchAI",
  description: "Get in touch with our team for smart funding solutions.",
};

export default function ContactPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 py-12 md:py-20 bg-[#182744]">
      <div className="relative z-10 w-full flex justify-center">
        <ContactForm />
      </div>
    </main>
  );
}
