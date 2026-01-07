"use client";

import Link from "next/link";
import React from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigationLinks = [
    { label: "How it works", href: "#how-it-works" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="w-full bg-[#121e36] flex justify-center py-4 relative z-50">
      <div className="flex w-full max-w-7xl px-4 items-center justify-between relative">
        <a href="/" aria-label="Home" className="shrink-0">
          <img
            className="w-[120px] md:w-[137px] h-auto object-contain"
            alt="Funding Match AI Logo"
            src="assets/logo.png"
          />
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:inline-flex items-center gap-12 relative flex-[0_0_auto]">
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
            className="all-[unset] box-border inline-flex items-center gap-2.5 pt-3 pb-3.5 px-5 relative rounded-[29px] overflow-hidden bg-[linear-gradient(106deg,rgba(165,215,171,1)_0%,rgba(147,195,195,1)_100%)] hover:opacity-90 cursor-pointer transition-opacity"
            type="button"
            aria-label="Get started"
          >
            <div className="relative w-fit mt-[-1.00px] [font-family:'Roobert-Medium',Helvetica] font-medium text-[#121e36] text-[17px] tracking-[-0.34px] leading-[normal] whitespace-nowrap">
              Get started
            </div>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 18 18" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#121e36] px-4 py-6 flex flex-col gap-6 md:hidden shadow-xl border-t border-gray-800">
          <nav className="flex flex-col gap-4">
            {navigationLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-white text-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <button
            className="box-border inline-flex items-center justify-center gap-2.5 pt-3 pb-3.5 px-5 rounded-[29px] bg-[linear-gradient(106deg,rgba(165,215,171,1)_0%,rgba(147,195,195,1)_100%)] w-full"
            type="button"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="text-[#121e36] text-[17px] font-medium">
              Get started
            </div>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
