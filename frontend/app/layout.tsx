import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EquiHire AI | Interview Bias & Hiring Risk Intelligence",
  description: "Detect hidden bias in interview questions using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className="dark">
        <body className={inter.className}>
    <ClerkProvider
      appearance={{
        baseTheme: "dark",
        variables: {
          colorPrimary: "#6366F1",
          colorBackground: "#0B0F19",
          colorText: "#E5E7EB",
          borderRadius: "16px",
          fontFamily: "Inter, sans-serif",
        },
        elements: {
          card:
            "bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl",

          headerTitle:
            "text-white text-2xl font-semibold tracking-tight",

          headerSubtitle:
            "text-gray-400 text-sm",

          formButtonPrimary:
            "bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 hover:scale-[1.02] text-white font-medium transition-all duration-200",

          formFieldInput:
            "bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent",

          formFieldLabel:
            "text-gray-300",

          socialButtonsBlockButton:
            "bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all duration-200 hover:scale-[1.02]",

          footerActionLink:
            "text-indigo-400 hover:text-indigo-300",

          identityPreviewText:
            "text-white",

          formFieldSuccessText:
            "text-green-400",

          formFieldErrorText:
            "text-red-400",
        },
      }}
    >
      {children}
    </ClerkProvider>
        </body>
      </html>
  );
}
