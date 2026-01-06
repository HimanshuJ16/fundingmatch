export const HowItWorksDetailsSection = () => {
  const featureTags = [
    { id: 1, label: "AI match score" },
    { id: 2, label: "Live lender pool" },
    { id: 3, label: "Offer comparison" },
  ];

  const processSteps = [
    { id: 1, label: "Application", arrow: "https://c.animaapp.com/WGyxBptO/img/arrow-3.svg" },
    { id: 2, label: "AI Match", arrow: "https://c.animaapp.com/WGyxBptO/img/arrow-3.svg" },
    { id: 3, label: "Lenders", arrow: "https://c.animaapp.com/WGyxBptO/img/arrow-3.svg" },
    { id: 4, label: "Offers", arrow: null },
  ];

  const statistics = [
    { value: "2–10", description: "Matched offers to compare" },
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
    <section className="flex items-center gap-6 relative self-stretch w-full flex-[0_0_auto]">
      <div className="flex flex-col w-[600px] h-[550px] items-center justify-between p-8 relative rounded-3xl border border-solid border-[#ffffff17] bg-[linear-gradient(325deg,rgba(30,47,79,1)_0%,rgba(29,67,67,1)_100%)]">
        <div className="flex items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
          {featureTags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-center gap-[3px] px-5 py-[18px] relative flex-1 grow bg-[#ffffff0a] rounded-[35px] border border-solid border-[#ffffff33]"
            >
              <div className="relative w-fit mt-[-1.00px] [font-family:'Roobert-Regular',Helvetica] font-normal text-white text-base tracking-[-0.32px] leading-[25.6px] whitespace-nowrap">
                {tag.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-1 relative self-stretch w-full flex-[0_0_auto]">
          {processSteps.map((step, index) => (
            <>
              <div
                key={step.id}
                className="flex items-center justify-center gap-[3px] px-5 py-[33px] relative flex-1 grow bg-[#cfd296cf] rounded-[69px] border border-dashed border-[#9da25a]"
              >
                <div className="relative w-fit mt-[-1.00px] ml-[-8.62px] mr-[-8.62px] [font-family:'Roobert-Regular',Helvetica] font-normal text-[#191d05] text-base tracking-[-0.32px] leading-[25.6px] whitespace-nowrap">
                  {step.label}
                </div>
              </div>
              {step.arrow && (
                <img
                  key={`arrow-${step.id}`}
                  className="relative w-[35.5px] h-[7.36px] object-cover"
                  alt="Arrow"
                  src={step.arrow}
                />
              )}
            </>
          ))}
        </div>

        <div className="flex items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
          {statistics.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-start gap-5 px-7 py-[22px] relative flex-1 grow bg-[#ffffff0a] rounded-2xl overflow-hidden border border-solid border-[#ffffff33]"
            >
              <div className="relative w-fit mt-[-1.00px] [font-family:'Roobert-Bold',Helvetica] font-bold text-white text-4xl tracking-[-0.72px] leading-[normal] whitespace-nowrap">
                {stat.value}
              </div>

              <div className="relative self-stretch [font-family:'Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-xl tracking-[0] leading-[32.0px]">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col w-[600px] items-start gap-[5px] relative self-stretch">
        {steps.map((step) => (
          <article
            key={step.number}
            className="flex flex-col items-start justify-center gap-6 px-8 py-6 relative flex-1 self-stretch w-full grow rounded-3xl border border-solid border-[#ffffff17] bg-[linear-gradient(325deg,rgba(30,47,79,1)_0%,rgba(29,67,67,1)_100%)]"
          >
            <div className="flex items-start gap-3 relative self-stretch w-full flex-[0_0_auto]">
              <div className="relative w-7 h-7 bg-[#b0efbd] rounded-[39px] overflow-hidden">
                <div className="absolute top-[calc(50.00%_-_13px)] left-[calc(50.00%_-_5px)] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-[#121e36] text-base text-center tracking-[0] leading-[25.6px] whitespace-nowrap">
                  {step.number}
                </div>
              </div>

              <div className="flex flex-col items-start gap-2 relative flex-1 grow">
                <h3 className="relative self-stretch mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-2xl tracking-[0] leading-[27.8px]">
                  {step.title}
                </h3>

                <p className="relative self-stretch [font-family:'Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-lg tracking-[0] leading-[28.8px]">
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
