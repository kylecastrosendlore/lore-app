import type { Metadata } from "next";
import { Cormorant_Garamond, Space_Mono, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LORE | Intelligence Briefs That Replace Cold Emails",
  description:
    "Stop sending cold emails that die in the inbox. LORE creates cinematic, data-driven intelligence briefs that make prospects pay attention.",
  openGraph: {
    title: "LORE | Intelligence Briefs That Replace Cold Emails",
    description:
      "Stop sending cold emails that die in the inbox. LORE creates cinematic, data-driven intelligence briefs that make prospects pay attention.",
    url: "https://sendlore.com",
    siteName: "LORE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LORE | Intelligence Briefs That Replace Cold Emails",
    description:
      "Stop sending cold emails that die in the inbox. LORE creates cinematic, data-driven intelligence briefs that make prospects pay attention.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${spaceMono.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0d0b17] text-[#e8e4f4]">
        {children}
      </body>
    </html>
  );
}
