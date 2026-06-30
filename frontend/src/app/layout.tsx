import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Match the mobile browser chrome to the dark page background.
export const viewport: Viewport = {
  themeColor: "#0D0D1A",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://posit-hangout-ai.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "AI in Data Science — Posit Hangout",
  description: "How data science practitioners talked about AI over four years of the Posit Data Science Hangout. 1,039 matched sentences across 224 episodes.",
  openGraph: {
    title: "AI in Data Science — Posit Hangout",
    description: "Four years of the Posit Data Science Hangout — how practitioners talked about AI. 1,039 mentions across 224 episodes.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI in Data Science — Posit Hangout",
    description: "Four years of the Posit Data Science Hangout — how practitioners talked about AI. 1,039 mentions across 224 episodes.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
