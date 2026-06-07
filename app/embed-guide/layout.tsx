import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://emboditrust.com";

export const metadata: Metadata = {
  title: "Embed Verification Widget - SDK Integration Guide",
  description:
    "Integrate the EmbodiTrust verification widget into your website or application. Supports HTML, React, Next.js, Vue.js, and programmatic usage with easy 3-step setup.",
  openGraph: {
    title: "EmbodiTrust - Embed Verification Widget Guide",
    description:
      "Integrate the EmbodiTrust verification widget into your website or application. Supports HTML, React, Next.js, Vue.js, and programmatic usage.",
    url: `${siteUrl}/embed-guide`,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EmbodiTrust Verification Widget Integration Guide",
      },
    ],
  },
  twitter: {
    title: "EmbodiTrust - Embed Verification Widget Guide",
    description:
      "Integrate the EmbodiTrust verification widget into your website or application. Supports HTML, React, Next.js, Vue.js, and programmatic usage.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: `${siteUrl}/embed-guide`,
  },
};

export default function EmbedGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
