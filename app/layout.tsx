import type { Metadata } from "next";

// @ts-ignore
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { NextAuthSessionProvider } from "@/providers/session-provider";
import CookieConsent from "@/components/CookieConsent";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://emboditrust.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "EmbodiTrust - Pharmaceutical Anti-Counterfeiting System",
    template: "%s | EmbodiTrust",
  },
  description:
    "Comprehensive solution to combat counterfeit pharmaceuticals in Nigeria. Verify product authenticity with QR codes, scratch codes, and AI-powered fraud detection.",
  keywords: [
    "pharmaceutical anti-counterfeiting",
    "product verification",
    "QR code authentication",
    "scratch code verification",
    "fraud detection",
    "NAFDAC compliance",
    "Nigeria",
    "supply chain security",
    "brand protection",
  ],
  authors: [{ name: "EmbodiTrust" }],
  creator: "EmbodiTrust",
  publisher: "EmbodiTrust",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "EmbodiTrust",
    title: "EmbodiTrust - Pharmaceutical Anti-Counterfeiting System",
    description:
      "Comprehensive solution to combat counterfeit pharmaceuticals in Nigeria. Verify product authenticity with QR codes, scratch codes, and AI-powered fraud detection.",
    url: siteUrl,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EmbodiTrust - Product Authentication & Verification Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EmbodiTrust - Pharmaceutical Anti-Counterfeiting System",
    description:
      "Comprehensive solution to combat counterfeit pharmaceuticals in Nigeria. Verify product authenticity with QR codes, scratch codes, and AI-powered fraud detection.",
    images: ["/og-image.png"],
    creator: "@emboditrust",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "EmbodiTrust",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description:
      "Comprehensive solution to combat counterfeit pharmaceuticals in Nigeria. Verify product authenticity with QR codes, scratch codes, and AI-powered fraud detection.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      url: `${siteUrl}/#contact`,
    },
    sameAs: [
      "https://twitter.com/emboditrust",
      "https://linkedin.com/company/emboditrust",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextAuthSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
              <CookieConsent />
              <ToastProvider />
            </QueryProvider>
          </ThemeProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}