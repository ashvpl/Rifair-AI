import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";
import { DEFAULT_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "Rifair AI | AI Interview Kits, Bias Checks & Hiring Scorecards",
    template: "%s | Rifair AI",
  },
  description: "Rifair AI helps HR teams generate structured interview kits, evaluate candidates with scorecards, analyze hiring bias, and optimize job descriptions using AI.",
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: "Rifair AI", url: "https://rifairai.com" }],
  creator: "Rifair AI",
  publisher: "Rifair AI",
  metadataBase: new URL("https://rifairai.com"),
  alternates: {
    canonical: "https://rifairai.com/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Rifair AI",
    title: "Rifair AI | AI Interview Kits, Bias Checks & Hiring Scorecards",
    description: "Generate interview kits, evaluate candidates, analyze bias, and optimize job descriptions with an AI hiring copilot built for HR teams.",
    url: "https://rifairai.com/",
    images: [
      {
        url: "https://rifairai.com/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Rifair AI - AI Hiring Copilot for Structured, Fair, and Faster Recruitment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rifair AI | AI Interview Kits, Bias Checks & Hiring Scorecards",
    description: "Generate interview kits, evaluate candidates, analyze bias, and optimize job descriptions with an AI hiring copilot built for HR teams.",
    images: ["https://rifairai.com/opengraph-image.png"],
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0F19",
};

// Validate Clerk Environment Variables
if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  console.warn("[CLERK] Warning: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not defined.");
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Production Safety: Prevent crash if keys are missing
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <html lang="en">
        <body className="bg-black text-white flex items-center justify-center min-h-screen font-sans">
          <div className="max-w-md p-8 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-xl text-center space-y-4">
            <h1 className="text-2xl font-bold text-red-500">Configuration Error</h1>
            <p className="text-white/60">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing. Please check your Vercel environment variables.</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://open-shiner-20.clerk.accounts.dev" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://open-shiner-20.clerk.accounts.dev" />
      </head>
      <body className="font-sans antialiased overflow-x-clip" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
              });
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((reg) => console.log('[SW] Service Worker registered:', reg.scope))
                    .catch((err) => console.error('[SW] Service Worker registration failed:', err));
                });
              }
            `,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            appearance={{
              variables: {
                colorPrimary: "#737373",
                borderRadius: "0rem",
                fontFamily: "Geist Mono, monospace",
              },
              elements: {
                card: "shadow-none border border-border rounded-none",
                formButtonPrimary: "bg-[#737373] hover:bg-[#525252] text-white font-semibold transition-all h-11 rounded-none",
                formFieldInput: "border-border focus:ring-2 focus:ring-[#737373]/20 rounded-none h-11",
              }
            }}
          >
            {children}
          </ClerkProvider>
        </ThemeProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EN7Q07D0WE"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EN7Q07D0WE');
          `}
        </Script>
      </body>
    </html>
  );
}
