import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://financial-doc-explainer.vercel.app"),
  title: "Financial Doc Explainer",
  description:
    "Upload a loan agreement, credit card statement, or benefit notice and get a plain-language summary flagging fees, rate changes, and risk clauses.",
  openGraph: {
    title: "Financial Doc Explainer",
    description:
      "Plain-language summaries of financial documents — fees, rate changes, and risk clauses.",
    url: "https://financial-doc-explainer.vercel.app",
    siteName: "Financial Doc Explainer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Financial Doc Explainer",
    description:
      "Plain-language summaries of financial documents — fees, rate changes, and risk clauses.",
  },
};

export const viewport: Viewport = {
  colorScheme: "only light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
