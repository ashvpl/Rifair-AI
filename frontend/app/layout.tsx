import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Rifair AI | Interview Bias & Hiring Risk Intelligence",
  description: "Detect hidden bias in interview questions using AI.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#737373",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" suppressHydrationWarning>
        <body className="font-sans antialiased" suppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <ClerkProvider
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
        </body>
      </html>
  );
}
