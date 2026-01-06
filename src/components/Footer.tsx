
export const Footer = () => {
  const socialIcons = [
    {
      src: "https://c.animaapp.com/WGyxBptO/img/social-icons.svg",
      alt: "Twitter",
      href: "#twitter",
    },
    {
      src: "https://c.animaapp.com/WGyxBptO/img/social-icons-1.svg",
      alt: "Facebook",
      href: "#facebook",
    },
    {
      src: "https://c.animaapp.com/WGyxBptO/img/instagram-1.svg",
      alt: "Instagram",
      href: "#instagram",
    },
    {
      src: "https://c.animaapp.com/WGyxBptO/img/vector-4.svg",
      alt: "LinkedIn",
      href: "#linkedin",
    },
  ];

  const companyLinks = [
    { label: "Solutions", href: "#solutions" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Reviews", href: "#reviews" },
    { label: "FAQ", href: "#faq" },
  ];

  const legalLinks = [
    { label: "Privacy policy", href: "#privacy-policy" },
    { label: "Cookie policy", href: "#cookie-policy" },
    { label: "Terms", href: "#terms" },
    { label: "Complaints", href: "#complaints" },
  ];

  return (
    <footer className="relative w-[1440px] h-[670px] bg-[#182744]">
      <div className="flex flex-col w-[1224px] h-[439px] items-start gap-[72px] relative top-[calc(50.00%_-_255px)] left-[calc(50.00%_-_612px)]">
        <div className="flex items-center gap-[162px] relative self-stretch w-full flex-[0_0_auto] mb-[-3.63px]">
          <div className="flex flex-col w-[1224px] items-start gap-8 relative">
            <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
              <img
                className="relative w-[222px] h-[83.63px]"
                alt="FundingMatch.ai Logo"
                src="https://c.animaapp.com/WGyxBptO/img/group-1-1@2x.png"
              />

              <div className="flex flex-col items-start gap-6 relative self-stretch w-full flex-[0_0_auto]">
                <p className="relative w-[962px] mt-[-1.00px] [font-family:'Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-lg tracking-[0] leading-[28.8px]">
                  FundingMatch.ai is not a lender. We operate as a business
                  funding introduction and matching platform. We introduce
                  businesses to a panel of third-party lenders and finance
                  providers, including FCA-authorised and regulated lenders
                  where applicable. All funding is subject to status,
                  eligibility, affordability checks and the lender&apos;s terms.
                  FundingMatch.ai does not provide advice or make lending
                  decisions.
                </p>

                <div className="flex items-start justify-between relative self-stretch w-full flex-[0_0_auto]">
                  <div className="inline-flex flex-col items-start gap-4 relative flex-[0_0_auto]">
                    <address className="inline-flex flex-col items-start gap-2 relative flex-[0_0_auto] not-italic">
                      <p className="relative w-[521px] mt-[-1.00px] [font-family:'Roobert-Medium',Helvetica] font-normal text-[#ffffffcc] text-lg tracking-[0] leading-[28.8px]">
                        <span className="font-medium">
                          EFG Group Ltd
                          <br />
                        </span>

                        <span className="[font-family:'Roobert-Regular',Helvetica]">
                          Ground Floor, 5 North Court, Armstrong Road,
                          Maidstone, Kent, ME15 6JZ
                        </span>
                      </p>

                      <p className="relative w-[521px] [font-family:'Roobert-Regular',Helvetica] font-normal text-transparent text-lg tracking-[0] leading-[28.8px]">
                        <span className="text-[#ffffffcc]">Email: </span>

                        <a
                          href="mailto:hello@fundingmatch.ai"
                          className="text-white hover:underline"
                        >
                          hello@fundingmatch.ai
                        </a>
                      </p>

                      <p className="relative w-[521px] [font-family:'Roobert-Regular',Helvetica] font-normal text-transparent text-lg tracking-[0] leading-[28.8px]">
                        <span className="text-[#ffffffcc]">Phone: </span>

                        <a
                          href="tel:01622000000"
                          className="text-white hover:underline"
                        >
                          01622 000000
                        </a>
                      </p>
                    </address>

                    <nav
                      className="inline-flex items-center justify-center gap-8 relative flex-[0_0_auto]"
                      aria-label="Social media links"
                    >
                      {socialIcons.map((icon, index) => (
                        <a
                          key={index}
                          href={icon.href}
                          aria-label={icon.alt}
                          className="hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={icon.src}
                            alt={icon.alt}
                            className="relative w-6 h-6"
                          />
                        </a>
                      ))}
                    </nav>
                  </div>

                  <div className="inline-flex items-center gap-[60px] relative flex-[0_0_auto]">
                    <nav
                      className="flex flex-col w-32 items-start gap-4 relative"
                      aria-label="Company links"
                    >
                      <h2 className="relative w-fit mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-xl tracking-[0] leading-[23.2px] whitespace-nowrap">
                        Company
                      </h2>

                      <ul className="flex flex-col w-[108px] items-start gap-4 relative flex-[0_0_auto] opacity-60 list-none p-0 m-0">
                        {companyLinks.map((link, index) => (
                          <li key={index} className="self-stretch">
                            <a
                              href={link.href}
                              className="block mt-[-1.00px] [font-family:'Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-lg tracking-[0] leading-[28.8px] hover:text-white transition-colors"
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>

                    <nav
                      className="flex flex-col w-32 items-start gap-4 relative"
                      aria-label="Legal links"
                    >
                      <h2 className="relative w-fit mt-[-1.00px] [font-family:'Roobert-SemiBold',Helvetica] font-semibold text-white text-xl tracking-[0] leading-[23.2px] whitespace-nowrap">
                        Legal
                      </h2>

                      <ul className="flex flex-col w-[108px] items-start gap-4 relative flex-[0_0_auto] opacity-60 list-none p-0 m-0">
                        {legalLinks.map((link, index) => (
                          <li
                            key={index}
                            className={
                              index < 2
                                ? "w-fit mr-[-1.00px] whitespace-nowrap"
                                : "self-stretch"
                            }
                          >
                            <a
                              href={link.href}
                              className={`block ${index === 0 ? "mt-[-1.00px]" : ""} [font-family:'Roobert-Regular',Helvetica] font-normal text-[#ffffffcc] text-lg tracking-[0] leading-[28.8px] hover:text-white transition-colors`}
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 px-0 py-6 relative self-stretch w-full flex-[0_0_auto] mb-[-150.63px] border-t [border-top-style:solid] border-[#f8f4f133]">
          <div className="flex items-center gap-6 relative self-stretch w-full flex-[0_0_auto]">
            <p className="relative flex-1 mt-[-1.00px] opacity-50 font-body-16px-regular font-[number:var(--body-16px-regular-font-weight)] text-neutralneutral-02 text-[length:var(--body-16px-regular-font-size)] tracking-[var(--body-16px-regular-letter-spacing)] leading-[var(--body-16px-regular-line-height)] [font-style:var(--body-16px-regular-font-style)]">
              © FundingMatch.ai. All rights reserved.
            </p>

            <p className="relative flex-1 mt-[-1.00px] opacity-50 font-body-16px-regular font-[number:var(--body-16px-regular-font-weight)] text-neutralneutral-02 text-[length:var(--body-16px-regular-font-size)] tracking-[var(--body-16px-regular-letter-spacing)] leading-[var(--body-16px-regular-line-height)] [font-style:var(--body-16px-regular-font-style)]">
              Funding is subject to status, affordability and lender criteria.
              Terms &amp; rates vary.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
