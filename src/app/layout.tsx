import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CareerSignal AI | Free ATS Resume Checker & Tech Job Matcher",
    template: "%s | CareerSignal AI"
  },
  description: "Optimize your tech resume for applicant tracking systems (ATS). Get an instant, AI-powered fit score, gap analysis, and tailored bullet-point recommendations for software engineers, product managers, designers, and data scientists.",
  keywords: [
    "ATS Resume Checker", "ATS Resume Scanner", "Free Resume Scanner",
    "Resume Keyword Matcher", "Resume Score", "Job Description Matcher",
    "Resume Fit Score", "Tech Resume Optimizer", "Software Engineer Resume Checker",
    "Product Manager Resume Grader", "Resume Gap Analysis", "Quantify Resume Impact",
    "Tech Job Matching", "FAANG Resume Optimizer", "System Design Resume Score"
  ],
  authors: [{ name: "CareerSignal AI" }],
  creator: "CareerSignal AI",
  metadataBase: new URL("https://career-signal-ten.vercel.app"),
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "CareerSignal AI | Free ATS Resume Checker & Tech Job Matcher",
    description: "Get an instant, AI-powered fit score, gap analysis, and tailored bullet-point recommendations for tech roles.",
    url: "https://career-signal-ten.vercel.app",
    siteName: "CareerSignal AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerSignal AI | Free ATS Resume Checker & Tech Job Matcher",
    description: "Optimize your tech resume for applicant tracking systems. Get an instant AI score, gap analysis, and tailored recommendations.",
  },
  robots: {
    index: true,
    follow: true,
  }
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
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
