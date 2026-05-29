import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Rifair AI | Operating System for Modern Hiring",
  description: "Detect hidden bias in interview questions using AI.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96" }
    ],
    apple: "/apple-touch-icon.png"
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
