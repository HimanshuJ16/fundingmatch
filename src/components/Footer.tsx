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
    <footer className="w-full bg-[#182744] text-white py-12 lg:py-16">
      <div className="container mx-auto px-4 max-w-[1224px] flex flex-col gap-12 relative">
        {/* Top Section: Logo & Description */}
        <div className="flex flex-col items-start gap-8">
          <img
            className="w-[180px] md:w-[222px] h-auto"
            alt="FundingMatch.ai Logo"
            src="https://c.animaapp.com/WGyxBptO/img/group-1-1@2x.png"
          />
          <p className="max-w-[962px] text-[#ffffffcc] text-base md:text-lg leading-relaxed [font-family:'Roobert-Regular',Helvetica]">
            FundingMatch.ai is not a lender. We operate as a business funding
            introduction and matching platform. We introduce businesses to a
            panel of third-party lenders and finance providers, including
            FCA-authorised and regulated lenders where applicable. All funding
            is subject to status, eligibility, affordability checks and the
            lender&apos;s terms. FundingMatch.ai does not provide advice or make
            lending decisions.
          </p>
        </div>

        {/* Middle Section: Contact & Links */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-20">
          {/* Contact Details & Socials */}
          <div className="flex flex-col items-start gap-8">
            <address className="not-italic flex flex-col items-start gap-6 text-[#ffffffcc]">
              <div className="text-base md:text-lg leading-relaxed [font-family:'Roobert-Regular',Helvetica]">
                <span className="block font-medium text-white mb-2 [font-family:'Roobert-Medium',Helvetica]">
                  EFG Group Ltd
                </span>
                <span>
                  Ground Floor, 5 North Court, Armstrong Road,
                  <br />
                  Maidstone, Kent, ME15 6JZ
                </span>
              </div>

              <div className="flex flex-col gap-2 text-base md:text-lg [font-family:'Roobert-Regular',Helvetica]">
                <p>
                  <span className="text-[#ffffffcc]">Email: </span>
                  <a
                    href="mailto:hello@fundingmatch.ai"
                    className="text-white hover:underline transition-colors"
                  >
                    hello@fundingmatch.ai
                  </a>
                </p>
                <p>
                  <span className="text-[#ffffffcc]">Phone: </span>
                  <a
                    href="tel:01622000000"
                    className="text-white hover:underline transition-colors"
                  >
                    01622 000000
                  </a>
                </p>
              </div>
            </address>

            <nav
              className="flex items-center gap-6"
              aria-label="Social media links"
            >
              {socialIcons.map((icon, index) => (
                <a
                  key={index}
                  href={icon.href}
                  aria-label={icon.alt}
                  className="hover:opacity-80 transition-opacity"
                >
                  <img src={icon.src} alt={icon.alt} className="w-6 h-6" />
                </a>
              ))}
            </nav>
          </div>

          {/* Links Section */}
          <div className="flex gap-12 md:gap-24 w-full lg:w-auto">
            <nav
              className="flex flex-col items-start gap-4"
              aria-label="Company links"
            >
              <h2 className="text-xl font-semibold text-white [font-family:'Roobert-SemiBold',Helvetica]">
                Company
              </h2>
              <ul className="flex flex-col gap-3 opacity-60">
                {companyLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-lg text-[#ffffffcc] hover:text-white transition-colors [font-family:'Roobert-Regular',Helvetica]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav
              className="flex flex-col items-start gap-4"
              aria-label="Legal links"
            >
              <h2 className="text-xl font-semibold text-white [font-family:'Roobert-SemiBold',Helvetica]">
                Legal
              </h2>
              <ul className="flex flex-col gap-3 opacity-60">
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-lg text-[#ffffffcc] hover:text-white transition-colors [font-family:'Roobert-Regular',Helvetica]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="pt-8 border-t border-[#f8f4f133] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[#ffffffcc] text-sm md:text-base opacity-50 [font-family:'Roobert-Regular',Helvetica]">
          <p>© FundingMatch.ai. All rights reserved.</p>
          <p className="md:text-right">
            Funding is subject to status, affordability and lender criteria.
            Terms &amp; rates vary.
          </p>
        </div>
      </div>
    </footer>
  );
};
