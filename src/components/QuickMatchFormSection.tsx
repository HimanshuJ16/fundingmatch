export const QuickMatchFormSection = () => {
  return (
    <div className="flex flex-col w-full max-w-md lg:max-w-[510px] items-center gap-6 p-6 md:p-8 relative rounded-[32px] border-[none] bg-[linear-gradient(325deg,rgba(40,60,100,1)_60%,rgba(59,124,126,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[32px] before:[background:linear-gradient(142deg,rgba(40,60,100,1)_60%,rgba(59,124,126,1)_100%) before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none shadow-2xl">
      <div className="flex flex-col items-start gap-6 md:gap-8 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col w-full items-start gap-5 relative flex-[0_0_auto]">
          <div className="flex items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative w-3.5 h-3.5 bg-[#b0efbd] rounded-full shrink-0" />

            <div className="relative flex-1 [font-family:'Roobert-Regular',Helvetica] font-normal text-white text-lg leading-[28.8px]">
              Quick match form
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
            <div className="inline-flex items-center gap-[3px] p-2.5 relative flex-[0_0_auto] bg-[#ffffff0a] rounded-[35px] border border-solid border-[#ffffff33]">
              <div className="relative w-4 h-4 shrink-0">
                <img
                  className="w-full h-full object-contain"
                  alt="Clock Icon"
                  src="https://c.animaapp.com/onoPc7cE/img/iconamoon-clock-fill.svg"
                />
              </div>

              <div className="relative w-fit [font-family:'Roobert-Regular',Helvetica] font-normal text-white text-sm md:text-base tracking-[-0.32px] leading-snug whitespace-nowrap">
                5 minutes
              </div>
            </div>

            <div className="inline-flex items-center gap-[3px] p-2.5 relative flex-[0_0_auto] bg-[#ffffff0a] rounded-[35px] border border-solid border-[#ffffff33]">
              <div className="relative w-4 h-4 shrink-0">
                <div className="w-full h-full relative">
                  <img
                    className="absolute inset-0 w-full h-full object-contain"
                    alt="AI Icon"
                    src="https://c.animaapp.com/onoPc7cE/img/mingcute-ai-fill.svg"
                  />
                </div>
              </div>

              <div className="relative w-fit [font-family:'Roobert-Regular',Helvetica] font-normal text-white text-sm md:text-base tracking-[-0.32px] leading-snug whitespace-nowrap">
                AI-powered
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
          <p className="relative self-stretch mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-xl md:text-2xl tracking-[0] leading-snug">
            What type of business do you have?
          </p>

          <p className="relative self-stretch [font-family:'Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-sm md:text-md md:text-base tracking-[0] leading-snug">
            We only use soft checks - no impact on your credit score.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 relative self-stretch w-full flex-[0_0_auto]">
        <button className="flex items-center justify-center gap-[3px] px-2.5 py-4 md:py-[22px] relative self-stretch w-full bg-[#ffffff0a] rounded-xl overflow-hidden border border-solid border-[#ffffff33] hover:bg-[#ffffff1a] transition-colors cursor-pointer">
          <div className="relative w-fit mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-base md:text-[17px] tracking-[-0.34px] leading-[normal] whitespace-nowrap">
            Limited Company
          </div>
        </button>

        <button className="flex items-center justify-center gap-[3px] px-2.5 py-4 md:py-[22px] relative self-stretch w-full bg-[#ffffff0a] rounded-xl overflow-hidden border border-solid border-[#ffffff33] hover:bg-[#ffffff1a] transition-colors cursor-pointer">
          <div className="relative w-fit mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-base md:text-[17px] tracking-[-0.34px] leading-[normal] whitespace-nowrap">
            Sole Trader
          </div>
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
        <div className="relative self-stretch w-full h-2 bg-[#ffffff1f] rounded-[25px] overflow-hidden">
          <div className="w-[12%] h-2 bg-[#b0efbd]" />
        </div>

        <div className="relative self-stretch [font-family:'Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-sm md:text-base text-center tracking-[0] leading-snug">
          Step 1 of 8
        </div>
      </div>

      <button className="all-[unset] box-border flex w-full sm:w-[182px] items-center justify-center gap-2.5 pt-4 pb-[18px] px-[23px] relative flex-[0_0_auto] rounded-[29px] overflow-hidden bg-[linear-gradient(106deg,rgba(165,215,171,1)_0%,rgba(147,195,195,1)_100%)] hover:opacity-90 cursor-pointer transition-opacity">
        <div className="relative w-fit mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-[#121e36] text-[17px] tracking-[-0.34px] leading-[normal] whitespace-nowrap">
          Get started
        </div>
      </button>
    </div>
  );
};
