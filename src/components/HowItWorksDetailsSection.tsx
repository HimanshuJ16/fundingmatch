import React from "react";

export const HowItWorksDetailsSection = () => {
  const featureTags = [
    { id: 1, label: "AI match score" },
    { id: 2, label: "Live lender pool" },
    { id: 3, label: "Offer comparison" },
  ];

  const processSteps = [
    {
      id: 1,
      label: "Application",
      arrow: "https://c.animaapp.com/WGyxBptO/img/arrow-3.svg",
    },
    {
      id: 2,
      label: "AI Match",
      arrow: "https://c.animaapp.com/WGyxBptO/img/arrow-3.svg",
    },
    {
      id: 3,
      label: "Lenders",
      arrow: "https://c.animaapp.com/WGyxBptO/img/arrow-3.svg",
    },
    { id: 4, label: "Offers", arrow: null },
  ];

  const statistics = [
    { value: "2-10", description: "Matched offers to compare" },
    { value: "24 hr", description: "Typical decision speed" },
  ];

  const steps = [
    {
      number: "1",
      title: "Fill in a short form",
      description: "Answer a few quick questions about your business.",
    },
    {
      number: "2",
      title: "Upload your business statements",
      description: "Securely upload statements to support your application.",
    },
    {
      number: "3",
      title: "AI matching to lenders",
      description: "Our AI matches you with lenders most likely to approve.",
    },
    {
      number: "4",
      title: "Choose your preferred offer",
      description: "Compare offers and select the one that suits you.",
    },
  ];

  return (
    <section className="flex flex-col lg:grid lg:grid-cols-2 gap-6 w-full max-w-7xl mx-auto px-4">
      {/* Visual Flow Card */}
      <div className="flex flex-col w-full min-h-[550px] items-center justify-between p-6 md:p-7 relative rounded-[32px] border border-solid border-[#ffffff17] bg-[linear-gradient(-20deg,rgba(30,47,79,1)_65%,rgba(29,67,67,1)_100%)] overflow-hidden">
        {/* Feature Tags */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full mb-8">
          {featureTags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-center px-4 py-3 bg-[#ffffff0a] rounded-[35px] border border-solid border-[#ffffff33] backdrop-blur-sm"
            >
              <span className="text-white text-sm md:text-base font-normal font-['Roobert-Regular'] whitespace-nowrap">
                {tag.label}
              </span>
            </div>
          ))}
        </div>

        {/* Process Flow Diagram - Mobile (2x2 Grid) */}
        <div className="flex flex-col gap-6 w-full max-w-[320px] mx-auto mb-8 lg:hidden">
          <div className="flex items-center justify-between w-full">
            {/* Row 1 */}
            <div className="flex items-center justify-center w-[110px] h-[80px] sm:w-[130px] sm:h-[90px] bg-[#cfd296cf] rounded-[40px] border border-dashed border-[#9da25a] text-[#191d05] font-['Roobert-Regular'] text-sm sm:text-base">
              Application
            </div>

            <img
              src="https://c.animaapp.com/WGyxBptO/img/arrow-3.svg"
              alt="Arrow"
              className="w-6 sm:w-8 h-auto object-contain"
            />

            <div className="flex items-center justify-center w-[110px] h-[80px] sm:w-[130px] sm:h-[90px] bg-[#cfd296cf] rounded-[40px] border border-dashed border-[#9da25a] text-[#191d05] font-['Roobert-Regular'] text-sm sm:text-base">
              AI Match
            </div>
          </div>

          <div className="flex items-center justify-between w-full">
            {/* Row 2 */}
            <div className="flex items-center justify-center w-[110px] h-[80px] sm:w-[130px] sm:h-[90px] bg-[#cfd296cf] rounded-[40px] border border-dashed border-[#9da25a] text-[#191d05] font-['Roobert-Regular'] text-sm sm:text-base">
              Lenders
            </div>

            <img
              src="https://c.animaapp.com/WGyxBptO/img/arrow-3.svg"
              alt="Arrow"
              className="w-6 sm:w-8 h-auto object-contain"
            />

            <div className="flex items-center justify-center w-[110px] h-[80px] sm:w-[130px] sm:h-[90px] bg-[#cfd296cf] rounded-[40px] border border-dashed border-[#9da25a] text-[#191d05] font-['Roobert-Regular'] text-sm sm:text-base">
              Offers
            </div>
          </div>
        </div>

        {/* Process Flow Diagram - Desktop (Linear) */}
        <div className="hidden lg:flex items-center justify-center gap-2 w-full mt-25">
          {processSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center justify-center w-[160px] h-[80px] bg-[#cfd296cf] rounded-[40px] border border-dashed border-[#9da25a]">
                <span className="text-[#191d05] font-['Roobert-Regular'] text-base text-center">
                  {step.label}
                </span>
              </div>
              {step.arrow && (
                <img
                  className="w-8 h-auto object-contain"
                  alt="Arrow"
                  src={step.arrow}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 w-full mt-auto">
          {statistics.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-start gap-2 px-6 py-5 bg-[#ffffff0a] rounded-2xl border border-solid border-[#ffffff33] hover:bg-[#ffffff1a] transition-colors"
            >
              <div className="text-white text-3xl md:text-4xl font-bold font-['Roobert-Regular']">
                {stat.value}
              </div>
              <div className="text-[#ffffffcc] text-base md:text-lg font-normal font-['Roobert-Regular'] leading-tight">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Steps List */}
      <div className="flex flex-col gap-5 w-full h-full">
        {steps.map((step) => (
          <article
            key={step.number}
            className="flex flex-col justify-center p-4 md:p-6 rounded-[32px] border border-solid border-[#ffffff17] bg-[linear-gradient(-20deg,rgba(30,47,79,1)_65%,rgba(29,67,67,1)_100%)] flex-1 min-h-[100px] hover:border-[#ffffff33] transition-colors"
          >
            <div className="flex items-start gap-4 w-full">
              <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 bg-[#b0efbd] rounded-full flex items-center justify-center mt-1">
                <span className="text-[#121e36] text-base md:text-lg font-semibold font-['Roobert-SemiBold']">
                  {step.number}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-white text-xl md:text-2xl font-semibold font-['Roobert-SemiBold']">
                  {step.title}
                </h3>
                <p className="text-[#ffffffcc] text-base md:text-lg font-normal font-['Roobert-Regular'] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
