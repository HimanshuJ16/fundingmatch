export const QuickMatchFormSection = () => {
  return (    
    <div className="flex flex-col w-[510px] items-center gap-6 p-8 relative rounded-[32px] border-[none] bg-[linear-gradient(325deg,rgba(40,60,100,1)_60%,rgba(59,124,126,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[32px] before:[background:linear-gradient(142deg,rgba(40,60,100,1)_60%,rgba(59,124,126,1)_100%) before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
      <div className="flex flex-col items-start gap-8 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col w-[237px] items-start gap-5 relative flex-[0_0_auto]">
          <div className="flex items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative w-3.5 h-3.5 bg-[#b0efbd] rounded-[39px]" />

            <div className="relative w-[557px] mt-[-0.50px] mr-[-342.00px] [font-family:'Roobert-Regular',Helvetica] font-normal text-white text-lg tracking-[0] leading-[28.8px]">
              Quick match form
            </div>
          </div>

          <div className="flex items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
            <div className="inline-flex items-center gap-[3px] p-2.5 relative flex-[0_0_auto] bg-[#ffffff0a] rounded-[35px] border border-solid border-[#ffffff33]">
              <div className="relative w-4 h-4 aspect-[1]">
                <img
                  className="absolute w-[83.33%] h-[83.33%] top-[8.33%] left-[8.33%]"
                  alt="Vector"
                  src="https://c.animaapp.com/onoPc7cE/img/iconamoon-clock-fill.svg"
                />
              </div>

              <div className="relative w-fit [font-family:'Roobert-Regular',Helvetica] font-normal text-white text-base tracking-[-0.32px] leading-[25.6px] whitespace-nowrap">
                5 minutes
              </div>
            </div>

            <div className="inline-flex items-center gap-[3px] p-2.5 relative flex-[0_0_auto] bg-[#ffffff0a] rounded-[35px] border border-solid border-[#ffffff33]">
              <div className="relative w-4 h-4 aspect-[1]">
                <div className="relative w-[82.94%] h-[90.89%] top-[8.33%] left-[8.73%]">
                  <img
                    className="absolute w-full h-[91.25%] top-0 left-0"
                    alt="Vector"
                    src="https://c.animaapp.com/onoPc7cE/img/mingcute-ai-fill.svg"
                  />
                </div>
              </div>

              <div className="relative w-fit [font-family:'Roobert-Regular',Helvetica] font-normal text-white text-base tracking-[-0.32px] leading-[25.6px] whitespace-nowrap">
                  AI-powered
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
            <p className="relative self-stretch mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-2xl tracking-[0] leading-[27.8px]">
              What type of business do you have?
            </p>

            <p className="relative self-stretch [font-family:'Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-base tracking-[0] leading-[25.6px]">
              We only use soft checks - no impact on your credit score.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex items-center justify-center gap-[3px] px-2.5 py-[22px] relative self-stretch w-full flex-[0_0_auto] bg-[#ffffff0a] rounded-xl overflow-hidden border border-solid border-[#ffffff33]">
            <div className="relative w-fit mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-[17px] tracking-[-0.34px] leading-[normal] whitespace-nowrap">
              Limited Company
            </div>
          </div>

          <div className="flex items-center justify-center gap-[3px] px-2.5 py-[22px] relative self-stretch w-full flex-[0_0_auto] bg-[#ffffff0a] rounded-xl overflow-hidden border border-solid border-[#ffffff33]">
            <div className="relative w-fit mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-[17px] tracking-[-0.34px] leading-[normal] whitespace-nowrap">
              Sole Trader
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="relative self-stretch w-full h-2 bg-[#ffffff1f] rounded-[25px] overflow-hidden">
            <div className="w-[94px] h-2 bg-[#b0efbd]" />
          </div>

          <div className="relative self-stretch [font-family:'Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-base text-center tracking-[0] leading-[25.6px]">
            Step 1 of 8
          </div>
        </div>

        <button className="all-[unset] box-border flex w-[182px] items-center justify-center gap-2.5 pt-4 pb-[18px] px-[23px] relative flex-[0_0_auto] rounded-[29px] overflow-hidden bg-[linear-gradient(106deg,rgba(165,215,171,1)_0%,rgba(147,195,195,1)_100%)]">
          <div className="relative w-fit mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-[#121e36] text-[17px] tracking-[-0.34px] leading-[normal] whitespace-nowrap">
            Get started
          </div>
        </button>
      </div>          
  );
};
