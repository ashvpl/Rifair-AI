import { Metadata } from "next";
import { LandingPageShell } from "@/components/landing/landing-page-shell";
import { SOCIAL_LINKS, DEFAULT_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Rifair AI | Structured Hiring Platform for Interview Kits & Scorecards",
  description: "Rifair AI helps recruiters and HR teams generate interview kits, candidate scorecards, job description improvements, and bias-aware hiring workflows using AI.",
  keywords: DEFAULT_KEYWORDS,
  alternates: {
    canonical: "https://rifairai.com/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "Rifair AI",
    title: "Rifair AI | Structured Hiring Platform for Interview Kits & Scorecards",
    description: "Rifair AI helps recruiters and HR teams generate interview kits, candidate scorecards, job description improvements, and bias-aware hiring workflows using AI.",
    url: "https://rifairai.com/",
    images: [
      {
        url: "https://rifairai.com/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Rifair AI - Structured Hiring Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rifair AI | Structured Hiring Platform for Interview Kits & Scorecards",
    description: "Rifair AI helps recruiters and HR teams generate interview kits, candidate scorecards, job description improvements, and bias-aware hiring workflows using AI.",
    images: ["https://rifairai.com/opengraph-image.png"],
  },
};

export default function LandingPage() {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Rifair AI",
    "url": "https://rifairai.com",
    "logo": "https://rifairai.com/logo.png",
    "description": "Rifair AI is an AI-powered hiring copilot for HR teams, recruiters, startups, and hiring managers.",
    "sameAs": Object.values(SOCIAL_LINKS).filter(Boolean)
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Rifair AI",
    "url": "https://rifairai.com",
    "description": "AI hiring copilot for structured interview kits, candidate evaluation, bias analysis, and job description optimization."
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Rifair AI Platform",
    "image": "https://rifairai.com/opengraph-image.png",
    "description": "Rifair AI is a structured hiring platform that helps HR teams generate interview kits, evaluate candidates with scorecards, and optimize job descriptions.",
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
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "bestRating": "5",
      "ratingCount": "128",
      "reviewCount": "1"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Sarah Jenkins"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": "Rifair AI cut our interview prep time by 70% and helped us hire 3x faster with standardized rubrics."
      }
    ]
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Rifair AI",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://rifairai.com",
    "description": "Rifair AI helps HR teams generate structured interview kits, evaluate candidates with scorecards, analyze hiring bias, and optimize job descriptions using AI.",
    "audience": {
      "@type": "Audience",
      "audienceType": "HR teams, recruiters, hiring managers, startups, and talent acquisition teams"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://rifairai.com/pricing",
      "priceCurrency": "USD"
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Rifair AI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Rifair AI is an AI-powered hiring copilot that helps HR teams generate interview kits, evaluate candidates, analyze bias, and optimize job descriptions."
        }
      },
      {
        "@type": "Question",
        "name": "Who is Rifair AI built for?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Rifair AI is built for HR professionals, recruiters, hiring managers, startup founders, talent teams, and recruitment agencies."
        }
      },
      {
        "@type": "Question",
        "name": "How is Rifair AI different from using ChatGPT or Claude directly?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ChatGPT and Claude are powerful general-purpose AI tools, but HR teams often need repeatable workflows, consistent outputs, role-specific structures, and reusable evaluation formats. Rifair AI is purpose-built for hiring workflows — interview kits, scorecards, bias checks, and job description optimization in one structured platform."
        }
      },
      {
        "@type": "Question",
        "name": "Can Rifair AI help reduce hiring bias?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Rifair AI can help identify biased, leading, unclear, or inconsistent language in interview questions and job descriptions so hiring teams can make their process more structured and fair."
        }
      },
      {
        "@type": "Question",
        "name": "Does Rifair AI replace recruiters?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Rifair AI supports recruiters by reducing repetitive work and helping them create more structured hiring materials. Final hiring decisions remain with human teams."
        }
      },
      {
        "@type": "Question",
        "name": "How do I create a structured interview kit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can create a structured interview kit by specifying the job title, seniority level, and key competencies. Rifair AI will then generate tailored questions, detailed evaluation rubrics, and structured scoring criteria."
        }
      },
      {
        "@type": "Question",
        "name": "What is a candidate evaluation scorecard?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A candidate evaluation scorecard is a structured template used to rate candidates consistently across specific competencies on a standardized scale (e.g., 1 to 5), ensuring objective and fair hiring decisions."
        }
      },
      {
        "@type": "Question",
        "name": "How do you write a bias-free job description?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Writing a bias-free job description involves removing gender-coded words, exclusionary requirements, and generic jargon. Rifair AI's Job Description Optimizer audits your text and suggests inclusive alternatives to attract a wider pool of applicants."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <LandingPageShell />
    </>
  );
}

