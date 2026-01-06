import Link from "next/link";
import React from "react";

const Navbar = () => {
  const navigationLinks = [
    { label: "How it works", href: "#how-it-works" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="w-full bg-[#121e36] flex justify-center py-4">
      <div className="flex w-full max-w-[1224px] px-4 items-center justify-between relative">
        <a href="/" aria-label="Home">
          <img
            className="relative w-[137px] h-[51.61px]"
            alt="Funding Match AI Logo"
            src="https://c.animaapp.com/onoPc7cE/img/group-1@2x.png"
          />
        </a>

        <div className="inline-flex items-center gap-12 relative flex-[0_0_auto]">
          <nav
            className="inline-flex items-center gap-10 relative flex-[0_0_auto]"
            aria-label="Main navigation"
          >
            {navigationLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="relative w-fit mt-[-1.00px] [font-family:'Roobert-Regular',Helvetica] font-normal text-white text-[17px] tracking-[-0.34px] leading-[normal] whitespace-nowrap hover:opacity-80 transition-opacity"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            className="all-[unset] box-border inline-flex items-center gap-2.5 pt-3 pb-3.5 px-5 relative rounded-[29px] overflow-hidden bg-[linear-gradient(106deg,rgba(165,215,171,1)_0%,rgba(147,195,195,1)_100%)]"
            type="button"
            aria-label="Get started"
          >
            <div className="relative w-fit mt-[-1.00px] [font-family:'Roobert-Medium',Helvetica] font-medium text-[#121e36] text-[17px] tracking-[-0.34px] leading-[normal] whitespace-nowrap">
              Get started
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
