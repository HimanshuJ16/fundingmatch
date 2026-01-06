export const CallToActionSection = () => {
  const buttons = [
    {
      id: 1,
      text: "Start a free match",
      variant: "primary",
      ariaLabel: "Start a free match",
    },
    {
      id: 2,
      text: "Questions?",
      variant: "secondary",
      ariaLabel: "Ask questions",
    },
  ];

  return (
    <nav
      className="inline-flex items-start gap-2 relative flex-[0_0_auto]"
      role="navigation"
      aria-label="Call to action"
    >
      <button
        type="button"
        className="w-[212px] items-center justify-center gap-2.5 pt-4 pb-[18px] px-[23px] rounded-[29px] bg-[linear-gradient(106deg,rgba(165,215,171,1)_0%,rgba(147,195,195,1)_100%)] flex relative overflow-hidden transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a5d7ab]"
        aria-label={buttons[0].ariaLabel}
      >
        <span className="relative w-fit mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-[#121e36] text-[17px] tracking-[-0.34px] leading-[normal] whitespace-nowrap">
          {buttons[0].text}
        </span>
      </button>

      <button
        type="button"
        className="w-[212px] h-[54px] items-center justify-center gap-[3px] px-2.5 py-[22px] bg-[#ffffff0a] rounded-[51px] border border-solid border-[#ffffff33] flex relative overflow-hidden transition-all hover:bg-[#ffffff14] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
        aria-label={buttons[1].ariaLabel}
      >
        <span className="relative w-fit mt-[-6.00px] mb-[-4.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-[17px] tracking-[-0.34px] leading-[normal] whitespace-nowrap">
          {buttons[1].text}
        </span>
      </button>
    </nav>
  );
};
