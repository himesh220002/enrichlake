import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/site/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Enricher — Free Company Enrichment, Local Discovery & B2B Research Workspaces",
    template: "%s | Enricher",
  },
  description:
    "Enricher is a free suite of web research workspaces: company enrichment from any domain, local business discovery, product and supplier sourcing with B2B pricing, web crawling, social intelligence, Meta ad research, Google SERP intelligence and launch-post generation — with source-aware dossiers and one-click export.",
  keywords: [
    "company enrichment",
    "domain enrichment",
    "local business discovery",
    "product sourcing tool",
    "B2B supplier finder",
    "web crawler",
    "social intelligence",
    "ad intelligence",
    "SERP intelligence",
    "lead dossiers",
    "free research tools",
    "B2B prospecting",
  ],
  authors: [{ name: "Enricher" }],
  creator: "Enricher",
  openGraph: {
    type: "website",
    siteName: "Enricher",
    title: "Enricher — Turn the open web into usable intelligence",
    description:
      "Ten free focused workspaces for company enrichment, local discovery, product sourcing, web crawling, social and ad intelligence.",
    images: [{ url: "/images/domainesearch.png", width: 1200, height: 630, alt: "Enricher research console" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enricher — Turn the open web into usable intelligence",
    description:
      "Free research workspaces: enrichment, discovery, sourcing, crawling, and social intelligence.",
    images: ["/images/domainesearch.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
