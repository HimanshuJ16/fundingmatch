import { useState } from "react";

export const FAQSection = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const icons = [
    {
      src: "https://c.animaapp.com/WGyxBptO/img/vector.svg",
      alt: "collapse",
    },
    {
      src: "https://c.animaapp.com/WGyxBptO/img/vector-3.svg",
      alt: "expand",
    },
  ]

  const faqData = [
    {
      id: 0,
      question: "Is FundingMatch.ai a lender?",
      answer:
        "FundingMatch.ai is a matching platform and brokerage service. We introduce you to suitable lenders based on eligibility and your requirements.",
    },
    {
      id: 1,
      question: "How fast can I get a decision?",
      answer: "",
    },
    {
      id: 2,
      question: "Will this affect my credit file?",
      answer: "",
    },
    {
      id: 3,
      question: "What do I need to apply?",
      answer: "",
    },
  ];

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="relative w-[1440px] h-[539px] bg-[#182744]">
      <div className="flex-col w-[1217px] items-center gap-[68px] top-20 left-[108px] flex relative">
        <div className="flex-col w-[556px] items-center gap-4 flex-[0_0_auto] flex relative">
          <h1 className="relative self-stretch mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-5xl text-center tracking-[-1.92px] leading-[55.7px]">
            FAQ
          </h1>
        </div>

        <div className="flex items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex-col items-start gap-2 flex-1 grow flex relative">
            <button
              className="flex flex-col items-start gap-5 p-6 relative self-stretch w-full flex-[0_0_auto] bg-[#ffffff0a] rounded-2xl border border-solid cursor-pointer"
              onClick={() => toggleFaq(0)}
              aria-expanded={expandedFaq === 0}
              aria-controls="faq-answer-0"
            >
              <div className="items-start justify-between self-stretch w-full flex-[0_0_auto] flex relative">
                <div className="flex-col w-[490px] items-start gap-2 flex relative">
                  <h2 className="relative self-stretch mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-xl tracking-[0] leading-[23.2px]">
                    {faqData[0].question}
                  </h2>

                  {expandedFaq === 0 && (
                    <p
                      id="faq-answer-0"
                      className="relative self-stretch [font-family:'Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-lg tracking-[0] leading-[28.8px]"
                    >
                      {faqData[0].answer}
                    </p>
                  )}
                </div>

                <img
                  className="relative w-4 h-0.5 mt-[-1.00px] mr-[-1.00px]"
                  alt={expandedFaq === 0 ? "Collapse" : "Expand"}
                  src={
                    expandedFaq === 0 ? icons[0].src : icons[1].src
                  }
                />
              </div>
            </button>

            <button
              className="flex items-center justify-between px-6 py-5 relative self-stretch w-full flex-[0_0_auto] bg-[#ffffff0a] rounded-2xl border border-solid cursor-pointer"
              onClick={() => toggleFaq(1)}
              aria-expanded={expandedFaq === 1}
              aria-controls="faq-answer-1"
            >
              <h2 className="relative w-fit mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-xl tracking-[0] leading-[23.2px] whitespace-nowrap">
                {faqData[1].question}
              </h2>

              <img
                className="relative w-4 h-4 mr-[-1.00px]"
                alt={expandedFaq === 1 ? "Collapse" : "Expand"}
                src={
                  expandedFaq === 1 ? icons[0].src : icons[1].src
                }
              />
            </button>
          </div>

          <div className="flex-col items-start gap-2 flex-1 grow flex relative">
            <button
              className="flex items-center justify-between px-6 py-5 relative self-stretch w-full flex-[0_0_auto] bg-[#ffffff0a] rounded-2xl border border-solid cursor-pointer"
              onClick={() => toggleFaq(2)}
              aria-expanded={expandedFaq === 2}
              aria-controls="faq-answer-2"
            >
              <h2 className="relative w-fit mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-xl tracking-[0] leading-[23.2px] whitespace-nowrap">
                {faqData[2].question}
              </h2>

              <img
                className="relative w-4 h-4 mr-[-1.00px]"
                alt={expandedFaq === 2 ? "Collapse" : "Expand"}
                src={
                  expandedFaq === 2 ? icons[0].src : icons[1].src
                }
              />
            </button>

            <button
              className="flex items-center justify-between px-6 py-5 relative self-stretch w-full flex-[0_0_auto] bg-[#ffffff0a] rounded-2xl border border-solid cursor-pointer"
              onClick={() => toggleFaq(3)}
              aria-expanded={expandedFaq === 3}
              aria-controls="faq-answer-3"
            >
              <h2 className="relative w-fit mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-xl tracking-[0] leading-[23.2px] whitespace-nowrap">
                {faqData[3].question}
              </h2>

              <img
                className="relative w-4 h-4 mr-[-1.00px]"
                alt={expandedFaq === 3 ? "Collapse" : "Expand"}
                src={
                  expandedFaq === 3 ? icons[0].src : icons[1].src
                }
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
