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
    <div className="relative w-full h-[356px] bg-[#182744]">
      <section
        className="flex w-full max-w-[1224px] h-64 items-center justify-between p-[52px] relative top-[50px] mx-auto rounded-3xl border border-solid border-[#ffffff17] bg-[linear-gradient(-25deg,rgba(30,47,79,1)_30%,rgba(29,67,67,1)_100%)]"
        aria-labelledby="cta-heading"
      >
        <div className="flex flex-col w-[552px] items-start gap-2 relative">
          <h2
            id="cta-heading"
            className="relative w-[487px] mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-[40px] tracking-[0] leading-[46.4px]"
          >
            Ready to see your best options?
          </h2>

          <p className="relative self-stretch [font-family:'Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-lg tracking-[0] leading-[28.8px]">
            Start a free match - or speak to the team for guidance.
          </p>
        </div>

        <div className="inline-flex items-start gap-2 relative flex-[0_0_auto]">
          {ctaButtons.map((button) => (
            <button
              key={button.id}
              type="button"
              aria-label={button.ariaLabel}
              className={
                button.variant === "primary"
                  ? "flex w-[170px] items-center justify-center gap-2.5 pt-4 pb-[18px] px-[23px] relative rounded-[29px] overflow-hidden bg-[linear-gradient(106deg,rgba(165,215,171,1)_0%,rgba(147,195,195,1)_100%)] hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#182744]"
                  : "flex w-[170px] h-[54px] items-center justify-center gap-[3px] px-2.5 py-[22px] relative bg-[#ffffff0a] rounded-[51px] overflow-hidden border border-solid border-[#ffffff33] hover:bg-[#ffffff14] transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#182744]"
              }
            >
              <span
                className={
                  button.variant === "primary"
                    ? "relative w-fit mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-[#121e36] text-[17px] tracking-[-0.34px] leading-[normal] whitespace-nowrap"
                    : "relative w-fit mt-[-6.00px] mb-[-4.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-[17px] tracking-[-0.34px] leading-[normal] whitespace-nowrap"
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
