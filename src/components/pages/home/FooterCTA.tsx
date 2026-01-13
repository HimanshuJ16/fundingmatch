export const FooterCTA = () => {
  const ctaButtons = [
    {
      id: "speak-to-us",
      text: "Speak to us",
      variant: "primary",
      ariaLabel: "Speak to us about your options",
    },
    {
      id: "apply-now",
      text: "Apply now",
      variant: "secondary",
      ariaLabel: "Apply now to get started",
    },
  ];

  return (
    <div className="relative w-full bg-[#182744] py-12 lg:py-20 px-4">
      <section
        className="flex flex-col lg:flex-row w-full max-w-[1224px] items-center justify-between p-8 lg:p-[52px] relative mx-auto rounded-[32px] border border-solid border-[#ffffff17] bg-[linear-gradient(-25deg,rgba(30,47,79,1)_30%,rgba(29,67,67,1)_100%)] gap-8 overflow-hidden"
        aria-labelledby="cta-heading"
      >
        <div className="flex flex-col w-full lg:max-w-xl items-start gap-4 p-2 relative z-10">
          <h2
            id="cta-heading"
            className="relative w-full [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-3xl md:text-[40px] tracking-tight leading-tight md:leading-[46.4px]"
          >
            Ready to see your best options?
          </h2>

          <p className="relative self-stretch [font-family:'Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-lg leading-relaxed">
            Start a free match — or speak to the team for guidance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto relative flex-[0_0_auto] z-10">
          {ctaButtons.map((button) => (
            <button
              key={button.id}
              type="button"
              aria-label={button.ariaLabel}
              className={
                button.variant === "primary"
                  ? "flex w-full sm:w-[170px] items-center justify-center gap-2.5 py-4 px-[23px] relative rounded-[29px] overflow-hidden bg-[linear-gradient(106deg,rgba(165,215,171,1)_0%,rgba(147,195,195,1)_100%)] hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#182744] cursor-pointer"
                  : "flex w-full sm:w-[170px] items-center justify-center gap-[3px] py-4 px-2.5 relative bg-[#ffffff0a] rounded-[51px] overflow-hidden border border-solid border-[#ffffff33] hover:bg-[#ffffff14] transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#182744] cursor-pointer"
              }
            >
              <span
                className={
                  button.variant === "primary"
                    ? "relative w-fit [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-[#121e36] text-[17px] tracking-[-0.34px] leading-[normal] whitespace-nowrap"
                    : "relative w-fit [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-[17px] tracking-[-0.34px] leading-[normal] whitespace-nowrap"
                }
              >
                {button.text}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
