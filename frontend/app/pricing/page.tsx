import type { Metadata } from "next";
import { PricingClient } from '@/components/pricing/PricingClient'
import { PLANS } from '@/lib/pricing/plans'
import { DEFAULT_KEYWORDS, PRICING_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Rifair AI Pricing | AI Hiring Tools for HR Teams",
  description: "Choose a Rifair AI plan to generate interview kits, evaluate candidates, analyze hiring bias, and optimize job descriptions for your team.",
  keywords: [...DEFAULT_KEYWORDS, ...PRICING_KEYWORDS],
  alternates: {
    canonical: "https://rifairai.com/pricing",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Rifair AI Pricing | AI Hiring Tools for HR Teams",
    description: "Choose a Rifair AI plan to generate interview kits, evaluate candidates, analyze hiring bias, and optimize job descriptions for your team.",
    url: "https://rifairai.com/pricing",
    type: "website",
    siteName: "Rifair AI",
    images: [
      {
        url: "https://rifairai.com/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Rifair AI Pricing - AI Hiring Tools for HR Teams",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rifair AI Pricing | AI Hiring Tools for HR Teams",
    description: "Choose a Rifair AI plan to generate interview kits, evaluate candidates, analyze hiring bias, and optimize job descriptions for your team.",
    images: ["https://rifairai.com/opengraph-image.png"],
  },
};

export default function PricingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Rifair AI Subscription Plans",
    "image": "https://rifairai.com/opengraph-image.png",
    "description": "Choose a Rifair AI subscription plan to generate structured interview kits, analyze hiring bias, and write inclusive job posts.",
    "brand": {
      "@type": "Brand",
      "name": "Rifair AI"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "0",
      "highPrice": "149",
      "offerCount": "3",
      "url": "https://rifairai.com/pricing"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PricingClient plans={PLANS} />
    </>
  );
}
