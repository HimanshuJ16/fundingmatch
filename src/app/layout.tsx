import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fundingmatch.ai"),
  title: "FundingMatchAI",
  description: "Grow your business with smart funding",
  openGraph: {
    title: "FundingMatchAI",
    description: "Grow your business with smart funding",
    images: [
      {
        url: "/assets/preview.jpeg",
        width: 1200,
        height: 630,
        alt: "FundingMatchAI Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FundingMatchAI",
    description: "Grow your business with smart funding",
    images: ["/assets/preview.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#182744]`}
        suppressHydrationWarning
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
