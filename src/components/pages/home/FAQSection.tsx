"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FaqItem: React.FC<FaqItemProps> = ({
  question,
  answer,
  isOpen,
  onClick,
}) => {
  return (
    <div
      className={`flex flex-col w-full items-start gap-4 p-6 relative bg-[#ffffff0d] rounded-2xl border ${
        isOpen ? "border-[#cfd296cf]" : "border-[#ffffff17]"
      } backdrop-blur-2xl backdrop-brightness-100 cursor-pointer transition-all duration-300 hover:bg-[#ffffff1a]`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between w-full relative">
        <h3 className="w-full pr-4 font-['Roobert-Medium',Helvetica] font-medium text-white text-lg leading-snug">
          {question}
        </h3>
        {isOpen ? (
          <Minus className="w-5 h-5 text-[#cfd296] shrink-0" />
        ) : (
          <Plus className="w-5 h-5 text-white shrink-0" />
        )}
      </div>
      {isOpen && (
        <div className="relative self-stretch font-['Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-base leading-relaxed whitespace-pre-line">
          {answer}
        </div>
      )}
    </div>
  );
};

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number>(-1);
  const [visibleCount, setVisibleCount] = useState(4);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  const handleViewMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  const faqItems = [
    {
      question: "Is FundingMatch.ai a lender?",
      answer:
        "No. FundingMatch.ai is not a lender. We are a business funding matching platform and brokerage service. We introduce businesses to FCA-regulated lenders based on eligibility, affordability, and funding requirements.",
    },
    {
      question: "How does FundingMatch.ai work?",
      answer:
        "You complete a short application, and our AI-powered platform analyses your business profile, income, and trading history. We then match you with lenders most likely to make you a real funding offer, which you can review and choose from.",
    },
    {
      question: "How fast can I get a decision?",
      answer:
        "Many lenders provide decisions within hours, with most offers received within 24 hours, depending on the product and information provided.",
    },
    {
      question: "Will this affect my credit file?",
      answer:
        "Where possible, we use soft credit checks first, which do not impact your credit score. Some lenders may require a hard check later if you choose to proceed with an offer.",
    },
    {
      question: "Do I have to accept an offer?",
      answer:
        "No. There’s no obligation to proceed. You can review any offers and decide whether or not to continue.",
    },
    {
      question: "Are the lenders you work with regulated?",
      answer:
        "Yes. We introduce you to reputable, FCA-regulated lenders and established funding providers.",
    },
    {
      question: "Does FundingMatch.ai charge a fee?",
      answer:
        "We typically receive a fee from the lender if funding completes. This does not usually affect the rate you’re offered, and we’ll always be transparent about the process.",
    },
    {
      question: "Is my information secure?",
      answer:
        "Yes. Your data is handled securely and only shared with lenders when necessary to assess your application.",
    },
  ];

  const firstColumn = faqItems.slice(0, Math.ceil(faqItems.length / 2));
  const secondColumn = faqItems.slice(Math.ceil(faqItems.length / 2));

  return (
    <div className="flex flex-col w-full items-center gap-12 lg:gap-[68px] my-10 py-12 relative max-w-7xl mx-auto px-4">
      <div className="flex flex-col items-center gap-4 relative self-stretch w-full">
        <h2 className="font-['Roobert-SemiBold',Helvetica] font-semibold text-white text-3xl md:text-5xl text-center tracking-tight leading-tight">
          Got questions?
        </h2>
        <p className="font-['Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-lg md:text-xl text-center leading-relaxed">
          We’ve got answers.
        </p>
      </div>

      {/* Mobile View: Single Column with View More */}
      <div className="flex flex-col lg:hidden items-center gap-6 w-full">
        <div className="flex flex-col items-start gap-4 w-full">
          {faqItems.slice(0, visibleCount).map((item, index) => (
            <FaqItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onClick={() => toggleFaq(index)}
            />
          ))}
        </div>
        {visibleCount < faqItems.length && (
          <button
            onClick={handleViewMore}
            className="mt-4 px-8 py-3 bg-[#ffffff0a] rounded-full border border-[#ffffff33] text-white font-['Roobert-Medium'] hover:bg-[#ffffff1a] transition-colors"
          >
            View more
          </button>
        )}
      </div>

      {/* Desktop View: Two Column Layout */}
      <div className="hidden lg:flex flex-row items-start justify-center gap-6 relative self-stretch w-full">
        <div className="flex flex-col items-start gap-3 relative flex-1 w-full">
          {firstColumn.map((item, index) => (
            <FaqItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onClick={() => toggleFaq(index)}
            />
          ))}
        </div>

        <div className="flex flex-col items-start gap-3 relative flex-1 w-full">
          {secondColumn.map((item, index) => {
            const actualIndex = index + firstColumn.length;
            return (
              <FaqItem
                key={actualIndex}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === actualIndex}
                onClick={() => toggleFaq(actualIndex)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
