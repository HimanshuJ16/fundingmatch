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
      } backdrop-blur-[40px] backdrop-brightness-[100%] cursor-pointer transition-all duration-300`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between w-full relative">
        <div className="relative w-fit mt-[-1.00px] [font-family:'Roobert-Medium',Helvetica] font-medium text-white text-lg tracking-[0] leading-[28.8px]">
          {question}
        </div>
        {isOpen ? (
          <Minus className="w-5 h-5 text-[#cfd296]" />
        ) : (
          <Plus className="w-5 h-5 text-white" />
        )}
      </div>
      {isOpen && (
        <div className="relative self-stretch [font-family:'Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-base tracking-[0] leading-[25.6px] whitespace-pre-line">
          {answer}
        </div>
      )}
    </div>
  );
};

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number>(-1);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
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
      question: "How long does the application take?",
      answer: "Most applications take around 5 minutes to complete.",
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
      question: "What funding amounts can I apply for?",
      answer:
        "We support funding options typically ranging from £5,000 up to £500,000, depending on your business profile and eligibility.",
    },
    {
      question: "What types of funding do you support?",
      answer:
        "We introduce businesses to a range of funding options, including:\n• Unsecured business loans\n• Merchant cash advances\n• Flexible working capital solutions\n\nAvailability depends on lender criteria and business eligibility.",
    },
    {
      question: "What do I need to apply?",
      answer:
        "You’ll usually need:\n• Basic business details\n• Estimated turnover\n• Time trading\n• Recent business bank statements (requested later if needed)",
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
      question: "Is FundingMatch.ai suitable for new businesses?",
      answer:
        "Eligibility varies by lender. Most lenders require a minimum trading history, but we’ll only match you to lenders where you’re more likely to qualify.",
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
    {
      question: "Can I speak to someone for help?",
      answer:
        "Yes. Our UK-based team is available if you’d like guidance at any stage of the process.",
    },
  ];

  const firstColumn = faqItems.slice(0, Math.ceil(faqItems.length / 2));
  const secondColumn = faqItems.slice(Math.ceil(faqItems.length / 2));

  return (
    <div className="flex flex-col w-full items-center gap-[68px] my-20 relative max-w-[1217px] mx-auto px-4">
      <div className="flex flex-col items-center gap-4 relative self-stretch w-full flex-[0_0_auto] mt-20">
        <div className="relative w-fit mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-5xl text-center tracking-[-1.92px] leading-[55.7px] whitespace-nowrap">
          Got questions?
        </div>
        <p className="relative w-fit [font-family:'Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-xl text-center tracking-[0] leading-[32.0px] whitespace-nowrap">
          We’ve got answers.
        </p>
      </div>

      <div className="flex items-start justify-center gap-6 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-start gap-3 relative flex-1 grow">
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

        <div className="flex flex-col items-start gap-3 relative flex-1 grow">
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
